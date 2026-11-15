// V1 publication: templates only consume public/draft entities and independently approved fields.
const writeFile = require('./lib/write-file.cjs');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadClassicData,visible,confirmed,publicValue,approvedImage,canPublish}=require('./lib/classic-data.cjs');
const routes=require('../assets/routes.js');
const root=path.resolve(__dirname,'..'),base='/games/an-jing-wei-guang/';
const data=loadClassicData(root),ctx={window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/content.js'),'utf8'),ctx);
const shared=ctx.window.GAMENOTE_CONTENT;
const displayZh=require('../content/games/an-jing-wei-guang/labels-zh.json');
const {readerText}=require('./lib/classic-reader-copy.cjs');
const lateGuide=require('./lib/classic-late-guide.cjs');
lateGuide.buildRouteDiagrams(root);
const worldMap=require('./lib/classic-world-map.cjs');
worldMap.buildWorldMaps(data,root);
const mapCrops=require('./lib/classic-map-crops.cjs');
mapCrops.buildMapCrops(data,root);
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
 const nav=`<div class="classic-nav-home"><a href="${base}"${route?'':' aria-current="page"'}>专题首页</a><button class="classic-collapse-all" type="button" aria-controls="${groups.map((_,i)=>'classic-group-'+i).join(' ')}" aria-label="收起所有二级菜单">全部收起</button></div>`+groups.map(([t,items],index)=>{
  const target=base+groupRoutes[index],id='classic-group-'+index;
  return `<section class="classic-nav-group"><div class="classic-nav-group-heading"><h2><a href="${href(target)}"${url===target?' aria-current="page"':''}>${esc(t)}</a></h2><button class="classic-group-toggle" type="button" aria-expanded="true" aria-controls="${id}" aria-label="收起栏目">−</button></div><div id="${id}" class="classic-nav-group-items">`+items.map(([label,u])=>`<a href="${href(base+u)}"${base+u===url?' aria-current="page"':''}>${esc(label)}</a>`).join('')+'</div></section>';
 }).join('');
 const crumbs=[{label:'GAME NOTE',href:'/'},{label:'Games',href:'/games/'},{label:'黯井微光',href:base,current:!route},...(parent?[{label:parent[0],href:base+parent[1]+'/'}]:[]),...(route?[{label:title,href:url,current:true}]:[])];
 const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(full)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://gamenote.cc${url}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://gamenote.cc${url}"><meta property="og:type" content="article">${noindex?'<meta name="robots" content="noindex,follow">':''}<link rel="stylesheet" href="/assets/classic.css"><link rel="stylesheet" href="/assets/classic-area-nav.css"><link rel="stylesheet" href="/assets/classic-menu.css"><link rel="stylesheet" href="/assets/classic-map.css">${entity?.fields.referenceDetailedRoute?'<link rel="stylesheet" href="/assets/classic-late-guide.css">':''}<script src="/assets/classic.js" defer></script><script type="application/ld+json" data-breadcrumb-schema>${routes.schema(crumbs)}</script></head><body class="classic" data-theme="classic"><a class="classic-skip" href="#main">跳到正文</a><div class="classic-shell"><aside class="classic-sidebar"><a class="classic-brand" href="/">GAME NOTE CLASSIC</a><details open><summary>攻略目录</summary><nav class="classic-nav" aria-label="攻略目录">${nav}</nav></details></aside><main class="classic-main" id="main">${routes.breadcrumb(crumbs,'classic')}<header><h1>${esc(title)}</h1><p class="classic-subtitle">${esc(states[status]||states.draft)} · 更新于 ${esc(updatedAt)}</p>${!route?'<div class="classic-banner"><div><small>GAME NOTE CLASSIC · 图文攻略专题</small><strong>黯井微光</strong></div><span>攻略整理中</span></div>':'<p class="classic-subtitle">GAME NOTE CLASSIC · 黯井微光</p>'}</header><article>${body}${areaNavigation(entity,route)}</article><nav class="classic-pager" aria-label="文章分页">${previous?link('← '+previous.title,base+previous.route):'<span>暂无上一页</span>'}${link('目录',base+(parent?parent[1]+'/':''))}${next?link(next.title+' →',base+next.route):'<span>暂无下一页</span>'}</nav><footer class="classic-footer">${link('返回 GAME NOTE','/')} · 本专题持续整理；未核实内容不作为游戏结论。</footer></main></div></body></html>`;
 const file=path.join(root,'games/an-jing-wei-guang',route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});writeFile(file,html+'\n');if(!noindex)pages.push(url);
}
const game=data.game;

const fieldTitles={referenceRoute:'参考推进路线',referenceStrategy:'参考战斗要点',referenceChecklist:'收集核对要点',referenceOrientation:'参考区域定位',referenceEffect:'参考作用',referenceAcquisition:'参考获取方式',overview:'区域概览',previousAreas:'前一区域',nextAreas:'后续区域',bosses:'Boss',abilities:'能力',npcs:'NPC',collectibles:'收集记录',importantLocations:'重要节点',routeNotes:'★ 录像流程记录',area:'出现区域',encounterOrder:'★ 遭遇信息',location:'位置',attacks:'已观察的攻击画面',attackPatterns:'已观察的攻击方式',strategy:'推荐打法',reward:'奖励',afterBattle:'战后路线',type:'类型',obtainedAt:'获取节点',requirements:'条件',function:'实际功能',unlocks:'开放路线',acquisition:'获取方式',relatedAreas:'相关区域',relatedCollectibles:'相关收集',category:'分类',abilityRequired:'所需能力',count:'当前资料记录',startNpc:'起始 NPC',steps:'任务步骤',prerequisite:'前置条件',relatedGuides:'相关攻略',relatedGuide:'相关攻略',earlyRoute:'P1 早期推进关系'};
const relationFields=new Set(['previousAreas','nextAreas','bosses','abilities','collectibles','area','relatedAreas','relatedCollectibles','relatedGuides','relatedGuide','earlyRoute']);
const refs=new Map();for(const [section,records] of [['walkthrough',areas],['bosses',bosses],['abilities',abilities],['collectibles',collectibles],['quests',quests],['collectibles/key-items',keyItems],['achievements',achievements]])for(const e of records)refs.set(e.id,[name(e),base+section+'/'+e.slug+'/']);
function valueText(value,key){
 if(Array.isArray(value))return value.map(item=>valueText(item,key)).join('<br>');
 if(value&&typeof value==='object'){if(value.url&&value.label)return link(value.label,value.url);return esc(value.text||value.name||'')}
 if(relationFields.has(key)&&refs.has(value)){const [label,url]=refs.get(value);return link(label,url)}
 return esc(readerText(value));
}
fieldTitles.referencePuzzle='机关解法';
function facts(e,{map=false}={}){
 if(!canPublish(e))return '<p class="classic-subtitle">当前保留名称目录；相关事实仍在核验。</p>';
 if(map){
  const maps=e.images.filter(i=>approvedImage(i)&&/地图|区域图/.test(i.caption));
  const notes=regionalMapNotes.find(n=>n.id===e.id);
  const scene=notes?.image?e.images.find(i=>i.src===notes.image):null;
  if(notes?.image&&!approvedImage(scene))throw Error('Unapproved map landmark image '+e.id);
  return (mapCrops.markup(e)||(maps.length?heading('局部地图参考')+maps.map(imageBlock).join(''):''))+
   (scene?heading('场景识别参考')+imageBlock(scene):'')+
   (notes?heading('地图定位与地标')+table('区域定位资料',['地标 / 节点','识别方式','地图阅读提示'],notes.rows):confirmed(e.fields.referenceOrientation)?heading('参考区域定位')+'<p>'+valueText(e.fields.referenceOrientation.value,'referenceOrientation')+'</p>':'<p>该区域的地图位置资料尚待补充。</p>');
 }
 let out=(map?'<p class="classic-subtitle">以下为已确认的区域节点与录像画面，不等同于完整地图。</p>':'')+(publicValue(e,'description')?'<p>'+esc(publicValue(e,'description'))+'</p>':'');
 const guideImages=new Set(['guide','mapGuide'].flatMap(key=>confirmed(e.fields[key])?e.fields[key].value.filter(b=>confirmed({...b,value:b.text||b.src})).map(b=>b.src):[]));
 out+=e.images.filter(i=>!guideImages.has(i.src)).map(imageBlock).join('');
 for(const [key,field] of Object.entries(e.fields)){
  if(e.fields.referenceDetailedRoute&&['referenceRoute','referenceOrientation'].includes(key))continue;
  if(!confirmed(field)||['nameEn','nameZh','description','descriptionEn','guide','mapGuide','previousAreas','nextAreas','referenceDetailedRoute'].includes(key))continue;
  if(e.id==='dollmakers-house'&&key==='referencePuzzle'){
   out+=heading('从沼泽入口到救出玛格达','magda-route')+'<ol>'+field.value.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>'+
    list([['玩偶师之镜打法',base+'bosses/dollmaker/'],['墙壁弹射',base+'abilities/wall-sling/']]);
   continue;
  }
  if(e.id==='the-deep'&&key==='referencePuzzle'){
   out+=heading('鱼雷与两道水下闸门','underwater-gates')+'<ol>'+field.value.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>'+
    list([['鱼雷',base+'abilities/torpedo/'],['无限攀爬',base+'abilities/endless-climb/']]);
   continue;
  }
  if(e.id==='desiccated-castle'&&key==='referencePuzzle'){
   out+=heading('躲避女王与取得悬停','hover-route')+'<ol>'+field.value.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>'+
    list([['悬停',base+'abilities/hover/'],['躲避女王成就',base+'achievements/hide-and-seek/']]);
   continue;
  }
  if(e.id==='the-docks'&&key==='referencePuzzle'){
   out+=heading('码头门石与载具路线','gate-stones')+'<ol>'+field.value.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>'+
    list([['码头地图',base+'maps/the-docks/'],['深海生物打法',base+'bosses/creature-from-the-deep/'],['水上载具',base+'abilities/water-vessel/']]);
   continue;
  }
  out+=heading(fieldTitles[key]||key)+(['referenceRoute','referenceStrategy','referenceChecklist'].includes(key)?'<ul class="classic-links">'+field.value.map(item=>'<li>'+valueText(item,key)+'</li>').join('')+'</ul>':'<p>'+valueText(field.value,key)+'</p>');
 }
 out+=lateGuide.markup(e);
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
 heading('资料整理状态')+table('攻略整理进度',['栏目','当前状态'],[
 ['区域',areas.filter(canPublish).length+' 个区域已有路线或参考节点'],['Boss / encounter',bosses.filter(e=>confirmed(e.fields.referenceStrategy)||confirmed(e.fields.attacks)).length+' 场遭遇已有战斗要点'],
 ['能力 / 系统',abilities.length+' 个条目；获取方式整理中'],['收集',collectibles.length+' 类；具体位置待核验'],
 ['任务',quests.filter(canPublish).length+' 条任务已有推进提示'],['成就',achievements.length+' 条已整理 / '+publicValue(game,'steamAchievements')+' 项 Steam 成就']
 ])+notice('本站当前是可持续核验的资料专题，不是已完成的全收集攻略。')+heading('最近更新')+updateList(5),{status:'in-progress'});
const progressionHelp=[
 ["排水道升降机还没修好","找齐三件电梯部件，再回中央帐篷旁的升降机。若还差一件，先按部件路线确认漏了哪条支路。","修理升降机攻略","quests/repair-the-elevator/"],
 ["码头大门没开","在码头找齐三块门石，跟地图标记回大门。门后的战斗结束后继续到篝火，完成船员与 Barge 的对话才能驾驶载具。","码头推进路线","walkthrough/the-docks/"],
 ["长墙爬到一半就掉下来","完成深海的针儿与刺儿救援，回码头船坞找 Barge 学无限攀爬，再回访长墙。","无限攀爬获取方式","abilities/endless-climb/"],
 ["女王城堡还进不去","回沼泽之前先核对七根金色羽毛。容易遗漏的是战后的领取步骤，例如七子神龛战后继续向西，掘墓者战后去参加 Squinton 的聚会。","七根金色羽毛位置","collectibles/golden-feathers/"],
];
const abilityRevisits=[
 ["弹弓 → 秋日森林帐篷","用弹弓玩射靶小游戏。金色靶给一个饰物槽，窄浅蓝靶给蓝色蝴蝶结。","autumn-forest"],
 ["悬停 → 瞭望塔窄缝","同时带上攀爬和弹弓。把火柴射过窄缝，借它弹到上方的饰物槽。对应饰物槽清单图文第 35 项。","lookout-tower"],
 ["鱼雷 → 深海饰物槽","按饰物槽清单图文第 49 项回查鱼雷路线。清单紧接着的第 50 项也在深海，无需额外能力，可以一起核对。","the-deep"],
 ["无限攀爬 → 埋葬墓穴","带上悬停，回墓穴拿图文第 80 项饰物槽。墓穴里还有一枚藏在暗道的工坊代币，也需要这两项能力。","burial-vault"],
];
page('walkthrough/','流程攻略目录','Well Dweller 区域流程攻略目录。',
 heading('主线卡关速查','progression-help')+progressionHelp.map(([problem,steps,label,route])=>
  '<h3>'+esc(problem)+'</h3><p>'+esc(steps)+'</p><p>'+link(label,base+route)+'</p>').join('')+
 heading('拿到新能力后去哪','ability-revisits')+abilityRevisits.map(([title,steps,slug])=>
  '<h3>'+esc(title)+'</h3><p>'+esc(steps)+'</p><p>'+link('区域流程',base+'walkthrough/'+slug+'/')+'</p>').join('')+
 list([['饰物槽位置清单',base+'collectibles/trinket-slots/'],['工坊代币位置清单',base+'collectibles/workshop-tokens/']])+
 catalogue(areas.slice(0,14),'walkthrough')+heading('其他区域','other')+catalogue(areas.slice(14),'walkthrough'));
for(const e of data.walkthroughs)page('walkthrough/'+e.slug+'/',name(e),e.description,notice('P1 图文正文已按阅读段落分到以下两个区域页，内容没有删除。小屋片段在夜之庭园页中明确标为后续探索，不改变其区域归属。')+list(e.readingRoutes.map(slug=>[name(areas.find(a=>a.slug===slug)),base+'walkthrough/'+slug+'/'])),{parent:['流程攻略','walkthrough'],noindex:true});
for(const [index,e] of areas.entries()){
 const adjacent=area=>area&&{title:name(area),route:'walkthrough/'+area.slug+'/'};
 const related=[['区域地图',base+'maps/'+e.slug+'/'],['流程目录',base+'walkthrough/']];
 if(e.slug==='the-deep')related.unshift(['饰物槽位置清单',base+'collectibles/trinket-slots/'],['故事书页位置清单',base+'collectibles/story-pages/']);
 if(e.slug==='the-drains')related.unshift(['饰物位置清单',base+'collectibles/trinkets/'],['排水道计时挑战',base+'challenges/time-trials/time-trial-the-drains/']);
 if(e.slug==='hunters-cabin')related.unshift(['猎人小屋计时挑战',base+'challenges/time-trials/time-trial-hunters-cabin/'],['灵魂位置清单',base+'collectibles/spirits/']);
 if(e.slug==='night-garden')related.unshift(['灵魂位置清单',base+'collectibles/spirits/']);
 if(['the-drains','graven-valley'].includes(e.slug))related.push(['灵魂位置清单',base+'collectibles/spirits/']);
 if(e.slug==='graven-valley')related.unshift(['饰物位置清单',base+'collectibles/trinkets/']);
 if(e.slug==='desiccated-castle')related.unshift(['饰物位置清单',base+'collectibles/trinkets/'],['故事书页位置清单',base+'collectibles/story-pages/']);
 if(e.slug==='the-docks')related.unshift(['饰物位置清单',base+'collectibles/trinkets/'],['码头计时挑战',base+'challenges/time-trials/time-trial-the-docks/']);
 if(e.slug==='midnight-drench')related.unshift(['七子神龛打法',base+'bosses/shrine-of-the-seven-sons/'],['悬停',base+'abilities/hover/'],['墓谷救援流程',base+'quests/graven-valley-rescue/'],['干涸城堡流程',base+'walkthrough/desiccated-castle/'],['饰物位置清单',base+'collectibles/trinkets/'],['故事书页位置清单',base+'collectibles/story-pages/']);
 if(e.slug==='lookout-tower')related.unshift(['星歌者打法',base+'bosses/starsinger/'],['七根金色羽毛位置',base+'collectibles/golden-feathers/'],['灵魂位置清单',base+'collectibles/spirits/'],['工坊代币位置清单',base+'collectibles/workshop-tokens/']);
 if(e.slug==='autumn-forest')related.unshift(['四处石球与石柱机关',base+'challenges/puzzle-solutions/#autumn-forest'],['森林之王',base+'bosses/forest-king/'],['猎人小屋地图',base+'maps/hunters-cabin/'],['夜之庭园地图',base+'maps/night-garden/'],['悬停',base+'abilities/hover/'],['灵魂位置清单',base+'collectibles/spirits/'],['秋日森林计时挑战',base+'challenges/time-trials/time-trial-autumn-forest/']);
 page('walkthrough/'+e.slug+'/',name(e),e.nameEn+' 已确认区域资料与流程记录。',facts(e)+heading('相关攻略')+list(related),{parent:['流程攻略','walkthrough'],previous:adjacent(areas[index-1]),next:adjacent(areas[index+1]),entity:e});
 page('maps/'+e.slug+'/',name(e)+' · 地图',e.nameEn+' 已确认区域节点；截图不等同于完整地图。',facts(e,{map:true})+'<details class="classic-map-structure"><summary>查看区域结构示意</summary>'+worldMap.markup(e)+'</details>'+heading('相关攻略')+list([['世界结构示意图',base+'maps/world/'],['区域流程',base+'walkthrough/'+e.slug+'/'],['区域地图目录',base+'maps/']]),{parent:['区域地图','maps'],entity:e});
}
page('maps/','地图目录','Well Dweller 区域地图参考目录。','<p>地图章节提供局部地图与地标定位；完整路线步骤仍在流程攻略中阅读。</p>'+list([['世界结构示意图',base+'maps/world/']])+heading('已补充区域')+table('可用地图资料',['区域','现有内容'],areas.filter(a=>regionalMapNotes.some(n=>n.id===a.id)).map(a=>[linkedName(a,'maps'),a.images.some(i=>approvedImage(i)&&/地图|区域图/.test(i.caption))?'局部地图与地标定位':'地标定位与区域结构视图']))+heading('后续区域')+catalogue(areas.filter(a=>!regionalMapNotes.some(n=>n.id===a.id)),'maps'));
page('maps/world/','世界地图 · 区域结构示意','Well Dweller 原创区域结构示意与区域地图入口。',heading('可查看的局部地图')+list(mapCrops.crops.map(c=>[c.titleZh,base+'maps/'+c.id+'/']))+worldMap.markup()+heading('区域地图入口')+catalogue(areas,'maps')+'<p>'+link('区域资料参考：Gamer Guides',worldMap.graph.referenceUrl)+'</p>',{parent:['地图','maps']});
page('maps/hidden-paths/','隐藏通道','通关后五处腾空入口与辨认地标。',
 '<p>在存档帐篷的拾荒者商店可购买玻璃眼，标价 450。装备后可看见隐藏通道。寻找入口时可先装备它，再按各条路线准备攀爬或腾空等能力。</p>'+
 '<p>'+link('玻璃眼获取与效果','https://gamersocialclub.ca/2026/09/21/well-dweller-all-trinket-locations-for-the-expert-collector-achievement-trophy-guide/')+'</p>'+
 heading('主线途中')+table('隐藏入口',['区域','入口地标'],[
  ['墓谷','学会攀爬后，检查灵魂所在房间的左上角，沿隐藏通道进去拾取。'],
  ['秋日森林','击败森林之王后，进入放金羽毛的房间。找伊尔达右侧的隐藏通道，里面有一页故事。'],
  ['埋葬墓穴','玩偶师故事页的房间可对照下方图文的 Story Page 18/23 地图。另一处暗道对应 Workshop Token 25/27。带上悬停、无限攀爬和墙壁弹射，进暗道后打破挡路的障碍。'],
  ['玩偶师之家','对照下方图文的 Workshop Token 26/27 地图找到房间，带上弹弓与无限攀爬，爬入暗道取得代币。']
 ])+list([
  ['埋葬墓穴：故事页地图','https://gamersocialclub.ca/2026/09/22/well-dweller-100-collectibles-achievement-trophy-walkthrough/#:~:text=Story%20Page%2018%20%2F%2023'],
  ['埋葬墓穴：工坊代币地图','https://gamersocialclub.ca/2026/09/22/well-dweller-100-collectibles-achievement-trophy-walkthrough/#:~:text=Workshop%20Token%2025%20%2F%2027'],
  ['玩偶师之家：工坊代币地图','https://gamersocialclub.ca/2026/09/22/well-dweller-100-collectibles-achievement-trophy-walkthrough/#:~:text=Workshop%20Token%2026%20%2F%2027'],
  ['收集实机图文','https://gamersocialclub.ca/2026/09/22/well-dweller-100-collectibles-achievement-trophy-walkthrough/']
 ])+
 heading('通关后的探索')+'<p>通关后在女王寝室解锁腾空，再到能力蛋所在鸟巢的上方拿神秘标记。地图标出的五处入口可按下列地标查找。</p>'+
 table('腾空入口',['区域','入口地标','互动地图站点'],[
  ['玩偶师之家','dollmakers-house','最高一层通道的中央房间。向上腾空进入隐藏区。',8],
  ['夜之庭园','night-garden','与沼泽相接的最西侧房间。腾空进入上方战斗房。',9],
  ['秋日森林','autumn-forest','计时挑战房西侧的房间。向上腾空进入平台跳跃路线。',10],
  ['码头','the-docks','低语者小屋旁的帐篷向东，到桥上腾空。',11],
  ['干涸城堡','desiccated-castle','东南角帐篷右侧的鸟巢。站在巢上腾空进入隐藏塔。',12],
  ['夜之庭园','night-garden','收齐后，回平时交还灵魂的鸟巢触发团聚结局。',13]
 ].map(([label,slug,landmark,stop])=>[{html:link(label,base+'maps/'+slug+'/')},landmark,String(stop)]))+
 list([['五枚灵魂碎片路线',base+'collectibles/spirit-fragments/'],['打开真结局互动地图','https://www.gamerguides.com/well-dweller/maps/the-kingdom?route=post-game-guide-and-how-to-unlock-the-true-ending']]),{parent:['地图','maps']});
page('maps/locked-doors/','反锁门','沼泽帐篷捷径、下水道机关门与女王寝室的开门方法。',
 heading('沼泽')+'<p>帐篷右侧的路被挡住时，先往左越过平台。进入有气泡的房间，借气泡升到顶层，向右经过飞虫，从右侧出口下落。到了路障另一边，打一下开关就能开通回帐篷的捷径。</p>'+
 heading('下水道')+'<p>升降机抵达底层后一路向右，找聚在开关下方的青蛙。用弹弓击中上方的开关，打开右边的门。</p>'+
 heading('女王城堡')+'<p>通关后回女王战场上方，与锁门旁的拾荒者对话，再敲天花板拉杆进入寝室。寝室西门要集齐 32 件饰物才能打开。</p>'+
 list([['女王金币',base+'collectibles/key-items/the-queens-coin/'],['沼泽捷径参考','https://intoindiegames.com/walkthroughs/well-dweller-walkthrough-part-2-exploring-the-bog/'],['下水道开门参考','https://intoindiegames.com/walkthroughs/well-dweller-walkthrough-part-3-navigating-the-drains/']]),{parent:['地图','maps']});
page('maps/breakable-walls/','可破坏墙壁','沼泽的两处可破坏墙壁与通过方法。',
 heading('沼泽')+'<p>沿下层通道向左走，清掉沿路敌人。打破房间左下角的墙，从低矮缺口滑进下一间，继续左行可遇见被飞虫围攻的伊尔达。</p>'+
 '<p>从存档帐篷向左越过平台，看到前方的可破坏墙壁时，同时检查头顶。打破面前的墙和上方的表面，再继续向左。</p>'+
 list([['沼泽流程',base+'walkthrough/the-bog/'],['沼泽破墙实机路线','https://intoindiegames.com/walkthroughs/well-dweller-walkthrough-part-2-exploring-the-bog/']]),{parent:['地图','maps']});
page('bosses/','Boss / encounter 目录','Well Dweller 首领与遭遇目录。',catalogue(bosses,'bosses'));
for(const e of bosses)page('bosses/'+e.slug+'/',name(e),e.nameEn+' 已确认的遭遇资料。',facts(e)+(e.aliases?'<p class="classic-subtitle">名称存在来源差异：'+esc(e.aliases.join(' / '))+'</p>':'')+heading('相关攻略')+list([...(publicValue(e,'area')&&refs.has(publicValue(e,'area'))?[refs.get(publicValue(e,'area'))]:[]),['Boss 目录',base+'bosses/']]),{parent:['Boss / encounter','bosses'],entity:e});
const referenceSources=item=>[...new Set([...item.effectSources,...item.locationSources])].map(id=>{const s=abilityReference.sources[id];return link(s.name,s.url)}).join('<br>');
const referenceNotes=e=>{
 const item=abilityReference.entries.find(item=>item.id===e.id);if(!item)return '';
 const next=e.id==='soar'?list([
  ['饰物',base+'collectibles/trinkets/'],
  ['神秘标记',base+'collectibles/key-items/mysterious-markings/'],
  ['灵魂碎片',base+'collectibles/spirit-fragments/']
 ]):'';
 return (!item.locationSources.length?heading('获取方式')+'<p>'+esc(item.acquisition)+'</p>':'')+next+heading('参考来源')+'<p>'+referenceSources(item)+'</p>';
};
page('abilities/','能力 / 系统目录','Well Dweller 移动、核心能力与推进解锁资料。',abilityGroups.map(([group,title])=>heading(title,group)+table(title,['名称','作用','获取方式 / 地点','资料状态','参考来源'],abilityReference.entries.filter(item=>item.group===group).map(item=>[{html:link(name(referenceRecord(item)),base+referenceRoute(item))},item.effect,item.acquisition,item.locationPending?'作用已核对 · 位置待确认':'网页资料已核对',{html:referenceSources(item)}]))).join('')+heading('相关资料','items')+list([['关键物品',base+'collectibles/key-items/']]));
for(const e of abilities)page('abilities/'+e.slug+'/',name(e),e.nameEn+' 已确认能力资料。',facts(e)+referenceNotes(e)+heading('相关攻略')+list([...(abilityReference.entries.find(item=>item.id===e.id)?.area?[[name(areas.find(a=>a.id===abilityReference.entries.find(item=>item.id===e.id).area)),base+'walkthrough/'+abilityReference.entries.find(item=>item.id===e.id).area+'/']]:[]),['能力 / 系统目录',base+'abilities/']]),{parent:['能力 / 系统','abilities'],entity:e});
function countLabel(e){const value=publicValue(e,'count');return value===null?'—':'当前资料记录：'+value}
const postgameCollectionSteps=[
 ["回女王寝室拿金币，再去帐篷补买缺少的饰物和饰物槽。","女王金币","collectibles/key-items/the-queens-coin/"],
 ["按区域救出剩下的灵魂，回夜之庭园鸟巢交齐 20 个。最后一件灵魂奖励饰物也算进 32 件。","灵魂位置清单","collectibles/spirits/"],
 ["收齐 32 件饰物后开女王寝室西门，学会腾空并拿神秘标记。回访时可以顺路拿此前上不去的槽位。","饰物位置清单","collectibles/trinkets/"],
 ["学会腾空后按标记找齐五枚灵魂碎片，再回鸟巢触发团聚结局。","灵魂碎片","collectibles/spirit-fragments/"],
 ["补其余收集时，先在菜单按三本故事核对 23 页，再按工坊菜单检查哪些饰物还没升满。"],
];
page('collectibles/','收集分类','Well Dweller 收集分类与已确认资料。',
 heading('通关后收集顺序')+'<ol>'+postgameCollectionSteps.map(([step,label,route])=>
  '<li><p>'+esc(step)+'</p>'+(label?'<p>'+link(label,base+route)+'</p>':'')+'</li>').join('')+'</ol>'+
 list([['故事书页位置清单',base+'collectibles/story-pages/'],['工坊代币位置清单',base+'collectibles/workshop-tokens/'],['饰物槽位置清单',base+'collectibles/trinket-slots/']])+
 table('收集分类',['名称','数量资料','状态'],collectibles.map(e=>[linkedName(e,'collectibles'),countLabel(e),status(e)])));
const goldenFeatherRoutes=[
 ["排水道", "修好升降机，在底层击败排水道女士，再到后续房间拾取。", "walkthrough/the-drains/"],
 ["午夜暴雨", "击败七子神龛后继续往西，进后续房间拾取。", "bosses/shrine-of-the-seven-sons/"],
 ["拾荒者零件", "找齐四件零件，回接任务的地方交给低语者，完成修复后领取。", "collectibles/looter-parts/"],
 ["瞭望塔", "登顶击败星歌者后，沿战后路线领取金色羽毛。", "bosses/starsinger/"],
 ["秋日森林", "击败东北侧的森林之王后，继续向东进下一间拾取。", "bosses/forest-king/"],
 ["埋葬墓穴", "击败掘墓者后从左侧离场，到 Squinton 的住处参加聚会，完成剧情再领取。", "quests/a-ride-to-the-party/"],
 ["蛛雨旅店", "完成旅店老板追逐，在末段滑出旅店回到午夜暴雨时获得。", "achievements/late-night-guest/"],
];
for(const e of collectibles){
 const featherChecklist=e.slug==='golden-feathers'?
  table('七根金色羽毛领取点',['地点或任务','如何领取'],goldenFeatherRoutes.map(([label,steps,route])=>[{html:link(label,base+route)},steps]))+
  '<p>七根齐全后回沼泽的城堡入口。瞭望塔增加飞行时长的羽毛单独计算。</p>'+
  list([['前往女王城堡',base+'walkthrough/queens-castle/']]):'';
 const related=[['收集目录',base+'collectibles/']];
 if(e.slug==='spirit-fragments')related.unshift(['五处腾空入口地图',base+'maps/hidden-paths/'],['团聚结局成就',base+'achievements/together-at-last/']);
 if(e.slug==='looter-parts'){
  related.unshift(['无限攀爬',base+'abilities/endless-climb/'],['码头地图',base+'maps/the-docks/'],
   ['墓谷地图',base+'maps/graven-valley/'],['干涸城堡地图',base+'maps/desiccated-castle/'],
   ['排水道地图',base+'maps/the-drains/'],['沼泽地图',base+'maps/the-bog/'],
   ['把拾荒者重新拼起来',base+'achievements/stitched-back-together/']);
 }
 page('collectibles/'+e.slug+'/',name(e),e.nameEn+' 已确认收集资料。',featherChecklist+facts(e)+(e.slug==='key-items'?catalogue(keyItems,'collectibles/key-items'):'')+heading('相关攻略')+list(related),{parent:['收集分类','collectibles'],entity:e});
}
for(const e of keyItems){
 const related=[['Key Items',base+'collectibles/key-items/']];
 if(abilityReference.entries.some(item=>item.id===e.id))related.push(['推进 / 功能解锁',base+'abilities/#progression']);
 if(e.id==='mysterious-markings')related.push(['腾空',base+'abilities/soar/'],['灵魂碎片',base+'collectibles/spirit-fragments/']);
 page('collectibles/key-items/'+e.slug+'/',name(e),e.nameEn+' 已确认物品资料。',facts(e)+referenceNotes(e)+heading('相关攻略')+list(related),{parent:['Key Items','collectibles/key-items'],entity:e});
}
page('quests/','任务目录','Well Dweller 任务目录与已确认步骤。',catalogue(quests,'quests'));
const elevatorPartsChecklist=collectibles.find(e=>e.slug==='elevator-parts')?.fields.referenceChecklist;
for(const e of quests){
 const related=[['任务目录',base+'quests/']];
 let route='';
 if(e.slug==='graven-valley-rescue')related.unshift(['墓谷地图',base+'maps/graven-valley/'],['莉达打法',base+'bosses/lida-the-terrible/'],['午夜暴雨流程',base+'walkthrough/midnight-drench/']);
 if(e.slug==='the-queens-chamber')related.unshift(['女王城堡地图',base+'maps/queens-castle/'],['银色玩偶打法',base+'bosses/silver-doll/'],['女王打法',base+'bosses/the-queen/']);
 if(e.slug==='a-ride-to-the-party')related.unshift(['埋葬墓穴地图',base+'maps/burial-vault/'],['掘墓者打法',base+'bosses/gravedigger/'],['七根金色羽毛位置',base+'collectibles/golden-feathers/']);
 if(e.slug==='repair-the-elevator'){
  if(confirmed(elevatorPartsChecklist)){
   route=heading('三件升降机部件路线','elevator-parts')+'<ol>'+elevatorPartsChecklist.value.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>';
  }
  related.unshift(['排水道地图',base+'maps/the-drains/'],['排水道女士打法',base+'bosses/the-lady-of-the-drains/']);
 }
 page('quests/'+e.slug+'/',name(e),e.nameEn+' 已确认任务资料。',facts(e)+route+heading('相关攻略')+list(related),{parent:['任务','quests'],entity:e});
}
page('achievements/','成就一览','黯井微光 41 项 Steam 官方中文版成就名称与说明。',
 '<p>Steam 成就共 41 项。</p>'+
 table('Steam 中文成就',['成就名称','官方说明'],achievements.map(e=>[linkedName(e,'achievements'),publicValue(e,'description','')]))+'<p>'+link('Steam 官方中文版成就列表','https://steamcommunity.com/stats/3699590/achievements/?l=schinese')+'</p>');
const achievementBosses={
 'dark-garden':'the-groundskeeper',
 'buggy-business':'the-swarm',
 'down-the-drain':'the-lady-of-the-drains',
 'stormy-night':'shrine-of-the-seven-sons',
 'song-of-stars':'starsinger',
 'digging-deep':'gravedigger',
 'sharp-and-shiny':'silver-doll',
 'endgame':'the-queen',
};
for(const e of achievements){
 const related=[['成就目录',base+'achievements/']];
 const bossSlug=achievementBosses[e.id];
 if(bossSlug)related.unshift(['查看完整首领打法',base+'bosses/'+bossSlug+'/']);
 if(e.id==='littlest-bird')related.unshift(['墓谷救援流程',base+'quests/graven-valley-rescue/']);
 if(e.id==='into-the-deep')related.unshift(['水上载具',base+'abilities/water-vessel/']);
 if(e.id==='double-trouble')related.unshift(['深海流程',base+'walkthrough/the-deep/']);
 if(e.id==='at-the-dollmakers-house')related.unshift(['玩偶师之家流程',base+'walkthrough/dollmakers-house/']);
 if(['first-purchase','amateur-collector','veteran-collector','expert-collector'].includes(e.id))related.unshift(['饰物位置清单',base+'collectibles/trinkets/']);
 if(['ten-slots','50-slots'].includes(e.id))related.unshift(['饰物槽位置清单',base+'collectibles/trinket-slots/']);
 if(['in-the-workshop','fully-stocked'].includes(e.id))related.unshift(['工坊代币位置清单',base+'collectibles/workshop-tokens/']);
 if(e.id==='kings-hat')related.unshift(['秋日森林流程',base+'walkthrough/autumn-forest/']);
 if(e.id==='splendid-feast')related.unshift(['森林之王',base+'bosses/forest-king/']);
 if(e.id==='late-night-guest')related.unshift(['蛛雨旅店流程',base+'walkthrough/webdrench-inn/']);
 if(e.id==='snatched-up')related.unshift(['井底流程',base+'walkthrough/the-well/']);
 if(e.id==='a-warm-fire')related.unshift(['沼泽流程',base+'walkthrough/the-bog/']);
 if(e.id==='taking-a-break')related.unshift(['排水道流程',base+'walkthrough/the-drains/']);
 if(e.id==='stitched-back-together')related.unshift(['拾荒者部件清单',base+'collectibles/looter-parts/']);
 if(['once-upon-a-time','above-the-kingdom','the-tattered-doll','the-first-born-daughter'].includes(e.id))related.unshift(['故事书页位置清单',base+'collectibles/story-pages/']);
 if(['lonely-soul','halfway-there','complete-flock'].includes(e.id))related.unshift(['灵魂位置清单',base+'collectibles/spirits/']);
 if(e.id==='flying-high')related.unshift(['腾空',base+'abilities/soar/'],['饰物',base+'collectibles/trinkets/']);
 page('achievements/'+e.slug+'/',name(e),publicValue(e,'description','Steam 成就资料。'),facts(e)+heading('相关攻略')+list(related),{parent:['成就','achievements'],entity:e});
}
page('challenges/','挑战目录','Well Dweller Time Trials 与解谜资料入口。',list([['计时挑战',base+'challenges/time-trials/'],['谜题解法',base+'challenges/puzzle-solutions/']]));
const trialRewards={
 'night-garden':'trinket-slots','desiccated-castle':'trinket-slots','midnight-drench':'spirits',
 'hunters-cabin':'spirits','autumn-forest':'spirits','the-docks':'trinket-slots','the-bog':'spirits',
 'dollmakers-house':'workshop-tokens','graven-valley':'trinket-slots','the-drains':'trinkets'
};
page('challenges/time-trials/','计时挑战','Well Dweller 计时挑战目录。',
 '<p>按区域打开挑战攻略，完成后继续进入奖励房拾取。补收集时，可以按右栏的奖励类型查漏。</p>'+
 table('十场计时挑战',['挑战攻略','区域地图','奖励类型'],challenges.map(e=>{
  const areaSlug=e.slug.replace(/^time-trial-/,'');
  const reward=collectibles.find(item=>item.slug===trialRewards[areaSlug]);
  return [
   {html:link(name(e),base+'challenges/time-trials/'+e.slug+'/')},
   {html:link('区域地图',base+'maps/'+areaSlug+'/')},
   reward?{html:link(name(reward),base+'collectibles/'+reward.slug+'/')}:''
  ];
 })));
for(const e of challenges){
 const areaSlug=e.slug.replace(/^time-trial-/,'');
 const reward=trialRewards[areaSlug];
 const related=heading('相关攻略')+list([['区域地图',base+'maps/'+areaSlug+'/'],['区域流程',base+'walkthrough/'+areaSlug+'/'],
  ...(reward?[['查看对应收集清单',base+'collectibles/'+reward+'/']]:[])]);
 page('challenges/time-trials/'+e.slug+'/',name(e)+' · Time Trial','已确认计时挑战资料。',facts(e)+related,{parent:['计时挑战','challenges/time-trials'],entity:e});
}
const puzzleAreas=areas.filter(e=>confirmed(e.fields.referencePuzzle));
const puzzleTopics={
 'desiccated-castle':'躲避女王与取得悬停',
 'autumn-forest':'四处石球与石柱机关',
 'the-docks':'三块门石与水上载具',
 'the-deep':'鱼雷与两道水下闸门',
 'dollmakers-house':'敲铃平台、拉杆与计时挑战'
};
const puzzleIndex=table('按机关查找',['区域','机关'],puzzleAreas.map(e=>[
 {html:link(name(e),'#'+e.id)},puzzleTopics[e.id]||name(e)
]));
page('challenges/puzzle-solutions/','谜题解法','Well Dweller 谜题资料。',
 puzzleIndex+puzzleAreas.map(e=>
  heading(name(e),e.id)+'<ol>'+e.fields.referencePuzzle.value.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>'+
  list([['区域流程',base+'walkthrough/'+e.slug+'/'],['区域地图',base+'maps/'+e.slug+'/']])+
  heading('参考资料')+list(e.fields.referencePuzzle.sources.map(source=>[source.name,source.url]))
 ).join(''),{parent:['挑战','challenges'],noindex:!puzzleAreas.length});
page('systems/','系统说明','Well Dweller 游戏基础资料与系统目录。',
 heading('游戏简介','intro')+'<p>'+esc(game.description)+'</p><p>'+link('Steam 官方商店',publicValue(game,'storeUrl'))+'</p>'+table('游戏基础资料',['项目','资料'],[['开发者',publicValue(game,'developer')],['发行商',publicValue(game,'publishers',[]).join(' / ')],['发售日',publicValue(game,'releaseDate')],['官方类型',publicValue(game,'officialCategories',[]).join(' / ')]])+
 heading('系统目录')+list(systemsReference.map(section=>[section.title,base+'systems/#'+section.id]))+
 systemsReference.map(section=>heading(section.title,section.id)+'<p>'+esc(section.text)+'</p><p>'+link(section.relatedLabel,base+section.related)+' · '+link('参考资料',section.source)+'</p>').join('')+
 heading('相关目录')+list([['能力与获取方式',base+'abilities/'],['收集目录',base+'collectibles/']]));
page('secrets/','隐藏内容','Well Dweller 通关后的能力与灵魂碎片探索入口。',heading('通关后的探索','endings')+'<p>击败女王后先到寝室拿金币。集齐 32 件饰物打开寝室西门，学会腾空，再拿神秘标记。找到五枚灵魂碎片后，回夜之庭园的灵魂鸟巢触发真结局。</p>'+list([['女王',base+'bosses/the-queen/'],['女王金币',base+'collectibles/key-items/the-queens-coin/'],['腾空',base+'abilities/soar/'],['神秘标记',base+'collectibles/key-items/mysterious-markings/'],['灵魂碎片',base+'collectibles/spirit-fragments/'],['灵魂',base+'collectibles/spirits/']])+'<p>'+link('通关后参考','https://gamersocialclub.ca/2026/09/21/well-dweller-unlock-the-together-at-last-achievement-trophy/')+'</p>');
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
fs.mkdirSync(path.dirname(manifestPath),{recursive:true});writeFile(manifestPath,JSON.stringify(pages,null,2)+'\n');
const sitemapPath=path.join(root,'sitemap.xml');let sitemap=fs.readFileSync(sitemapPath,'utf8').replace(/\s*<url><loc>https:\/\/gamenote\.cc\/games\/an-jing-wei-guang\/[^<]*<\/loc><\/url>/g,'');
sitemap=sitemap.replace('</urlset>',pages.map(u=>`  <url><loc>https://gamenote.cc${u}</loc></url>`).join('\n')+'\n</urlset>');writeFile(sitemapPath,sitemap);
console.log(`Generated ${pages.length} pages; verified facts published independently.`);

