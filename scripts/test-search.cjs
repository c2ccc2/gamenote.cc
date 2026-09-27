// Optional browser acceptance test. Set PLAYWRIGHT_MODULE and CHROME_PATH for a local runtime.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.pagefind':'application/octet-stream','.jpg':'image/jpeg','.png':'image/png','.avif':'image/avif','.webp':'image/webp'};
async function main(){
 const server=http.createServer((req,res)=>{let target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403).end();return}if(/^\/(?:_research|content|scripts|node_modules)\//.test(req.url)){res.writeHead(404).end();return}if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');if(!fs.existsSync(target)){res.writeHead(404).end();return}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(fs.readFileSync(target))});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  await page.context().route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  page.on('pageerror',error=>errors.push(error.message));
  const terms=['黯井微光','Well Dweller','Groundskeeper','Trinkets','攻略','游戏','地图','收集','为什么还要重新整理一份游戏攻略','为什么《黯井微光》攻略看起来像二十年前的网站','xxxxxxxxxxxxxx'];
  const report=[];
  for(const term of terms){
   await page.goto(origin+'/search/?q='+encodeURIComponent(term));
   await page.waitForFunction(()=>/找到|没有找到|暂时不可用/.test(document.querySelector('[data-search-status]').textContent));
   const state=await page.locator('[data-search-status]').textContent();assert.ok(!state.includes('暂时不可用'),state);
   if(!state.includes('没有找到'))await page.waitForSelector('.search-result');
   const links=await page.locator('.search-result h2 a').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname));
   const allLinks=await page.evaluate(async term=>{const p=await import('/pagefind/pagefind.js');const response=await p.search(term);return Promise.all(response.results.map(async result=>(await result.data()).url))},term);
   if(term==='黯井微光'){assert.ok(allLinks.includes('/games/an-jing-wei-guang/'));assert.ok(allLinks.includes('/notes/why-an-jing-wei-guang-looks-like-an-old-guide-site/'))}
   if(term==='攻略')assert.ok(allLinks.includes('/notes/why-organize-game-guides-again/'));
   if(term==='xxxxxxxxxxxxxx')assert.equal(links.length,0);else if(!links.length){
    console.log(await page.evaluate(async()=>{const p=await import('/pagefind/pagefind.js');return {entry:await(await fetch('/pagefind/pagefind-entry.json')).json(),tests:await Promise.all(['黯井微光','微光','攻略','Well','Groundskeeper','Trinkets'].map(async q=>({q,...await p.search(q)})))}}));
    assert.ok(links.length>0,'No results: '+term);
   }
   if(term==='Groundskeeper')assert.ok(links.includes('/games/an-jing-wei-guang/bosses/the-groundskeeper/'));
   if(term==='Trinkets')assert.ok(links.includes('/games/an-jing-wei-guang/collectibles/trinkets/'));
   for(const url of allLinks){const html=fs.readFileSync(path.join(root,url,'index.html'),'utf8');assert.ok(html.includes('data-pagefind-body'),'Excluded page in results: '+url);assert.ok(!url.includes('_research'));assert.ok(!url.includes('/bosses/the-colony/'))}
   report.push({term,state,displayed:links.length});
  }
  await page.goto(origin+'/search/');assert.match(await page.locator('[data-search-status]').textContent(),/输入关键词/);
  assert.equal(await page.locator('[data-search-more]').isVisible(),false);
  await page.locator('[name=q]').fill('Groundskeeper');await page.locator('[data-search-form] button').click();await page.waitForSelector('.search-result');assert.ok(new URL(page.url()).searchParams.get('q')==='Groundskeeper');
  await page.goto(origin+'/en/search/?q=Groundskeeper');await page.waitForSelector('.search-result');
  for(const width of [375,390,430]){
   await page.setViewportSize({width,height:900});
   for(const url of ['/search/?q=黯井微光','/notes/','/notes/why-an-jing-wei-guang-looks-like-an-old-guide-site/','/games/','/updates/','/about/','/games/an-jing-wei-guang/bosses/the-groundskeeper/','/games/an-jing-wei-guang/walkthrough/chapter-01/','/games/an-jing-wei-guang/walkthrough/night-garden/']){
    await page.goto(origin+url);if(url.startsWith('/search/'))await page.waitForSelector('.search-result');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+width+' '+url);
    assert.equal(await page.locator('.site-breadcrumb,.classic-crumb').count(),1);
   }
  }
  await page.goto(origin+'/notes/');assert.equal(await page.locator('.note-card h3 a').count(),2);
  assert.equal(await page.locator('.note-card h3 a[target="_blank"]').count(),2);
  const notePopupPromise=page.waitForEvent('popup');await page.locator('.note-card h3 a').first().click();const notePopup=await notePopupPromise;await notePopup.waitForLoadState();assert.ok(notePopup.url().includes('/notes/why-organize-game-guides-again/'));await notePopup.close();
  for(const href of await page.locator('.note-card h3 a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')))){const response=await page.goto(origin+href);assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1)}
  await page.goto(origin+'/notes/?category=map-making');assert.equal(await page.locator('.note-card').count(),0);
  for(const prefix of ['/','/en/']){
   await page.goto(origin+prefix+'notes/');assert.equal(await page.locator('.note-card').count(),2);
   await page.goto(origin+prefix+'updates/');assert.equal(await page.locator('.update-item').count(),7);
   const updateLinks=await page.locator('.update-item a').evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute('href'),target:node.target,rel:node.rel})));
   for(const item of updateLinks){assert.equal(item.target,'_blank');assert.ok(item.rel.includes('noopener'));assert.ok(item.href.startsWith(prefix+'updates/'));const response=await page.goto(origin+item.href);assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.related-game a[target="_blank"]').count(),1);assert.equal(await page.locator('.note-navigation').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
   await page.goto(origin+prefix+'updates/');const popupPromise=page.waitForEvent('popup');await page.locator('.update-item a').first().click();const popup=await popupPromise;await popup.waitForLoadState();assert.ok(popup.url().includes(prefix+'updates/well-dweller-v1-database/'));const sectionPromise=popup.waitForEvent('popup');await popup.locator('.related-game a').click();const section=await sectionPromise;await section.waitForLoadState();assert.ok(section.url().includes('/games/an-jing-wei-guang/'));await section.close();await popup.close();
  }
  await page.goto(origin+'/games/');if(!await page.locator('.site-header a[href="/search/"]').isVisible())await page.locator('.menu-toggle').click();await page.locator('.site-header a[href="/search/"]').click();assert.ok(page.url().endsWith('/search/'));
  await page.goto(origin+'/search/?q=黯井微光');await page.waitForSelector('.search-result');
  fs.mkdirSync(path.join(root,'.navigation-test'),{recursive:true});
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.goto(origin+'/games/an-jing-wei-guang/walkthrough/night-garden/');await page.locator('.classic-main > article img').last().scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('.classic-main > article img')].every(i=>i.complete&&i.naturalWidth===852));assert.equal(await page.locator('.classic-main > article img').count(),5);assert.equal(await page.locator('.classic-banner').count(),0);await page.screenshot({path:path.join(root,'.navigation-test','p1-'+width+'.png'),fullPage:true})}
  await page.screenshot({path:process.env.SCREENSHOT_PATH||path.join(root,'.navigation-test','search-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({searches:report,mobileWidths:[375,390,430],runtimeErrors:errors},null,2));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1});
