// Optional visual smoke test: pass a Playwright module path and Chrome executable.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.argv[2]),root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403).end();return}try{if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res)}catch{res.writeHead(404).end()}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.argv[3]});const page=await browser.newPage();
  await page.route(/https:\/\/(?:www\.googletagmanager\.com|[^/]*google-analytics\.com)\//,route=>route.abort());
  const results=[];
  for(const locale of ['', '/en'])for(const width of [1280,390])for(const slug of ['the-bog','the-drains','graven-valley','desiccated-castle','the-docks','the-deep']){
   await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:${server.address().port}${locale}/games/an-jing-wei-guang/walkthrough/${slug}/`);
   await page.locator('.classic-main > article img').evaluateAll(images=>images.forEach(i=>i.loading='eager'));
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.classic-main > article img')).every(i=>i.complete&&i.naturalWidth>0));
   const result=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,images:document.querySelectorAll('.classic-main > article img').length,open:document.querySelector('.classic-sidebar details').open}));
   assert.ok(result.documentWidth<=width,'Horizontal overflow: '+slug);assert.ok(result.images>=10,'Missing regional images: '+slug);
   if(width===390){assert.equal(result.open,false,'Mobile menu starts collapsed');await page.locator('.classic-sidebar summary').click();assert.equal(await page.locator('.classic-sidebar details').getAttribute('open'),'');await page.locator('.classic-sidebar summary').click()}
   else{
    assert.equal(result.open,true,'Desktop directory starts expanded');
    const before=await page.locator('.classic-main').evaluate(n=>n.clientWidth);
    await page.locator('.classic-sidebar summary').click();
    await page.waitForFunction(()=>document.querySelector('.classic-shell').classList.contains('classic-menu-collapsed'));
    assert.ok(await page.locator('.classic-main').evaluate(n=>n.clientWidth)>before,'Collapsed directory widens the article');
    await page.locator('.classic-sidebar summary').click();
    await page.waitForFunction(()=>!document.querySelector('.classic-shell').classList.contains('classic-menu-collapsed'));
   }
   if(width===390)await page.locator('.classic-sidebar summary').click();
   const group=page.locator('.classic-nav-group').nth(1),toggle=group.locator('button');
   assert.ok((await group.locator('h2 a').getAttribute('href')).endsWith('/walkthrough/'));
   await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   assert.equal(await group.locator('.classic-nav-group-items').isVisible(),false);
   await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   assert.equal(await group.locator('.classic-nav-group-items').isVisible(),true);
   if(width===390)await page.locator('.classic-sidebar summary').click();
   const image=page.locator('.classic-main > article a:has(img)').first();
   assert.equal(await image.getAttribute('target'),'_blank');
   await image.click();await page.locator('dialog[open]').waitFor();
   assert.ok(await page.locator('dialog img').evaluate(i=>i.complete&&i.naturalWidth>0));
   await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
   if((width===1280&&slug==='the-bog')||(width===390&&slug==='the-deep'))await page.screenshot({path:path.join(root,'_research/an-jing-wei-guang',`walkthrough-${locale?'en':'zh'}-${slug}-${width}.png`),fullPage:false});
   results.push({locale,slug,...result});
  }
  for(const locale of ['', '/en'])for(const width of [1280,390])for(const slug of ['world','the-bog','graven-valley','the-deep']){
   await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:${server.address().port}${locale}/games/an-jing-wei-guang/maps/${slug}/`);
   const structure=page.locator('.classic-map-structure');if(await structure.count())await structure.locator('summary').click();
   const diagram=page.locator('.classic-world-map img');await diagram.evaluate(i=>i.loading='eager');
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.classic-world-map img')).every(i=>i.complete&&i.naturalWidth>0));
   assert.ok((await diagram.getAttribute('src')).endsWith(locale?'-en.svg':'-zh.svg'));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Map must not overflow the page');
   if(slug!=='world')assert.ok(await page.locator('.classic-main > article table tbody tr').count()>=3);
   if(locale)assert.doesNotMatch(await page.locator('.classic-main > article').innerText().then(t=>t.replaceAll('好吃的香草雪球','')),/[\u3400-\u9fff]/);
   await page.locator('.classic-world-map a').click();await page.locator('dialog[open]').waitFor();await page.keyboard.press('Escape');
   if(!locale&&width===1280&&['world','graven-valley'].includes(slug))await page.screenshot({path:path.join(root,'_research/an-jing-wei-guang',`map-first-edition-${slug}.png`),fullPage:true});
   results.push({locale,width,map:slug});
  }
  console.log(JSON.stringify(results,null,2));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
