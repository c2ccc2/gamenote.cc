// V1 publication: templates only consume public/draft entities and independently approved fields.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadClassicData,visible,confirmed,publicValue,approvedImage,canPublish}=require('./lib/classic-data.cjs');
const routes=require('../assets/routes.js');
const root=path.resolve(__dirname,'..'),base='/games/an-jing-wei-guang/';
const data=loadClassicData(root),ctx={window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/content.js'),'utf8'),ctx);
const shared=ctx.window.GAMENOTE_CONTENT;
const displayZh=require('../content/games/an-jing-wei-guang/labels-zh.json');
const {readerText}=require('./lib/classic-reader-copy.cjs');
const worldMap=require('./lib/classic-world-map.cjs');
worldMap.buildWorldMaps(data,root);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href=v=>{if(!/^(\/|https:\/\/|#)/.test(v)||v.startsWith('//'))throw Error('Invalid URL '+v);return esc(v)};
const link=(t,u)=>`<a href="${href(u)}">${esc(t)}</a>`;
const heading=(t,id='')=>`<h2 class="classic-heading"${id?` id="${esc(id)}"`:''}>${esc(t)}</h2>`;
const notice=t=>`<p class="classic-notice">${esc(t)}</p>`;
const table=(t,h,rows)=>`<div class="classic-table-wrap" tabindex="0" role="region" aria-label="${esc(t)}"><table class="classic-table"><caption>${esc(t)}</caption><thead><tr>${h.map(v=>`<th scope="col">${esc(v)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v&&typeof v==='object'&&v.html?v.html:esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const list=items=>`<ul class="classic-links">${items.map(([t,u])=>`<li>→ ${link(t,u)}</li>`).join('')}</ul>`;
const name=e=>publicValue(e,'nameZh')||displayZh[e.nameEn]||e.nameEn;
const status=e=>e.contentStatus==='complete'?'已复核':e.contentStatus==='guide-ready'?'攻略可用':canPublish(e)?'持续整理':'待核验';
const publicList=key=>data[key].filter(visible);
const areas=publicList('areas'),bosses=publicList('bosses'),abilities=publicList('abilities'),collectibles=publicList('collectibles'),quests=publicList('quests'),keyItems=publicList('keyItems'),achievements=publicList('achievements'),challenges=publicList('challenges');
const abilityReference=require('../content/games/an-jing-wei-guang/ability-reference.json');
const systemsReference=require('../content/games/an-jing-wei-guang/systems-reference.json');
const regionalMapNotes=require('../content/games/an-jing-wei-guang/regional-map-notes.json');
const abilityGroups=[['movement','移动 / 核心能力'],['progression','推进 / 功能解锁']];
const referenceRecord=item=>[...abilities,...keyItems].find(e=>e.id===item.id);
const referenceRoute=item=>(abilities.some(e=>e.id===item.id)?'abilities/':'collectibles/key-items/')+referenceRecord(item).slug+'/';
const groups=[
 ['游戏资料',[['游戏简介','systems/#intro'],['系统说明','systems/']]],
 ['流程攻略',[...areas.slice(0,14).map(e=>[name(e),'walkthrough/'+e.slug+'/']),['其他区域','walkthrough/#other']]],
 ['地图',[['世界地图','maps/world/'],['区域地图','maps/']]],
 ['Boss',bosses.map(e=>[e.slug==='dollmaker'?'玩偶师遭遇（名称待核验）':name(e),'bosses/'+e.slug+'/'])],
 ['能力',abilityGroups.flatMap(([group,title])=>[[title,'abilities/#'+group],...abilityReference.entries.filter(e=>e.group===group).map(item=>[name(referenceRecord(item)),referenceRoute(item)])])],
 ['收集',collectibles.map(e=>[name(e),'collectibles/'+e.slug+'/'])],
 ['任务',quests.map(e=>[name(e),'quests/'+e.slug+'/'])],
 ['挑战',[['计时挑战','challenges/time-trials/'],['谜题解法','challenges/puzzle-solutions/']]],
 ['成就',[['成就一览','achievements/']]],
 ['其他内容',[['更新记录','updates/']]]
];
const states={draft:'资料持续整理中','in-progress':'资料持续整理中',partial:'资料持续整理中',empty:'条目待核验', 'guide-ready':'攻略已整理 · 持续复核',complete:'已整理并复核',updated:'已修订'};
const updates=shared.updates.filter(u=>u.game==='an-jing-wei-guang').sort((a,b)=>b.date.localeCompare(a.date));
const updateList=limit=>`<ul class="classic-updates">${updates.slice(0,limit).map(u=>`<li><time datetime="${esc(u.date)}">${esc(u.date)}</time>${link(u.title,u.url)}<p>${esc(u.description)}</p></li>`).join('')}</ul>`;
const imageBlock=i=>approvedImage(i)?`<div class="classic-image-block center"><figure><a href="${href(i.src)}" aria-label="查看原图"><img src="${href(i.src)}" alt="${esc(i.caption)}" width="${i.width||460}" height="${i.height||215}" loading="lazy"></a><figcaption>${esc(i.caption)}${i.type==='video-frame'?' · '+esc(i.source.split(' · ')[0]):''}</figcaption></figure></div>`:'';
function safeGuide(entity,key='guide'){
 const field=entity.fields[key];if(!confirmed(field)||!Array.isArray(field.value))return '';
 return field.value.map(block=>{
  // Keep research provenance internally without repeating editorial disclaimers in the guide.
  if(block.type==='notice'&&block.text.startsWith('以下按原录像时间顺序记录'))return '';
  if(!confirmed({...block,value:block.text||block.src}))return '';
  if(block.type==='heading')return heading(readerText(block.text));
  if(block.type==='notice')return notice(readerText(block.text));
  if(block.type==='paragraph')return '<p>'+esc(readerText(block.text))+'</p>';
  if(block.type==='image'){const image=entity.images.find(i=>i.src===block.src);if(!approvedImage(image))return '';return `<div class="classic-image-block${block.align==='right'?' reverse':''}"><figure><a href="${href(image.src)}" aria-label="查看原图"><img src="${href(image.src)}" alt="${esc(image.caption)}" width="${image.width}" height="${image.height}" loading="lazy"></a><figcaption>${esc(image.caption)} · ${esc(image.source.split(' · ')[0])}</figcaption></figure><p>${esc(readerText(block.text))}</p></div>`}
  return '';
 }).join('');
}
const pending=topic=>`<p>${esc(topic)}整理中。核验后补充，不以目录名称推断具体玩法或路线。</p>`;

const linkedName=(e,section)=>({html:link(name(e),base+section+'/'+e.slug+'/')});
const catalogue=(records,section)=>table('条目目录',['名称','状态'],records.map(e=>[linkedName(e,section),status(e)]));
const pages=[];
function areaNavigation(entity,route){
 if(!entity||!areas.includes(entity))return '';
 const section=route.startsWith('maps/')?'maps':'walkthrough';
 const columns=[['previousAreas','前一区域','←'],['nextAreas','后续区域','→']].flatMap(([key,title,arrow])=>{
  const value=publicValue(entity,key,[]),ids=Array.isArray(value)?value:[value];
  const destinations=ids.map(id=>areas.find(area=>area.id===id)).filter(Boolean);
  if(!destinations.length)return [];
  return [`<div class="classic-area-nav-group"><h3><span aria-hidden="true">${arrow}</span> ${title}</h3><ul>${destinations.map(area=>`<li>${link(name(area),base+section+'/'+area.slug+'/')}</li>`).join('')}</ul></div>`];
 });
 return columns.length?`<nav class="classic-area-nav" aria-label="区域衔接导航"><h2>接续探索</h2><div class="classic-area-nav-columns">${columns.join('')}</div></nav>`:'';
}
function page(route,title,description,body,{parent,previous,next,status='draft',updatedAt=data.updatedAt,noindex=false,entity=null}={}){
 if(entity){status=entity.contentStatus;noindex=noindex||!canPublish(entity)}
 const url=base+route,full=`${title} — 黯井微光攻略 | GAME NOTE CLASSIC`;
 const groupRoutes=['systems/','walkthrough/','maps/','bosses/','abilities/','collectibles/','quests/','challenges/','achievements/','updates/'];
 const nav=`<a href="${base}"${route?'':' aria-current="page"'}>专题首页</a>`+groups.map(([t,items],index)=>{
  const target=base+groupRoutes[index],id='classic-group-'+index;
  return `<section class="classic-nav-group"><div class="classic-nav-group-heading"><h2><a href="${href(target)}"${url===target?' aria-current="page"':''}>${esc(t)}</a></h2><button class="classic-group-toggle" type="button" aria-expanded="true" aria-controls="${id}" aria-label="收起栏目">−</button></div><div id="${id}" class="classic-nav-group-items">`+items.map(([label,u])=>`<a href="${href(base+u)}"${base+u===url?' aria-current="page"':''}>${esc(label)}</a>`).join('')+'</div></section>';
 }).join('');
 const crumbs=[{label:'GAME NOTE',href:'/'},{label:'Games',href:'/games/'},{label:'黯井微光',href:base,current:!route},...(parent?[{label:parent[0],href:base+parent[1]+'/'}]:[]),...(route?[{label:title,href:url,current:true}]:[])];
 const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(full)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://gamenote.cc${url}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://gamenote.cc${url}"><meta property="og:type" content="article">${noindex?'<meta name="robots" content="noindex,follow">':''}<link rel="stylesheet" href="/assets/classic.css"><link rel="stylesheet" href="/assets/classic-area-nav.css"><link rel="stylesheet" href="/assets/classic-menu.css"><link rel="stylesheet" href="/assets/classic-map.css"><script src="/assets/classic.js" defer></script><script type="application/ld+json" data-breadcrumb-schema>${routes.schema(crumbs)}</script></head><body class="classic" data-theme="classic"><a class="classic-skip" href="#main">跳到正文</a><div class="classic-shell"><aside class="classic-sidebar"><a class="classic-brand" href="/">GAME NOTE CLASSIC</a><details open><summary>攻略目录</summary><nav class="classic-nav" aria-label="攻略目录">${nav}</nav></details></aside><main class="classic-main" id="main">${routes.breadcrumb(crumbs,'classic')}<header><h1>${esc(title)}</h1><p class="classic-subtitle">${esc(states[status]||states.draft)} · 更新于 ${esc(updatedAt)}</p>${!route?'<div class="classic-banner"><div><small>GAME NOTE CLASSIC · 图文攻略专题</small><strong>黯井微光</strong></div><span>攻略整理中</span></div>':'<p class="classic-subtitle">GAME NOTE CLASSIC · 黯井微光</p>'}</header><article>${body}${areaNavigation(entity,route)}</article><nav class="classic-pager" aria-label="文章分页">${previous?link('← '+previous.title,base+previous.route):'<span>暂无上一页</span>'}${link('目录',base+(parent?parent[1]+'/':''))}${next?link(next.title+' →',base+next.route):'<span>暂无下一页</span>'}</nav><footer class="classic-footer">${link('返回 GAME NOTE','/')} · 本专题持续整理；未核实内容不作为游戏结论。</footer></main></div></body></html>`;
 const file=path.join(root,'games/an-jing-wei-guang',route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html+'\n');if(!noindex)pages.push(url);
}
const game=data.game;

const fieldTitles={referenceEffect:'参考作用',referenceAcquisition:'参考获取方式',overview:'区域概览',previousAreas:'前一区域',nextAreas:'后续区域',bosses:'Boss',abilities:'能力',npcs:'NPC',collectibles:'收集记录',importantLocations:'重要节点',routeNotes:'★ 录像流程记录',area:'出现区域',encounterOrder:'★ 遭遇信息',location:'位置',attacks:'已观察的攻击画面',attackPatterns:'已观察的攻击方式',strategy:'推荐打法',reward:'奖励',afterBattle:'战后路线',type:'类型',obtainedAt:'获取节点',requirements:'条件',function:'实际功能',unlocks:'开放路线',acquisition:'获取方式',relatedAreas:'相关区域',relatedCollectibles:'相关收集',category:'分类',abilityRequired:'所需能力',count:'当前资料记录',startNpc:'起始 NPC',steps:'任务步骤',prerequisite:'前置条件',relatedGuides:'相关攻略',relatedGuide:'相关攻略',earlyRoute:'P1 早期推进关系'};
const relationFields=new Set(['previousAreas','nextAreas','bosses','abilities','collectibles','area','relatedAreas','relatedCollectibles','relatedGuides','relatedGuide','earlyRoute']);
const refs=new Map();for(const [section,records] of [['walkthrough',areas],['bosses',bosses],['abilities',abilities],['collectibles',collectibles],['quests',quests],['collectibles/key-items',keyItems],['achievements',achievements]])for(const e of records)refs.set(e.id,[name(e),base+section+'/'+e.slug+'/']);
function valueText(value,key){
 if(Array.isArray(value))return value.map(item=>valueText(item,key)).join('<br>');
 if(value&&typeof value==='object'){if(value.url&&value.label)return link(value.label,value.url);return esc(value.text||value.name||'')}
 if(relationFields.has(key)&&refs.has(value)){const [label,url]=refs.get(value);return link(label,url)}
 return esc(readerText(value));
}
function facts(e,{map=false}={}){
 if(!canPublish(e))return '<p class="classic-subtitle">当前保留名称目录；相关事实仍在核验。</p>';
 if(map){
  const maps=e.images.filter(i=>approvedImage(i)&&/地图|区域图/.test(i.caption));
  const notes=regionalMapNotes.find(n=>n.id===e.id);
  const scene=notes?.image?e.images.find(i=>i.src===notes.image):null;
  if(notes?.image&&!approvedImage(scene))throw Error('Unapproved map landmark image '+e.id);
  return (maps.length?heading('局部地图参考')+maps.map(imageBlock).join(''):'')+
   (scene?heading('场景识别参考')+imageBlock(scene):'')+
   (notes?heading('地图定位与地标')+table('区域定位资料',['地标 / 节点','识别方式','地图阅读提示'],notes.rows):'<p>该区域的地图位置资料尚待补充。</p>');
 }
 let out=(map?'<p class="classic-subtitle">以下为已确认的区域节点与录像画面，不等同于完整地图。</p>':'')+(publicValue(e,'description')?'<p>'+esc(publicValue(e,'description'))+'</p>':'');
 const guideImages=new Set(['guide','mapGuide'].flatMap(key=>confirmed(e.fields[key])?e.fields[key].value.filter(b=>confirmed({...b,value:b.text||b.src})).map(b=>b.src):[]));
 out+=e.images.filter(i=>!guideImages.has(i.src)).map(imageBlock).join('');
 for(const [key,field] of Object.entries(e.fields)){
  if(!confirmed(field)||['nameEn','nameZh','description','descriptionEn','guide','mapGuide','previousAreas','nextAreas'].includes(key))continue;
  out+=heading(fieldTitles[key]||key)+'<p>'+valueText(field.value,key)+'</p>';
 }
 out+=safeGuide(e);
 out+=safeGuide(e,'mapGuide');
 if(!canPublish(e))out+='<p class="classic-subtitle">当前保留名称目录；相关事实仍在核验。</p>';
 return out;
}

page('','黯井微光 / Well Dweller','黯井微光 Well Dweller：游戏资料、区域、Boss、能力、收集、任务和 41 项成就目录。',
 '<p>'+esc(game.description)+'</p>'+
 table('游戏基础资料',['项目','资料'],[
 ['中文名',game.nameZh],['英文名',game.nameEn],['开发者',publicValue(game,'developer')],
 ['发行',publicValue(game,'publishers',[]).join(' / ')],['发售日',publicValue(game,'releaseDate')],
 ['官方类型',publicValue(game,'officialCategories',[]).join(' / ')],['类型与展示标签',publicValue(game,'genres',[]).join(' / ')],['主角',publicValue(game,'protagonist')],
 ['Steam 成就',publicValue(game,'steamAchievements')],['支持简体中文',publicValue(game,'simplifiedChinese')?'是':'待核验']
 ])+game.images.map(imageBlock).join('')+
 '<p>'+link('Steam 官方商店',game.sources[0].url)+'</p>'+
 heading('专题入口')+list([['区域与流程目录',base+'walkthrough/'],['地图目录',base+'maps/'],['Boss 目录',base+'bosses/'],['能力 / 系统',base+'abilities/'],['收集分类',base+'collectibles/'],['任务目录',base+'quests/'],['计时挑战',base+'challenges/'],['41 项成就',base+'achievements/']])+
 heading('资料整理状态')+table('V1 目录',['栏目','当前状态'],[
 ['区域',areas.length+' 个名称条目；不代表最终流程顺序'],['Boss / encounter',bosses.length+' 个条目；招式与打法待核验'],
 ['能力 / 系统',abilities.length+' 个条目；获取方式整理中'],['收集',collectibles.length+' 类；具体位置待核验'],
 ['任务',quests.length+' 个名称；步骤持续核验'],['成就',achievements.length+' 条已整理 / '+publicValue(game,'steamAchievements')+' 项 Steam 成就']
 ])+notice('本站当前是可持续核验的资料专题，不是已完成的全收集攻略。')+heading('最近更新')+updateList(5),{status:'in-progress'});
page('walkthrough/','流程攻略目录','Well Dweller 区域流程攻略目录。',
 catalogue(areas.slice(0,14),'walkthrough')+heading('其他区域','other')+catalogue(areas.slice(14),'walkthrough'));
for(const e of data.walkthroughs)page('walkthrough/'+e.slug+'/',name(e),e.description,notice('P1 图文正文已按阅读段落分到以下两个区域页，内容没有删除。小屋片段在夜之庭园页中明确标为后续探索，不改变其区域归属。')+list(e.readingRoutes.map(slug=>[name(areas.find(a=>a.slug===slug)),base+'walkthrough/'+slug+'/'])),{parent:['流程攻略','walkthrough'],noindex:true});
for(const e of areas){
 page('walkthrough/'+e.slug+'/',name(e),e.nameEn+' 已确认区域资料与流程记录。',facts(e)+heading('相关攻略')+list([['区域地图',base+'maps/'+e.slug+'/'],['流程目录',base+'walkthrough/']]),{parent:['流程攻略','walkthrough'],entity:e});
 page('maps/'+e.slug+'/',name(e)+' · 地图',e.nameEn+' 已确认区域节点；截图不等同于完整地图。',facts(e,{map:true})+'<details class="classic-map-structure"><summary>查看区域结构示意</summary>'+worldMap.markup(e)+'</details>'+heading('相关攻略')+list([['世界结构示意图',base+'maps/world/'],['区域流程',base+'walkthrough/'+e.slug+'/'],['区域地图目录',base+'maps/']]),{parent:['区域地图','maps'],entity:e});
}
page('maps/','地图目录','Well Dweller 区域地图参考目录。','<p>地图章节提供局部地图与地标定位；完整路线步骤仍在流程攻略中阅读。</p>'+list([['世界结构示意图',base+'maps/world/']])+heading('已补充区域')+table('可用地图资料',['区域','现有内容'],areas.filter(a=>regionalMapNotes.some(n=>n.id===a.id)).map(a=>[linkedName(a,'maps'),a.images.some(i=>approvedImage(i)&&/地图|区域图/.test(i.caption))?'局部地图与地标定位':'地标定位与区域结构视图']))+heading('后续区域')+catalogue(areas.filter(a=>!regionalMapNotes.some(n=>n.id===a.id)),'maps'));
page('maps/world/','世界地图 · 区域结构示意','Well Dweller 原创区域结构示意与区域地图入口。',worldMap.markup()+heading('区域地图入口')+catalogue(areas,'maps')+'<p>'+link('区域资料参考：Gamer Guides',worldMap.graph.referenceUrl)+'</p>',{parent:['地图','maps']});
for(const [slug,title] of [['hidden-paths','隐藏通道'],['breakable-walls','可破坏墙壁'],['locked-doors','反锁门']])page('maps/'+slug+'/',title,title+' 资料持续整理中。','<p class="classic-subtitle">尚无已确认的地图资料。</p>',{parent:['地图','maps'],noindex:true});
page('bosses/','Boss / encounter 目录','Well Dweller 首领与遭遇目录。',catalogue(bosses,'bosses'));
for(const e of bosses)page('bosses/'+e.slug+'/',name(e),e.nameEn+' 已确认的遭遇资料。',facts(e)+(e.aliases?'<p class="classic-subtitle">名称存在来源差异：'+esc(e.aliases.join(' / '))+'</p>':'')+heading('相关攻略')+list([...(publicValue(e,'area')&&refs.has(publicValue(e,'area'))?[refs.get(publicValue(e,'area'))]:[]),['Boss 目录',base+'bosses/']]),{parent:['Boss / encounter','bosses'],entity:e});
const referenceSources=item=>[...new Set([...item.effectSources,...item.locationSources])].map(id=>{const s=abilityReference.sources[id];return link(s.name,s.url)}).join('<br>');
const referenceNotes=e=>{
 const item=abilityReference.entries.find(item=>item.id===e.id);if(!item)return '';
 return (!item.locationSources.length?heading('获取方式')+'<p>'+esc(item.acquisition)+'</p>':'')+heading('参考来源')+'<p>'+referenceSources(item)+'</p>';
};
page('abilities/','能力 / 系统目录','Well Dweller 移动、核心能力与推进解锁资料。',abilityGroups.map(([group,title])=>heading(title,group)+table(title,['名称','作用','获取方式 / 地点','资料状态','参考来源'],abilityReference.entries.filter(item=>item.group===group).map(item=>[{html:link(name(referenceRecord(item)),base+referenceRoute(item))},item.effect,item.acquisition,item.locationPending?'作用已核对 · 位置待确认':'网页资料已核对',{html:referenceSources(item)}]))).join('')+heading('相关资料','items')+list([['关键物品',base+'collectibles/key-items/']]));
for(const e of abilities)page('abilities/'+e.slug+'/',name(e),e.nameEn+' 已确认能力资料。',facts(e)+referenceNotes(e)+heading('相关攻略')+list([...(abilityReference.entries.find(item=>item.id===e.id)?.area?[[name(areas.find(a=>a.id===abilityReference.entries.find(item=>item.id===e.id).area)),base+'walkthrough/'+abilityReference.entries.find(item=>item.id===e.id).area+'/']]:[]),['能力 / 系统目录',base+'abilities/']]),{parent:['能力 / 系统','abilities'],entity:e});
function countLabel(e){const value=publicValue(e,'count');return value===null?'—':'当前资料记录：'+value}
page('collectibles/','收集分类','Well Dweller 收集分类与已确认资料。',table('收集分类',['名称','数量资料','状态'],collectibles.map(e=>[linkedName(e,'collectibles'),countLabel(e),status(e)])));
for(const e of collectibles)page('collectibles/'+e.slug+'/',name(e),e.nameEn+' 已确认收集资料。',facts(e)+(e.slug==='key-items'?catalogue(keyItems,'collectibles/key-items'):'')+heading('相关攻略')+list([['收集目录',base+'collectibles/']]),{parent:['收集分类','collectibles'],entity:e});
for(const e of keyItems)page('collectibles/key-items/'+e.slug+'/',name(e),e.nameEn+' 已确认物品资料。',facts(e)+referenceNotes(e)+heading('相关攻略')+list([['Key Items',base+'collectibles/key-items/'],...(abilityReference.entries.some(item=>item.id===e.id)?[['推进 / 功能解锁',base+'abilities/#progression']]:[])]),{parent:['Key Items','collectibles/key-items'],entity:e});
page('quests/','任务目录','Well Dweller 任务目录与已确认步骤。',catalogue(quests,'quests'));
for(const e of quests)page('quests/'+e.slug+'/',name(e),e.nameEn+' 已确认任务资料。',facts(e)+heading('相关攻略')+list([['任务目录',base+'quests/']]),{parent:['任务','quests'],entity:e});
page('achievements/','成就一览','黯井微光 41 项 Steam 官方中文版成就名称与说明。',
 '<p>Steam 成就共 41 项。</p>'+
 table('Steam 中文成就',['成就名称','官方说明'],achievements.map(e=>[linkedName(e,'achievements'),publicValue(e,'description','')]))+'<p>'+link('Steam 官方中文版成就列表','https://steamcommunity.com/stats/3699590/achievements/?l=schinese')+'</p>');
for(const e of achievements)page('achievements/'+e.slug+'/',name(e),publicValue(e,'description','Steam 成就资料。'),facts(e)+heading('相关攻略')+list([['成就目录',base+'achievements/']]),{parent:['成就','achievements'],entity:e});
page('challenges/','挑战目录','Well Dweller Time Trials 与解谜资料入口。',list([['计时挑战',base+'challenges/time-trials/'],['谜题解法',base+'challenges/puzzle-solutions/']]));
page('challenges/time-trials/','计时挑战','Well Dweller 计时挑战目录。',catalogue(challenges,'challenges/time-trials'));
for(const e of challenges)page('challenges/time-trials/'+e.slug+'/',name(e)+' · Time Trial','已确认计时挑战资料。',facts(e),{parent:['计时挑战','challenges/time-trials'],entity:e});
page('challenges/puzzle-solutions/','谜题解法','Well Dweller 谜题资料。','<p class="classic-subtitle">尚无已确认的解法。</p>',{parent:['挑战','challenges'],noindex:true});
page('systems/','系统说明','Well Dweller 游戏基础资料与系统目录。',
 heading('游戏简介','intro')+'<p>'+esc(game.description)+'</p><p>'+link('Steam 官方商店',publicValue(game,'storeUrl'))+'</p>'+table('游戏基础资料',['项目','资料'],[['开发者',publicValue(game,'developer')],['发行商',publicValue(game,'publishers',[]).join(' / ')],['发售日',publicValue(game,'releaseDate')],['官方类型',publicValue(game,'officialCategories',[]).join(' / ')]])+
 heading('系统目录')+list(systemsReference.map(section=>[section.title,base+'systems/#'+section.id]))+
 systemsReference.map(section=>heading(section.title,section.id)+'<p>'+esc(section.text)+'</p><p>'+link(section.relatedLabel,base+section.related)+' · '+link('参考资料',section.source)+'</p>').join('')+
 heading('相关目录')+list([['能力与获取方式',base+'abilities/'],['收集目录',base+'collectibles/']]));
page('secrets/','隐藏内容','Well Dweller 隐藏与结局资料。',heading('结局条件','endings')+'<p class="classic-subtitle">尚无已确认的结局路线。</p>',{noindex:true});
page('updates/','更新记录','Well Dweller 攻略整理的真实更新记录。',updateList(updates.length),{status:'in-progress'});
// Keep previously linked addresses usable without publishing archived research content.
const aliases={'walkthrough/chapter-01/':'walkthrough/','walkthrough/chapter-02/':'walkthrough/the-bog/','walkthrough/chapter-03/':'walkthrough/the-drains/','walkthrough/chapter-04/':'walkthrough/graven-valley/','walkthrough/chapter-05/':'walkthrough/','walkthrough/chapter-06/':'walkthrough/the-docks/','walkthrough/chapter-07/':'walkthrough/the-deep/','walkthrough/final/':'walkthrough/','bosses/boss-01/':'bosses/the-groundskeeper/','bosses/boss-02/':'bosses/','bosses/boss-03/':'bosses/','bosses/boss-04/':'bosses/','maps/area-map/':'maps/','maps/hidden-area/':'maps/hidden-paths/'};
for(const [route,target] of Object.entries(aliases).filter(([route])=>!data.walkthroughs.some(e=>route==='walkthrough/'+e.slug+'/')))page(route,'资料目录已更新','旧地址保留；详细研究稿未作为正式攻略公开。',
 notice('本站已改用区域与实体目录。原始分析保留在研究层，已经确认的事实已同步至对应页面。')+list([['前往当前资料目录',base+target]]),{noindex:true});
const manifestPath=path.join(root,'_research/an-jing-wei-guang/generated-pages.json');
const oldPages=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):[];
for(const url of oldPages)if(!pages.includes(url)&&!aliases[url.slice(base.length)]){
 const route=url.slice(base.length);if(!url.startsWith(base)||route.includes('..')||!/^[-a-z0-9/]+$/.test(route))throw Error('Unsafe stale route');
 page(route,'资料暂未公开','此条目正在核验。',pending('资料')+list([['返回目录',base]]),{noindex:true});
}
fs.mkdirSync(path.dirname(manifestPath),{recursive:true});fs.writeFileSync(manifestPath,JSON.stringify(pages,null,2)+'\n');
const sitemapPath=path.join(root,'sitemap.xml');let sitemap=fs.readFileSync(sitemapPath,'utf8').replace(/\s*<url><loc>https:\/\/gamenote\.cc\/games\/an-jing-wei-guang\/[^<]*<\/loc><\/url>/g,'');
sitemap=sitemap.replace('</urlset>',pages.map(u=>`  <url><loc>https://gamenote.cc${u}</loc></url>`).join('\n')+'\n</urlset>');fs.writeFileSync(sitemapPath,sitemap);
console.log(`Generated ${pages.length} pages; verified facts published independently.`);

