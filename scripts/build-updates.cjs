const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const routes=require('../assets/routes.js'),root=path.resolve(__dirname,'..'),origin='https://gamenote.cc',escape=routes.escape;
function metadata(en){const ctx={window:{GAMENOTE_ROUTES:routes}};for(const file of ['content.js',...(en?['content.en.js']:[])])vm.runInNewContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),ctx);return ctx.window.GAMENOTE_CONTENT}
const urls=[];
for(const en of [false,true]){
 const data=metadata(en),prefix=en?'/en/':'/',seen=new Set();
 for(const update of data.updates){
  if(seen.has(update.slug))throw Error('Duplicate update slug');seen.add(update.slug);
  const url=routes.updateUrl(update.slug,en),game=data.games.find(game=>game.id===update.game),project=game?(en?game.title:game.titleZh):'GAME NOTE';
  const related=update.relatedUrl==='/updates/'?prefix+'updates/':update.relatedUrl;
  const crumbs=[{label:'GAME NOTE',href:prefix},{label:'Updates',href:prefix+'updates/'},{label:update.title,href:url,current:true}];
  const zh=routes.updateUrl(update.slug),english=routes.updateUrl(update.slug,true);
  const html=`<!doctype html><html lang="${en?'en':'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(update.title)} | GAME NOTE</title><meta name="description" content="${escape(update.description)}"><link rel="canonical" href="${origin+url}"><link rel="alternate" hreflang="zh-CN" href="${origin+zh}"><link rel="alternate" hreflang="en" href="${origin+english}"><link rel="alternate" hreflang="x-default" href="${origin+zh}"><meta property="og:title" content="${escape(update.title)}"><meta property="og:description" content="${escape(update.description)}"><meta property="og:url" content="${origin+url}"><meta property="og:type" content="article"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/navigation.css"><script type="application/ld+json" data-breadcrumb-schema>${routes.schema(crumbs)}</script></head><body><div data-site-header></div><article class="article">${routes.breadcrumb(crumbs)}<header><p class="eyebrow coral">UPDATE · ${escape(update.type)} · ${escape(project)}</p><h1>${escape(update.title)}</h1><time datetime="${update.date}">${update.date}</time></header><section aria-label="${en?'Update details':'更新详情'}"><p>${escape(update.description)}</p></section>${related?`<aside class="related-game" data-pagefind-ignore><p class="eyebrow coral">${en?'RELATED SECTION':'相关栏目'}</p><p><a class="text-link" href="${escape(related)}" target="_blank" rel="noopener noreferrer">${en?'Open related section':'查看相关栏目'} · ${escape(project)} →</a></p></aside>`:''}<nav class="note-navigation" aria-label="${en?'Update navigation':'更新导航'}"><a href="${prefix}updates/">${en?'Back to Updates':'返回更新列表'}</a></nav></article><div data-site-footer></div><script src="/assets/routes.js"></script><script src="/assets/content.js"></script>${en?'<script src="/assets/content.en.js"></script>':''}<script src="/assets/site.js"></script></body></html>`;
  const file=path.join(root,url,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html+'\n');urls.push(url);
 }
}
const sitemap=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8');
for(const url of urls)if(!xml.includes('<loc>'+origin+url+'</loc>'))xml=xml.replace('</urlset>',`<url><loc>${origin+url}</loc></url>\n</urlset>`);
fs.writeFileSync(sitemap,xml);console.log(`Generated ${urls.length} update detail pages (Chinese + English).`);
