const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),origin='https://gamenote.cc';
const translations=require('../content/i18n/en.json');
const ctx={window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};for(const f of ['content.js','content.en.js'])vm.runInNewContext(fs.readFileSync(path.join(root,'assets',f),'utf8'),ctx);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function seo(html,url,title,description){
 html=html.replace(/<link[^>]+rel="alternate"[^>]*>/g,'').replace(/<meta property="og:(?:title|description|url)"[^>]*>/g,'');
 if(!html.includes('rel="canonical"'))html=html.replace('</head>',`<link rel="canonical" href="${origin+url}"></head>`);
 const zh=url.replace(/^\/en\//,'/');
 return html.replace('</head>',`<link rel="alternate" hreflang="zh-CN" href="${origin+zh}"><link rel="alternate" hreflang="en" href="${origin+'/en'+zh}"><link rel="alternate" hreflang="x-default" href="${origin+zh}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin+url}"></head>`);
}
const routes=['','games/','notes/','updates/','about/','search/'];
for(const route of routes){
 const source=path.join(root,route,'index.html');let zh=fs.readFileSync(source,'utf8');
 zh=zh.replaceAll("Every game I've taken the time to map, document and understand.",'认真探索、记录并整理过的游戏，都收录在这里。');
 const title=zh.match(/<title>(.*?)<\/title>/s)[1],desc=zh.match(/name="description" content="([^"]*)"/)[1];
 zh=seo(zh,'/'+route,title,desc);fs.writeFileSync(source,zh);
 let en=zh.replace('lang="zh-CN"','lang="en"').replaceAll('认真探索、记录并整理过的游戏，都收录在这里。','An archive of games carefully explored, documented and understood.');
 for(const [from,to] of Object.entries(translations.text).sort((a,b)=>b[0].length-a[0].length))en=en.split(from).join(to);
 en=en.replace(/https:\/\/gamenote\.cc\/(?!en\/)/g,origin+'/en/');
 en=en.replace(/(?:href|action)="\/(games|notes|updates|about|search)\//g,m=>m.replace('="/','="/en/'));
 en=en.replace('href="styles.css"','href="/styles.css"').replace('<script src="/assets/site.js">','<script src="/assets/content.en.js"></script><script src="/assets/site.js">');
 const et=en.match(/<title>(.*?)<\/title>/s)[1],ed=en.match(/name="description" content="([^"]*)"/)[1];en=seo(en,'/en/'+route,et,ed);
 const dest=path.join(root,'en',route,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,en);
}
for(const note of ctx.window.GAMENOTE_CONTENT.notes){
 const route='notes/'+note.slug+'/',source=path.join(root,route,'index.html');let zh=fs.readFileSync(source,'utf8');
 zh=seo(zh,'/'+route,zh.match(/<title>(.*?)<\/title>/s)[1],zh.match(/name="description" content="([^"]*)"/)[1]);fs.writeFileSync(source,zh);
 const body=translations.articles[note.slug].map(p=>p.startsWith('“')?`<blockquote><p>${esc(p)}</p></blockquote>`:`<p>${esc(p)}</p>`).join('\n');
 const game=note.game&&ctx.window.GAMENOTE_CONTENT.games.find(g=>g.id===note.game);
 let en=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(note.title)} | GAME NOTE</title><meta name="description" content="${esc(note.description)}"><link rel="canonical" href="${origin+'/en/'+route}"><link rel="stylesheet" href="/styles.css"></head><body><div data-site-header></div><article class="article"><header><p class="eyebrow coral">${note.categoryLabel}</p><h1>${esc(note.title)}</h1><p class="article-lead">${esc(note.description)}</p><time datetime="${note.date}">${note.date}</time></header><section aria-label="Article">${body}</section>${game?`<aside class="related-game"><p class="eyebrow coral">RELATED GAME</p><b>${game.title}</b><p><a class="text-link" href="${game.guideUrl}">Open guide (Chinese) →</a></p></aside>`:''}</article><div data-site-footer></div><script src="/assets/content.js"></script><script src="/assets/content.en.js"></script><script src="/assets/site.js"></script></body></html>`;
 en=seo(en,'/en/'+route,note.title+' | GAME NOTE',note.description);const dest=path.join(root,'en',route,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,en);
}
const sitemap=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8').replace(/\s*<url><loc>https:\/\/gamenote.cc\/en\/(?!updates\/[^/]+\/)[^<]*<\/loc><\/url>/g,'');xml=xml.replace('</urlset>',[...routes,...ctx.window.GAMENOTE_CONTENT.notes.map(n=>'notes/'+n.slug+'/')].map(r=>`<url><loc>${origin+'/en/'+r}</loc></url>`).join('\n')+'\n</urlset>');fs.writeFileSync(sitemap,xml);
console.log('Generated 10 English pages and reciprocal language SEO links.');
