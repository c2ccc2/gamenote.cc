const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const g=require('./lib/astlibra-guide.cjs');
const root=path.resolve(__dirname,'..');
const routes=require('../content/games/astlibra-revision/published-routes.json');
const renderedImages=new Set(),renderedBlocks=new Set();
assert.equal(g.pickups.length,104,'Source chest inventory changed; review chapter grouping');
assert.equal(g.skills.reduce((n,p)=>n+p.sections.length,0),96,'KARON entries lost during grouping');
assert.equal(g.docs['flow-upper'].blocks.filter(b=>b.kind==='image').length+g.docs['flow-lower'].blocks.filter(b=>b.kind==='image').length,128);
for(const route of routes){
 const file=path.join(root,route.slice(1),'index.html'),html=fs.readFileSync(file,'utf8'),$=cheerio.load(html);
 assert.equal($('h1').length,1,route);
 assert.equal($('link[rel=canonical]').attr('href'),'https://gamenote.cc'+route);
 assert.equal($('meta[name=robots][content*=noindex]').length,0,route);
 assert.equal($('[data-breadcrumb-schema]').length,1,route);
 assert.equal($('a[aria-current=page]').length,1,'Sidebar current page: '+route);
 assert.ok(!/框架搭建中|内容待整理|框架已建立|C:\\Users\\|\.minimax|全游戏攻略索引|本攻略\)/.test($('article').text()),route);
 const ids=$('[id]').toArray().map(n=>$(n).attr('id'));assert.equal(ids.length,new Set(ids).size,'Duplicate anchor: '+route);
 assert.equal($('.astlibra-spoiler[open]').length,0,'Plot choices must start collapsed');
 $('[data-source-doc][data-source-block]').each((_,n)=>renderedBlocks.add($(n).attr('data-source-doc')+':'+$(n).attr('data-source-block')));
 $('img').each((_,n)=>{const img=$(n),src=img.attr('src');renderedImages.add(src);const asset=g.data.assets[src];assert.ok(asset,'Unknown asset '+src);assert.equal(+img.attr('width'),asset.width);assert.equal(+img.attr('height'),asset.height);assert.ok(img.attr('alt'));});
 $('a[href]').each((_,n)=>{
  const href=$(n).attr('href'),url=new URL(href,'https://gamenote.cc'+route);if(url.origin!=='https://gamenote.cc')return;
  const target=path.join(root,decodeURIComponent(url.pathname));const resolved=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
  assert.ok(fs.existsSync(resolved),'Broken destination '+href+' on '+route);
  if(url.hash&&resolved.endsWith('.html')){const other=cheerio.load(fs.readFileSync(resolved,'utf8'));assert.ok(other('[id]').toArray().some(n=>other(n).attr('id')===decodeURIComponent(url.hash.slice(1))),'Broken anchor '+href+' on '+route);}
 });
}
for(const [src,asset]of Object.entries(g.data.assets)){
 assert.ok(renderedImages.has(src),'Imported illustration not used: '+src);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,src))).digest('hex'),asset.sha256,'Changed illustration: '+src);
}
for(const doc of g.data.documents)for(const [i,b]of doc.blocks.entries())if(b.kind==='image')assert.ok(renderedBlocks.has(doc.id+':'+i),'Unplaced source illustration '+doc.id+':'+i);
const chapter6=cheerio.load(fs.readFileSync(path.join(root,'games/astlibra-revision/walkthrough/chapter-6/index.html'),'utf8'));
assert.ok(chapter6('#snow').length&&chapter6('#green-rune').length&&chapter6('#escape').length,'Sixth chapter must join both source articles');
const chestPage=cheerio.load(fs.readFileSync(path.join(root,'games/astlibra-revision/collectibles/index.html'),'utf8'));
assert.equal(chestPage('[data-astlibra-row]').length,104);
assert.equal(chestPage('input[type=checkbox], [data-astlibra-progress]').length,0);
for(const page of g.collections)for(const chest of page.records)assert.ok(fs.readFileSync(path.join(root,page.href,'index.html'),'utf8').includes(`id="${chest.id}"`));
console.log(`Verified ${routes.length} Astlibra pages, ${g.pickups.length} unique chest records, 96 skills, all source illustrations and their integrity.`);
