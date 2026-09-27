const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cheerio=require('cheerio');
const routes=require('../assets/routes.js'),{loadClassicData,confirmed,canPublish}=require('./lib/classic-data.cjs');
const root=path.resolve(__dirname,'..'),origin='https://gamenote.cc',base='/games/an-jing-wei-guang/';
function content(en){const context={window:{GAMENOTE_ROUTES:routes}};for(const file of ['content.js',...(en?['content.en.js']:[])])vm.runInNewContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),context);return context.window.GAMENOTE_CONTENT}
const zh=content(false),english=content(true),data=loadClassicData(root),escape=routes.escape;
const records={walkthrough:[...data.areas,...data.walkthroughs],maps:data.areas,bosses:data.bosses,abilities:data.abilities,collectibles:data.collectibles,quests:data.quests,achievements:data.achievements};
const names={games:'Games',notes:'Notes',updates:'Updates',about:'About',search:'Search',walkthrough:'流程攻略',maps:'地图',bosses:'Boss',abilities:'能力',collectibles:'收集',quests:'任务',challenges:'挑战',achievements:'成就',systems:'系统',secrets:'隐藏内容', 'key-items':'Key Items','time-trials':'Time Trials'};
const enNames={walkthrough:'Walkthrough',maps:'Maps',bosses:'Bosses',abilities:'Abilities',collectibles:'Collectibles',quests:'Quests',challenges:'Challenges',achievements:'Achievements',systems:'Systems',secrets:'Secrets'};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):entry.name.endsWith('.html')?[path.join(dir,entry.name)]:[])}
const pages=[path.join(root,'index.html'),...['games','notes','updates','about','search','en'].flatMap(dir=>files(path.join(root,dir)))];
function noteCard(note,en,shared){const game=shared.games.find(g=>g.id===note.game),url=(en?'/en':'')+note.url;return `<article class="note-card"><p class="eyebrow coral">${escape(note.categoryLabel)}</p><h3><a href="${url}" target="_blank" rel="noopener noreferrer">${escape(note.title)}</a></h3><p>${escape(note.description)}</p><div class="note-meta"><time datetime="${note.date}">${note.date.replaceAll('-','/')}</time>${game?`<a href="${game.guideUrl}">${escape(en?game.title:game.titleZh)}</a>`:''}</div><a class="text-link" href="${url}" target="_blank" rel="noopener noreferrer">${en?'Read note':'阅读手记'} <b>→</b></a></article>`}
let indexed=0;
for(const file of pages){
 const url='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,''),en=url.startsWith('/en/'),current=url.replace(/^\/en\//,'/'),prefix=en?'/en/':'/',shared=en?english:zh;
 let $=cheerio.load(fs.readFileSync(file,'utf8'));const classic=$('body').hasClass('classic');
 $('link[href="/assets/image-viewer.css"],script[src="/assets/image-viewer.js"]').remove();
 $('head').append('<link rel="stylesheet" href="/assets/image-viewer.css">');$('body').append('<script src="/assets/image-viewer.js" defer></script>');
 $('article img,main figure img').each((_,node)=>{const img=$(node);if(!img.closest('a').length&&/^\//.test(img.attr('src')||''))img.wrap(`<a href="${escape(img.attr('src'))}" target="_blank" rel="noopener noreferrer"></a>`)});
 $('a[href]').each((_,node)=>{const a=$(node);if(a.find('img').length&&/\.(webp|png|jpe?g|gif|avif|svg)(?:[?#]|$)/i.test(a.attr('href')))a.attr({target:'_blank',rel:'noopener noreferrer'})});
 // Discard the retired empty modern game route without changing the actual guide.
 if(current==='/games/well-dweller/'){
  $('meta[http-equiv=refresh],meta[name=robots]').remove();$('head').append(`<meta http-equiv="refresh" content="0; url=${base}"><meta name="robots" content="noindex,follow">`);$('link[rel=canonical]').attr('href',origin+base);$('main').html(`<p><a href="${base}">前往《黯井微光》攻略专题 →</a></p>`);fs.writeFileSync(file,$.html());continue;
 }
 $('link[href="/assets/navigation.css"]').remove();$('head').append('<link rel="stylesheet" href="/assets/navigation.css">');
 $('script[src="/assets/routes.js"]').remove();const source=$('script[src="/assets/content.js"]').first();if(source.length)source.before('<script src="/assets/routes.js"></script>');
 $('.site-breadcrumb,.classic-crumb,.note-navigation').remove();
 $('script[type="application/ld+json"]').each((_,node)=>{if($(node).text().includes('BreadcrumbList'))$(node).remove()});
 const title=$('h1').first().text().trim()||$('title').text(),segments=current.split('/').filter(Boolean);
 if(segments.length){
  const items=[{label:'GAME NOTE',href:prefix}];let accumulated=prefix;
  segments.forEach((segment,index)=>{accumulated+=segment+'/';const last=index===segments.length-1;items.push({label:last?title:segment==='an-jing-wei-guang'?(en?'Well Dweller':'黯井微光'):en?(enNames[segment]||names[segment]):names[segment]||segment,href:accumulated,current:last})});
  const target=classic?$('.classic-main'):$('.article').length?$('.article'):$('main').first();
  target.prepend(routes.breadcrumb(items,classic?'classic':'modern'));$('head').append(`<script type="application/ld+json" data-breadcrumb-schema>${routes.schema(items)}</script>`);
 }
 // Render existing JS collections at build time, so links and search work without JS.
 $('[data-notes]').each((_,node)=>{const value=$(node).attr('data-notes'),limit=Number(value)||shared.notes.length;$(node).html([...shared.notes].filter(note=>note.listed!==false).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,limit).map(note=>noteCard(note,en,shared)).join(''))});
 $('[data-updates]').each((_,node)=>{const limit=Number($(node).attr('data-updates'))||shared.updates.length;$(node).html(shared.updates.slice(0,limit).map(update=>{const game=shared.games.find(game=>game.id===update.game),url=(en?'/en':'')+update.url;return `<article class="update-item"><time datetime="${update.date}">${update.date.replaceAll('-','/')}</time><div><span class="update-project">${escape(game?(en?game.title:game.titleZh):'GAME NOTE')}</span><a href="${url}" target="_blank" rel="noopener noreferrer">${escape(update.title)}</a><p>${escape(update.description)}</p></div><span class="update-type">${escape(update.type)}</span></article>`}).join(''))});
 $('[data-games]').each((_,node)=>{const games=($(node).attr('data-games')==='featured'?shared.games.filter(game=>game.featured):shared.games).slice().sort((a,b)=>a.order-b.order);$(node).html(games.map(game=>{const title=en?game.title:game.titleZh,complete=game.status==='Complete';return `<article class="game-card"><a class="game-cover-link" href="${game.guideUrl}"><img src="${game.cover}" alt="${escape(title)}" loading="lazy"></a><div class="game-copy"><div class="card-topline"><span class="status ${complete?'status--complete':''}">${en?(complete?'Complete':'In Progress'):(complete?'已完成':'整理中')}</span></div><h3><a href="${game.guideUrl}">${escape(title)}</a></h3><p>${escape(game.description)}</p><div class="section-tags">${game.sections.map(section=>`<span>${escape(section)}</span>`).join('')}</div><a class="text-link" href="${game.guideUrl}">${en?'Open guide':'打开攻略档案'} <b>→</b></a></div></article>`}).join(''))});
 const note=shared.notes.find(note=>current==='/notes/'+note.slug+'/');
 if(note){
  $('.related-game').remove();const game=shared.games.find(game=>game.id===note.game);
  if(game)$('.article').append(`<aside class="related-game" data-pagefind-ignore><p class="eyebrow coral">RELATED GAME</p><b>${escape(en?game.title:game.titleZh)}</b><p><a class="text-link" href="${game.guideUrl}">${en?'Open guide':'查看攻略专题'} →</a></p></aside>`);
  const other=shared.notes.filter(other=>other.listed!==false&&other.slug!==note.slug&&other.category===note.category);
  $('.article').append(`<nav class="note-navigation" aria-label="${en?'Note navigation':'手记导航'}"><a href="${prefix}notes/">${en?'Back to Notes':'返回手记目录'}</a><a href="${prefix}notes/?category=${note.category}">${escape(note.categoryLabel)}</a>${other.slice(0,2).map(other=>`<a href="${(en?'/en':'')+other.url}">${en?'Related: ':'相关文章：'}${escape(other.title)}</a>`).join('')}</nav>`);
 }
 const update=shared.updates.find(update=>current===update.url);
 if(update)$('.article').append(`<nav class="note-navigation" aria-label="${en?'Update navigation':'更新导航'}"><a href="${prefix}updates/">${en?'Back to Updates':'返回更新列表'}</a></nav>`);
 if(note?.listed===false){$('meta[data-note-archive]').remove();$('head').append('<meta name="robots" content="noindex,follow" data-note-archive>')}
 $('a[href]').each((_,node)=>{if(/^\/(?:en\/)?(?:notes|updates)\/[^/?#]+\/$/.test($(node).attr('href')))$(node).attr({target:'_blank',rel:'noopener noreferrer'})});
 const search=current==='/search/';
 if(search){
  $('.page-intro .lead').text(en?'Search the published guides, notes and updates.':'搜索已公开的攻略、创作手记与更新记录。');
  $('.search-box').attr({'action':prefix+'search/','data-search-form':''});$('.search-box button').text(en?'Search':'搜索');$('.empty-search').remove();
  $('[data-search-status],[data-search-results],[data-search-more]').remove();$('.page-intro').append(`<p data-search-status role="status" aria-live="polite">${en?'Enter a keyword to search GAME NOTE.':'输入关键词搜索 GAME NOTE。'}</p><ol class="search-results" data-search-results></ol><button class="button button--quiet search-more" type="button" data-search-more hidden>${en?'More results':'更多结果'}</button>`);
  $('script[src="/assets/search.js"]').remove();$('body').append('<script src="/assets/search.js" defer></script>');
 }
 $('[data-pagefind-body]').removeAttr('data-pagefind-body');$('[data-search-meta]').remove();
 let indexable=!search&&!/noindex/.test($('meta[name=robots]').attr('content')||'');
 if(classic){
  const parts=current.slice(base.length).split('/').filter(Boolean);
  if(parts.length>=2&&!(parts[0]==='maps'&&parts[1]==='world')){let record=records[parts[0]]?.find(record=>record.slug===parts[1]);if(parts[0]==='collectibles'&&parts[1]==='key-items'&&parts[2])record=data.keyItems.find(record=>record.slug===parts[2]);indexable=indexable&&!!record&&canPublish(record);}
 }
 if(indexable){
  (classic?$('.classic-main > article'):$('.article').length?$('.article'):$('main').first()).attr('data-pagefind-body','');indexed++;
  const type=note?'Note':update?'Update':classic?(names[current.slice(base.length).split('/')[0]]||'Game'):(names[segments[0]]||'Home');
  const metadata={title,type,...(update?{category:update.type,...(update.game?{game:shared.games.find(game=>game.id===update.game)?.titleZh||''}:{})}:{}),...(classic?{game:'黯井微光 / Well Dweller'}:{}),...(note?{category:note.categoryLabel,...(note.game?{game:shared.games.find(g=>g.id===note.game)?.titleZh||''}:{})}:{})};
  for(const [key,value] of Object.entries(metadata))$('head').append(`<meta data-search-meta data-pagefind-meta="${key}[content]" content="${escape(value)}">`);
 }
 $('.classic-sidebar,.classic-banner,#related-notes,[data-site-header],[data-site-footer]').attr('data-pagefind-ignore','all');
 fs.writeFileSync(file,$.html()+'\n');
}
const sitemap=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8');for(const note of zh.notes.filter(note=>note.listed===false))for(const url of [note.url,'/en'+note.url])xml=xml.replace('<url><loc>'+origin+url+'</loc></url>','');fs.writeFileSync(sitemap,xml);
console.log(`Unified navigation on ${pages.length} pages; ${indexed} pages allowed into Pagefind.`);
