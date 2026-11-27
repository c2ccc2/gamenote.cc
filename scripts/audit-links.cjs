const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..');let count=0,pages=0;
const idsByFile=new Map();
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):entry.name.endsWith('.html')?[path.join(dir,entry.name)]:[])}
for(const file of [...fs.readdirSync(root).filter(name=>/^(?:index|en|catalog|news|games|notes|updates|about|search)\.html$/.test(name)).map(name=>path.join(root,name)),...['catalog','games','notes','updates','about','search','en'].flatMap(dir=>files(path.join(root,dir)))]){
 const $=cheerio.load(fs.readFileSync(file,'utf8'));pages++;
 $('a[href],link[href],script[src],img[src],form[action]').each((_,node)=>{
  const value=$(node).attr('href')||$(node).attr('src')||$(node).attr('action');assert.ok(value&&value!=='#'&&!/^javascript:/i.test(value),'Empty/unsafe link in '+file);
  const url=new URL(value,'https://gamenote.cc/'+path.relative(root,file).replaceAll('\\','/'));if(url.origin!=='https://gamenote.cc')return;
  assert.ok(!url.pathname.includes('//'),'Double slash: '+value);
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname));assert.ok(target.startsWith(root+path.sep)||target===root,'Escaping URL');
  const resolved=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;assert.ok(fs.existsSync(resolved),'Broken '+value+' in '+file);
  if(url.hash&&resolved.endsWith('.html')){if(!idsByFile.has(resolved)){const other=cheerio.load(fs.readFileSync(resolved,'utf8'));idsByFile.set(resolved,new Set(other('[id]').toArray().map(node=>other(node).attr('id'))))}assert.ok(idsByFile.get(resolved).has(decodeURIComponent(url.hash.slice(1))),'Missing anchor '+value)}count++;
 });
 if(!/noindex/.test($('meta[name=robots]').attr('content')||'')&&!['/index.html','/en/index.html','/en.html'].includes('/'+path.relative(root,file).replaceAll('\\','/'))){assert.equal($('.site-breadcrumb,.classic-crumb').length,1,'Breadcrumb missing: '+file);assert.equal($('[data-breadcrumb-schema]').length,1)}
}
console.log(`Audited ${count} local links/assets across ${pages} HTML pages.`);
