// Final public-page pass: reader copy, provenance, article metadata and a fresh sitemap.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cheerio=require('cheerio');
const {loadClassicData,confirmed}=require('./lib/classic-data.cjs');
const root=path.resolve(__dirname,'..'),origin='https://gamenote.cc',base='/games/an-jing-wei-guang/',today='2026-09-27';
const data=loadClassicData(root),summaries=require('../content/games/an-jing-wei-guang/region-summaries.json');
const sharedContext={window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/content.js'),'utf8'),sharedContext);
const shared=sharedContext.window.GAMENOTE_CONTENT;
const videoCopy=require('../content/games/an-jing-wei-guang/public-video-copy.json'),publicCopy=new Map();
for(let part=2;part<=7;part++){
 const items=require('../_research/an-jing-wei-guang/p'+part+'-map-notes.json').flatMap(c=>c.items);
 if(items.length!==videoCopy[part].length)throw Error('Public reading copy count mismatch: '+part);
 items.forEach((item,i)=>publicCopy.set(base+'images/p'+part+'/frame-'+String(item.sec).padStart(4,'0')+'.webp',videoCopy[part][i]));
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?all(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);
const files=[path.join(root,'index.html'),...['games','notes','updates','about','en','search'].flatMap(d=>all(path.join(root,d)))];
function clean(text,en){
 if(en){
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s=>!/has not been confirmed|not yet verified|not established|not been established|remain(?:s)? unconfirmed|left unconfirmed|not clearly read|not inferred|not assigned names|not presented as an ending|not proof|does not establish|does not confirm|does not show|does not imply|does not mean|not a completion frame|not a boss-defeat scene|not a fixed phase rule|not a completed rescue|not completion or a reward|not a complete attack cycle|only the pickup node|naming difference remains|correspondence with the Chinese video|Without a completion message|Without an item panel|One confirmed pickup|This confirms one pickup|formal name is unconfirmed|not readable in this frame|do not mistake visual descriptions|rather than assigning it|episode title|solely because of the video title|not proof that a new named region/i.test(s))
   .join(' ').replace(/The (?:later )?recording (?:then )?/g,'The route ').replace(/the recording /g,'the route ').replace(/The commentary explicitly points out this movement\. /g,'').replace(/; the commentary explicitly points out this movement/g,'').replace(/The commentary (?:highlights|points out|recommends|says|advises) /g,'').replace(/Record this separately from the earlier roadside conversation; these are two encounters with the same NPC\./g,'This is a second encounter with the same NPC.').replace(/Record this as a post-battle node\./g,'Finish the post-battle dialogue.').replace(/Document the first crossing separately from opening the return shortcut, then /g,'Then ').replace(/This records the controller prompt actually shown, not a universal binding for every platform\./g,'Check the controls in your own game settings.').trim();
 }
 return text.split(/(?<=[。！？])/).filter(s=>!/本轮|本次记录|当前记录|此处仅记录|不把|不将|不据此|不为看不清|不视为|不宣称|尚未.*核实|待确认|名称待核验|未.*确认.*(?:名称|数量)|只作.*参考|只记录|只确认|这里只|不作为|不等同于|不代表|尚未.*读出|不能据此|没有.*确认/.test(s))
  .join('').replace(/录像(?:在这里|随后|后段|末段|继续|打开地图，展示|显示|中|里)?/g,'').replace(/画面中的/g,'').replace(/画面中/g,'').replace(/这段画面中，/g,'这里，').replace(/游戏画面显示/g,'游戏提示').replace(/字幕明确提示这(?:一|个)动作[。；]?/g,'').replace(/记录这个节点/g,'留意这个节点').replace(/分开记录/g,'分别查看').replace(/若要整理相关任务，先以这两个实际对话节点为起点。/g,'继续任务时，留意这两处对话。').replace(/先完成当前段落的记录，再继续/g,'先完成当前段落，再继续').trim();
}
function references(record){
 if(!record)return [];
 const sources=[...(record.sources||[]),...Object.values(record.fields||{}).filter(confirmed).flatMap(f=>f.sources||[])];
 // The profile is credited as a creator profile, never as an exact video URL.
 const unique=new Map();for(const s of sources)if(s.url?.startsWith('https://'))unique.set(s.url,s.name);
 return [...unique].map(([url,label])=>[url.includes('space.bilibili.com/3804625')?'好吃的香草雪球 · Bilibili 作者主页':label.replace(/（用户提供页面截图）/g,''),url]);
}
const indexable=[];
for(const file of files){
 const url='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,''),en=url.startsWith('/en/'),current=url.replace(/^\/en\//,'/'),prefix=en?'/en':'',classic=current.startsWith(base);
 const $=cheerio.load(fs.readFileSync(file,'utf8')),article=classic?$('.classic-main > article'):$('.article');
 const parts=classic?current.slice(base.length).split('/').filter(Boolean):[],record=classic?({walkthrough:data.areas,maps:data.areas,bosses:data.bosses,abilities:data.abilities,achievements:data.achievements,collectibles:parts[1]==='key-items'?data.keyItems:data.collectibles,quests:data.quests}[parts[0]]||[]).find(e=>e.slug===(parts[2]||parts[1])):null;
 $('[data-editorial],script[data-article-schema],script[data-site-schema]').remove();
 $('link[href="/assets/editorial.css"]').remove();$('head').append('<link rel="stylesheet" href="/assets/editorial.css">');
 if(classic){
  if(['walkthrough','bosses'].includes(parts[0]))article.find('p').each((_,n)=>{const p=$(n);if(!p.find('a').length){const value=clean(p.text(),en);if(value)p.text(value);else p.remove()}});
  article.find('.classic-image-block').each((_,n)=>{const block=$(n),copy=publicCopy.get(block.find('img').attr('src'));if(copy){if(!block.children('p').length)block.append('<p></p>');block.children('p').text(copy[en?1:0])}});
  const encounters=[];
  if(parts[0]==='walkthrough'){
   article.children('h2').each((_,n)=>{const heading=$(n),label=heading.text().trim();if(!['NPC','Boss','Boss / encounter'].includes(label))return;const body=heading.next('p');if(body.length)encounters.push([label,body.html()]);body.remove();heading.remove()});
   article.find('.classic-image-block').removeClass('reverse').addClass('center classic-walkthrough-image');
  }
  const summary=summaries[record?.id];
  if(summary&&parts[0]==='walkthrough'){
   const links=[['地图','Map',base+'maps/'+record.slug+'/'],...(summary.bosses||[]).map(id=>{const e=data.bosses.find(e=>e.id===id);return [e.nameZh||require('../content/games/an-jing-wei-guang/labels-zh.json')[e.nameEn]||e.nameEn,e.nameEn,base+'bosses/'+e.slug+'/']}),...(summary.abilities||[]).map(id=>{const e=data.abilities.find(e=>e.id===id);if(!e)throw Error('Unknown summary ability '+id);return [e.nameZh||require('../content/games/an-jing-wei-guang/labels-zh.json')[e.nameEn]||e.nameEn,e.nameEn,base+'abilities/'+e.slug+'/']})];
   const bossIds=[...new Set([...(summary.bosses||[]),...(confirmed(record.fields.bosses)?record.fields.bosses.value:[])])];
   const bossRow=bossIds.length?'<dt>Boss</dt><dd>'+bossIds.map(id=>{const e=data.bosses.find(e=>e.id===id);if(!e)throw Error('Unknown regional boss '+id);return `<a href="${prefix+base+'bosses/'+e.slug+'/'}">${esc(en?e.nameEn:e.nameZh||require('../content/games/an-jing-wei-guang/labels-zh.json')[e.nameEn]||e.nameEn)}</a>`}).join(' · ')+'</dd>':'';
   const npcRows=encounters.filter(([label])=>label==='NPC').map(([,html])=>'<dt>NPC</dt><dd>'+html+'</dd>').join('')+(record.id==='the-bog'?`<dt>NPC</dt><dd>${en?'Ilda — roadside and campfire conversations.':'伊尔达 · 途中与营地篝火旁的两处对话。'}</dd>`:record.id==='desiccated-castle'?`<dt>NPC</dt><dd>${en?'Looter — dialogue along the castle route.':'拾荒者 · 荒堡路线中的对话节点。'}</dd>`:'');
   article.prepend(`<section data-editorial class="classic-region-summary"><h2 class="classic-heading">${en?'Area at a Glance':'本区域要点'}</h2><dl>${[['goal','推进目标','Goal'],['ability','能力 / 使用限制','Ability / Limits'],['revisit','回头探索','Return Visits']].map(([key,zh,english])=>`<dt>${en?english:zh}</dt><dd>${esc(summary[key][en?1:0])}</dd>`).join('')}${npcRows}${bossRow}</dl><p>${links.filter(([, ,u])=>!u.includes('/bosses/')).map(([zh,english,u])=>`<a href="${prefix+u}">${esc(en?english:zh)}</a>`).join(' · ')}</p></section>`);
  }
  if(record&&['walkthrough','maps'].includes(parts[0])){
   const mapNotes=require('../content/games/an-jing-wei-guang/regional-map-notes.json').find(n=>n.id===record.id);
   const description=parts[0]==='walkthrough'?(summary?.[en?'en':'zh']||(en?`${record.nameEn}: regional guide in progress.`:`${$('h1').text()}区域路线资料持续整理中。`)):(mapNotes?(en?`${record.nameEn}: map orientation covering ${mapNotes.rowsEn.map(r=>r[0]).join(', ')}.`:`${$('h1').text()}：${mapNotes.rows.map(r=>r[0]).join('、')}的地标识别与地图定位。`):(en?`${record.nameEn}: map references in progress.`:`${$('h1').text()}的地图参考资料持续整理中。`));
   $('meta[name=description],meta[property="og:description"]').attr('content',description);
  }
  if(parts[0]==='bosses'&&parts[1]==='the-queen'){
   const achievements=data.achievements.filter(e=>['hide-and-seek','endgame'].includes(e.id));
   article.prepend(`<section data-editorial><h2 class="classic-heading">${en?'The Queen and Related Achievements':'女王与相关成就'}</h2><p>${en?'The Queen appears in two distinct Steam achievement descriptions: evading her and battling her. These are different objectives; the battle achievement description says “Battle the Queen”, not “Defeat the Queen”.':'Steam 成就包含两个与女王有关的目标：躲避女王和与女王战斗。两者不是同一个目标；“终局”的说明是“与女王战斗”，不是“击败女王”。'}</p><ul>${achievements.map(e=>`<li><a href="${prefix+base+'achievements/'+e.slug+'/'}">${esc(en?e.nameEn:e.nameZh)}</a>：${esc(en?e.descriptionEn:e.description)}</li>`).join('')}</ul><h2 class="classic-heading">${en?'Before the Encounter':'遭遇前准备'}</h2><p>${en?'Before continuing, review your available healing, supplies and equipped trinkets. Keep the ability and achievement indexes available when checking your remaining objectives.':'继续探索前，可先检查治疗、补给和已装备的饰物，并通过能力与成就目录核对自己的推进目标。'}</p><p class="classic-notice">${en?'Reference material in progress · Arena routes, attack patterns and detailed tactics will be added here.':'资料持续整理中 · 场地路线、招式与详细打法将在本页继续补充。'}</p></section>`);
   // A useful factual introduction is not a finished boss guide: keep the draft out of indexing.
   $('meta[name=robots]').remove();$('head').append('<meta name="robots" content="noindex,follow">');$('[data-pagefind-body]').removeAttr('data-pagefind-body');
   $('meta[name=description],meta[property="og:description"]').attr('content',en?'The Queen: evasion and battle achievements, preparation notes and an ongoing boss-guide draft.':'女王：躲避与战斗成就、遭遇前准备和持续整理中的首领攻略。');
  }
 }
 if(current==='/about/'){
  $('main').append(`<section class="section" data-editorial><h2>${en?'Who Writes GAME NOTE':'谁在整理 GAME NOTE'}</h2><p>${en?'GAME NOTE is an independent, player-made guide project. GAME NOTE editors organise routes, screenshots, bilingual text and corrections. The walkthrough videos referenced in the Well Dweller guide were created by 好吃的香草雪球; the video creator and this website’s guide editors are not presented as the same author.':'GAME NOTE 是玩家制作的独立攻略项目。本站攻略整理者负责路线编排、截图选取、中英文文字整理和勘误；《黯井微光》参考录像的原作者是好吃的香草雪球。攻略整理者与原视频作者分别署名，不将参考录像写成本站自行录制。'}</p><h2>${en?'How the Guides Are Prepared':'资料整理方法'}</h2><p>${en?'We compare gameplay footage, official game and Steam information, and referenced guides. Routes are organised by area, while maps, abilities and achievements have separate reference pages. Original evidence stays in the research archive; public pages show practical instructions and source links. Unresolved details remain drafts rather than invented conclusions.':'结合游戏画面、官方游戏与 Steam 资料以及注明来源的攻略进行对照，按区域整理路线，并将地图、能力和成就分别归档。原始依据保留在研究资料中；公开页面展示可用步骤与参考链接。尚未确定的信息保留为待补内容，不填充成结论。'}</p><h2>${en?'Corrections and Credits':'纠错与署名'}</h2><p>${en?'For corrections, include the page URL, region, problem and any supporting screenshot or source. Please use the contact page or open an issue in the GAME NOTE repository.':'反馈时请附页面地址、所在区域、具体问题及截图或参考资料。可通过联系方式页查看反馈渠道，或在 GAME NOTE 仓库提交 Issue。'}</p><p><a href="/contact.html">${en?'Contact and Corrections':'联系方式与纠错'}</a> · <a href="https://github.com/c2ccc2/gamenote.cc/issues" target="_blank" rel="noopener noreferrer">GAME NOTE Issues</a> · <a href="https://space.bilibili.com/3804625/" target="_blank" rel="noopener noreferrer">${en?'Original video creator: 好吃的香草雪球':'原视频作者：好吃的香草雪球'}</a></p></section>`);
 }
 if(article.length){
  let sources=references(record||((classic&&!parts.length)?data.game:null));
  if(current.startsWith('/notes/')&&current!=='/notes/'){
   sources.push([en?'GAME NOTE — editorial methods':'GAME NOTE · 资料整理方法',origin+prefix+'/about/']);
   const note=shared.notes.find(n=>n.url===current),game=shared.games.find(g=>g.id===note?.game);
   if(game)sources.push([en?'Related game guide':game.titleZh+'攻略专题',game.guideUrl.startsWith(base)?origin+prefix+game.guideUrl:game.guideUrl]);
  }
  if(classic&&parts[0]==='systems')sources.push(...require('../content/games/an-jing-wei-guang/systems-reference.json').map(s=>[en?s.titleEn:s.title,s.source]));
  if(classic&&parts[0]==='maps'&&parts[1]==='world')sources.push(['Gamer Guides — The Kingdom','https://www.gamerguides.com/well-dweller/maps/the-kingdom']);
  if(classic&&parts[0]==='abilities')sources.push(...Object.values(require('../content/games/an-jing-wei-guang/ability-reference.json').sources).map(s=>[s.name,s.url]));
  if(classic&&parts[0]==='achievements')sources.push([en?'Steam achievement list':'Steam 官方成就列表',`https://steamcommunity.com/stats/3699590/achievements/?l=${en?'english':'schinese'}`]);
  if(classic&&/\/images\/p[1-7]\//.test(article.html()))sources.push([en?'Original video creator: 好吃的香草雪球 — Bilibili profile':'好吃的香草雪球 · Bilibili 作者主页','https://space.bilibili.com/3804625/']);
  sources=[...new Map(sources.filter(([,u])=>u).map(s=>[s[1],s])).values()];
  if(sources.length){
   const block=`<section data-editorial class="article-references"><h2${classic?' class="classic-heading"':''}>${en?'References':'参考链接'}</h2><ul>${sources.map(([label,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(en&&u.includes('space.bilibili.com')?'Original video creator: 好吃的香草雪球 — Bilibili profile':en&&u.includes('steamcommunity.com')?'Steam — official achievement list':en&&/[\u3400-\u9fff]/.test(label)?'Reference — '+new URL(u).hostname:label)}</a></li>`).join('')}</ul></section>`;
   const nav=article.children('.classic-area-nav').first();if(nav.length)nav.before(block);else article.append(block);
  }
  const modified=`<p data-editorial class="${classic?'classic-subtitle':'article-meta'}">${en?'Guide editor: GAME NOTE':'攻略整理：GAME NOTE'} · ${en?'Updated':'更新于'} <time datetime="${today}">${today}</time></p>`;
  const header=classic?$('.classic-main > header'):article.children('header').first();
  if(classic&&header.length){
   // Keep one visible byline; progress notices belong beside unfinished content.
   header.children('p.classic-subtitle').remove();
   header.children('h1').after(modified);
  }else if(header.length)header.append(modified);else article.prepend(modified);
  const isDetail=classic?(parts.length>1||parts[0]==='systems'):current.startsWith('/notes/')&&current!=='/notes/';
  if(isDetail){
   const schema={'@context':'https://schema.org','@type':current.startsWith('/notes/')?'BlogPosting':'Article','@id':origin+url+'#article',headline:$('h1').first().text(),description:$('meta[name=description]').attr('content'),inLanguage:en?'en':'zh-CN',dateModified:today,author:{'@type':'Organization',name:'GAME NOTE',url:origin+(en?'/en/about/':'/about/')},publisher:{'@type':'Organization',name:'GAME NOTE',url:origin},mainEntityOfPage:origin+url};
   const published=article.find('header time').first().attr('datetime');if(published&&published!==today)schema.datePublished=published;
   const img=article.find('img').first().attr('src');if(img)schema.image=new URL(img,origin).href;
   $('head').append(`<script type="application/ld+json" data-article-schema>${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>`);
  }
 }
 if(current==='/')$('head').append(`<script type="application/ld+json" data-site-schema>${JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'GAME NOTE',url:origin+url,inLanguage:en?'en':'zh-CN',publisher:{'@type':'Organization',name:'GAME NOTE',url:origin}})}</script>`);
 const canonical=$('link[rel=canonical]').attr('href');if(!/noindex/i.test($('meta[name=robots]').attr('content')||'')&&canonical===origin+url&&current!=='/search/')indexable.push(origin+url);
 fs.writeFileSync(file,$.html()+'\n');
}
const urls=[...new Set(indexable)].sort();
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${esc(u)}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Editorial metadata and source lists applied; fresh sitemap contains ${urls.length} unique URLs.`);
