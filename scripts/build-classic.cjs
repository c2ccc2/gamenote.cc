// V1 publication: templates only consume public/draft entities and independently approved fields.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadClassicData,visible,confirmed,publicValue,approvedImage}=require('./lib/classic-data.cjs');
const routes=require('../assets/routes.js');
const root=path.resolve(__dirname,'..'),base='/games/an-jing-wei-guang/';
const data=loadClassicData(root),ctx={window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/content.js'),'utf8'),ctx);
const shared=ctx.window.GAMENOTE_CONTENT;
const esc=v=>String(v??'待补充').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href=v=>{if(!/^(\/|https:\/\/|#)/.test(v)||v.startsWith('//'))throw Error('Invalid URL '+v);return esc(v)};
const link=(t,u)=>`<a href="${href(u)}">${esc(t)}</a>`;
const heading=(t,id='')=>`<h2 class="classic-heading"${id?` id="${esc(id)}"`:''}>${esc(t)}</h2>`;
const notice=t=>`<p class="classic-notice">${esc(t)}</p>`;
const table=(t,h,rows)=>`<div class="classic-table-wrap" tabindex="0" role="region" aria-label="${esc(t)}"><table class="classic-table"><caption>${esc(t)}</caption><thead><tr>${h.map(v=>`<th scope="col">${esc(v)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const list=items=>`<ul class="classic-links">${items.map(([t,u])=>`<li>→ ${link(t,u)}</li>`).join('')}</ul>`;
const name=e=>e.nameZh&&confirmed(e)?e.nameEn+' / '+e.nameZh:e.nameEn;
const status=e=>e.confidence==='D'?'待核验':e.publishStatus==='published'?'已整理':'整理中';
const publicList=key=>data[key].filter(visible);
const areas=publicList('areas'),bosses=publicList('bosses'),abilities=publicList('abilities'),collectibles=publicList('collectibles'),quests=publicList('quests'),keyItems=publicList('keyItems'),achievements=publicList('achievements'),challenges=publicList('challenges');
const groups=[
 ['游戏资料',[['游戏简介','systems/#intro'],['基本操作','systems/#controls'],['系统说明','systems/']]],
 ['流程攻略',[['流程总目录','walkthrough/'],...areas.slice(0,14).map(e=>[name(e),'walkthrough/'+e.slug+'/']),['其他区域','walkthrough/#other']]],
 ['地图',[['世界地图','maps/world/'],['区域地图','maps/'],['Hidden Paths','maps/hidden-paths/'],['Breakable Walls','maps/breakable-walls/'],['Locked Doors','maps/locked-doors/']]],
 ['Boss',bosses.map(e=>[e.slug==='dollmaker'?'Dollmaker（名称待核验）':name(e),'bosses/'+e.slug+'/'])],
 ['能力',abilities.map(e=>[name(e),'abilities/'+e.slug+'/'])],
 ['收集',collectibles.map(e=>[name(e),'collectibles/'+e.slug+'/'])],
 ['任务',quests.map(e=>[name(e),'quests/'+e.slug+'/'])],
 ['挑战',[['Time Trials','challenges/time-trials/'],['Puzzle Solutions','challenges/puzzle-solutions/']]],
 ['成就',[['Achievements','achievements/']]],
 ['其他内容',[['更新记录','updates/'],['相关手记','#related-notes']]]
];
const states={draft:'资料整理中','in-progress':'资料整理中',complete:'已整理',updated:'已修订'};
const updates=shared.updates.filter(u=>u.game==='an-jing-wei-guang').sort((a,b)=>b.date.localeCompare(a.date));
const updateList=limit=>`<ul class="classic-updates">${updates.slice(0,limit).map(u=>`<li><time datetime="${esc(u.date)}">${esc(u.date)}</time>${link(u.title,u.url)}<p>${esc(u.description)}</p></li>`).join('')}</ul>`;
const imageBlock=i=>approvedImage(i)?`<div class="classic-image-block center"><figure><a href="${href(i.src)}" aria-label="查看原图"><img src="${href(i.src)}" alt="${esc(i.caption)}" width="${i.width||460}" height="${i.height||215}" loading="lazy"></a><figcaption>${esc(i.caption)}</figcaption></figure></div>`:'';
function safeGuide(entity){
 const field=entity.fields.guide;if(!confirmed(field)||!Array.isArray(field.value))return '';
 return field.value.map(block=>{
  if(block.type==='heading')return heading(block.text);
  if(block.type==='notice')return notice(block.text);
  if(block.type==='paragraph')return '<p>'+esc(block.text)+'</p>';
  if(block.type==='image'){const image=entity.images.find(i=>i.src===block.src);return image?imageBlock(image):''}
  return '';
 }).join('');
}
const pending=topic=>`<p>${esc(topic)}整理中。核验后补充，不以目录名称推断具体玩法或路线。</p>`;
const entityNotice=e=>notice(e.publishStatus==='published'?'已确认条目 · 详细攻略整理中':e.confidence==='D'?'部分信息待核验 · 详细攻略整理中':'资料整理中');
const catalogue=(records,section)=>list(records.map(e=>[name(e)+' · '+status(e),base+section+'/'+e.slug+'/']));
const pages=[];
function page(route,title,description,body,{parent,previous,next,status='draft',updatedAt=data.updatedAt,noindex=false}={}){
 const url=base+route,full=`${title} — 黯井微光攻略 | GAME NOTE CLASSIC`;
 const nav=`<a href="${base}"${route?'':' aria-current="page"'}>专题首页</a>`+groups.map(([t,items])=>`<h2>${esc(t)}</h2>`+items.map(([label,u])=>`<a href="${href(base+u)}"${base+u===url?' aria-current="page"':''}>${esc(label)}</a>`).join('')).join('');
 const notes=shared.notes.filter(n=>n.listed!==false&&n.game==='an-jing-wei-guang');
 const crumbs=[{label:'GAME NOTE',href:'/'},{label:'Games',href:'/games/'},{label:'黯井微光',href:base,current:!route},...(parent?[{label:parent[0],href:base+parent[1]+'/'}]:[]),...(route?[{label:title,href:url,current:true}]:[])];
 const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(full)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://gamenote.cc${url}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://gamenote.cc${url}"><meta property="og:type" content="article">${noindex?'<meta name="robots" content="noindex,follow">':''}<link rel="stylesheet" href="/assets/classic.css"><script src="/assets/classic.js" defer></script><script type="application/ld+json" data-breadcrumb-schema>${routes.schema(crumbs)}</script></head><body class="classic" data-theme="classic"><a class="classic-skip" href="#main">跳到正文</a><div class="classic-shell"><aside class="classic-sidebar"><a class="classic-brand" href="/">GAME NOTE CLASSIC</a><details open><summary>攻略目录</summary><nav class="classic-nav" aria-label="攻略目录">${nav}</nav></details></aside><main class="classic-main" id="main">${routes.breadcrumb(crumbs,'classic')}<header><h1>${esc(title)}</h1><p class="classic-subtitle">${esc(states[status]||states.draft)} · 更新于 ${esc(updatedAt)}</p><div class="classic-banner"><div><small>GAME NOTE CLASSIC · 图文攻略专题</small><strong>黯井微光</strong></div><span>攻略整理中</span></div></header><article>${body}</article><section id="related-notes">${heading('相关手记')}${notes.length?list(notes.map(n=>[n.title,n.url])):'<p>相关创作手记待整理。</p>'}</section><nav class="classic-pager" aria-label="文章分页">${previous?link('← '+previous.title,base+previous.route):'<span>暂无上一页</span>'}${link('目录',base+(parent?parent[1]+'/':''))}${next?link(next.title+' →',base+next.route):'<span>暂无下一页</span>'}</nav><footer class="classic-footer">${link('返回 GAME NOTE','/')} · 本专题持续整理；未核实内容不作为游戏结论。</footer></main></div></body></html>`;
 const file=path.join(root,'games/an-jing-wei-guang',route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html+'\n');if(!noindex)pages.push(url);
}
const game=data.game;
page('','黯井微光 / Well Dweller','黯井微光 Well Dweller：游戏资料、区域、Boss、能力、收集、任务和 41 项成就目录。',
 '<p>'+esc(game.description)+'</p>'+
 table('游戏基础资料',['项目','资料'],[
 ['中文名',game.nameZh],['英文名',game.nameEn],['开发者',publicValue(game,'developer')],
 ['发行',publicValue(game,'publishers',[]).join(' / ')],['发售日',publicValue(game,'releaseDate')],
 ['类型与展示标签',publicValue(game,'genres',[]).join(' / ')],['主角',publicValue(game,'protagonist')],
 ['Steam 成就',publicValue(game,'steamAchievements')],['支持简体中文',publicValue(game,'simplifiedChinese')?'是':'待核验']
 ])+game.images.map(imageBlock).join('')+
 '<p>'+link('Steam 官方商店',game.sources[0].url)+'</p>'+
 heading('专题入口')+list([['区域与流程目录',base+'walkthrough/'],['地图目录',base+'maps/'],['Boss 目录',base+'bosses/'],['能力 / 系统',base+'abilities/'],['收集分类',base+'collectibles/'],['任务目录',base+'quests/'],['Time Trials',base+'challenges/'],['41 Achievements',base+'achievements/']])+
 heading('资料整理状态')+table('V1 目录',['栏目','当前状态'],[
 ['区域',areas.length+' 个名称条目；不代表最终流程顺序'],['Boss / encounter',bosses.length+' 个条目；招式与打法待核验'],
 ['能力 / 系统',abilities.length+' 个条目；获取方式整理中'],['收集',collectibles.length+' 类；具体位置待核验'],
 ['任务',quests.length+' 个名称；步骤待补充'],['成就',achievements.length+' 条已整理 / '+publicValue(game,'steamAchievements')+' 项 Steam 成就']
 ])+notice('本站当前是可持续核验的资料专题，不是已完成的全收集攻略。')+heading('最近更新')+updateList(5),{status:'in-progress'});
page('walkthrough/','流程攻略目录','Well Dweller 区域目录与早期参考关系，非完整流程顺序。',
 notice('目录排列不代表最终流程。当前较可信的早期关系：The Well → Night Garden → Hunter\'s Cabin。其余区域流程顺序待核验。')+
 catalogue(areas.slice(0,14),'walkthrough')+heading('其他区域','other')+catalogue(areas.slice(14),'walkthrough'));
for(const e of areas){
 page('walkthrough/'+e.slug+'/',name(e),e.nameEn+' 区域条目；详细流程整理中。',
 entityNotice(e)+table('区域资料',['项目','状态'],[['名称',name(e)],['流程顺序','待核验'],['获取能力与收集位置','待补充']])+
 safeGuide(e)+(confirmed(e.fields.guide)?'':pending('流程路线'))+list([['查看区域地图条目',base+'maps/'+e.slug+'/']]),{parent:['流程攻略','walkthrough']});
 page('maps/'+e.slug+'/',name(e)+' · 地图',e.nameEn+' 地图资料整理中，不提供未经核验的坐标。',
 entityNotice(e)+pending('区域地图')+e.images.map(imageBlock).join('')+list([['对应流程条目',base+'walkthrough/'+e.slug+'/']]),{parent:['区域地图','maps']});
}
page('maps/','地图目录','Well Dweller 真实区域目录；精确地图、隐藏路线与坐标待核验。',
 notice('区域资料已建立；地图路线与完整探索范围尚未公开。')+catalogue(areas,'maps'));
for(const [slug,title] of [['world','世界地图'],['hidden-paths','Hidden Paths'],['breakable-walls','Breakable Walls'],['locked-doors','Locked Doors']])
 page('maps/'+slug+'/',title,title+' 资料整理中。',pending(title),{parent:['地图','maps']});
page('bosses/','Boss / encounter 目录','Well Dweller 首领与遭遇名称目录，未核验的名称与区域标记整理中。',
 notice('已建立真实名称条目；目录不代表所有条目都是同一类型的 Boss。详细招式、推荐打法和奖励将继续核验。')+catalogue(bosses,'bosses'));
for(const e of bosses)page('bosses/'+e.slug+'/',name(e),e.nameEn+' 条目；详细攻略整理中。',
 entityNotice(e)+(e.aliases?notice('名称待进一步核验：'+e.aliases.join(' / ')):'')+
 table('当前资料',['项目','内容'],[['名称',name(e)],['关联区域',publicValue(e,'area','区域归属待核验')]])+
 heading('详细攻略')+table('待补充内容',['项目','状态'],[
 ['攻击方式',publicValue(e,'attacks','待补充')],['推荐打法',publicValue(e,'strategy','待补充')],['奖励',publicValue(e,'reward','待补充')]
 ])+safeGuide(e),{parent:['Boss / encounter','bosses']});
const types={movement:'移动',combat:'战斗',utility:'辅助',travel:'旅行',vehicle:'载具',progression:'进程'};
function abilityType(e){const f=e.fields.type;return f.value&&f.publishStatus!=='research'?(types[f.value]||f.value)+'（编辑分类，待核验）':'类型待核验'}
page('abilities/','能力 / 系统目录','Well Dweller 能力与系统名称、类型和资料状态。',
 table('能力与系统',['名称','类型','状态'],abilities.map(e=>[name(e),abilityType(e),status(e)]))+catalogue(abilities,'abilities')+
 heading('获取方式','core')+pending('获取方式')+heading('强化资料','upgrades')+pending('强化资料')+heading('关键物品','items')+list([['Key Items',base+'collectibles/key-items/']]));
for(const e of abilities)page('abilities/'+e.slug+'/',name(e),e.nameEn+' 名称与类型；获取方式整理中。',
 entityNotice(e)+table('能力 / 系统资料',['项目','说明'],[['名称',name(e)],['类型',abilityType(e)],['获取方式',publicValue(e,'acquisition','获取方式整理中')]])+safeGuide(e),{parent:['能力 / 系统','abilities']});
function countLabel(e){const f=e.fields.count;if(!f||f.publishStatus==='research')return '数量整理中';return '当前资料记录：'+f.value+(confirmed(f)?'':'（待核验）')}
page('collectibles/','收集分类','Well Dweller 收集分类与当前资料记录，非最终收集总表。',
 notice('分类名称可以浏览；当前资料记录不等同于最终总数。Story Pages 的最终数量尚未确认。')+
 table('收集分类',['名称','数量资料','状态'],collectibles.map(e=>[name(e),countLabel(e),status(e)]))+catalogue(collectibles,'collectibles'));
for(const e of collectibles)page('collectibles/'+e.slug+'/',name(e),e.nameEn+' 收集类别；具体位置整理中。',
 entityNotice(e)+table('分类资料',['项目','内容'],[['分类',name(e)],['数量',countLabel(e)],['具体位置','待核验']])+
 (e.slug==='key-items'?catalogue(keyItems,'collectibles/key-items'):pending('获取地点与条件'))+safeGuide(e),{parent:['收集分类','collectibles']});
for(const e of keyItems)page('collectibles/key-items/'+e.slug+'/',name(e),e.nameEn+' 关键物品名称，作用和获取条件待核验。',
 entityNotice(e)+table('关键物品',['项目','状态'],[['名称',name(e)],['功能',publicValue(e,'function','功能说明整理中')]])+safeGuide(e),{parent:['Key Items','collectibles/key-items']});
page('quests/','任务目录','Well Dweller 已建立的任务名称，步骤与前置条件整理中。',catalogue(quests,'quests'));
for(const e of quests)page('quests/'+e.slug+'/',name(e),e.nameEn+' 任务条目；起始 NPC、步骤和奖励待核验。',
 entityNotice(e)+table('任务资料',['项目','状态'],[['任务名称',name(e)],['起始 NPC',publicValue(e,'startNpc','待补充')],['步骤',publicValue(e,'steps','待补充')],['奖励',publicValue(e,'reward','待补充')],['前置条件',publicValue(e,'prerequisite','待核验')]])+safeGuide(e),{parent:['任务','quests']});
page('achievements/','41 Achievements','Well Dweller 共有 41 项 Steam 成就，展示当前整理的名称与条件。',
 '<p>Steam 官方信息：41 项成就。当前整理 '+achievements.length+' 条，其余 '+(publicValue(game,'steamAchievements')-achievements.length)+' 条继续整理中。</p>'+
 table('当前已整理成就',['成就名称','条件'],achievements.map(e=>[name(e),e.description]))+
 notice('这里是成就条件资料，不是解锁路线；没有补造尚未整理的条目。')+'<p>'+link('Steam 官方成就列表','https://steamcommunity.com/stats/3699590/achievements')+'</p>');
page('challenges/','挑战目录','Well Dweller Time Trials 与 Puzzle Solutions 整理入口。',
 list([['Time Trials',base+'challenges/time-trials/'],['Puzzle Solutions',base+'challenges/puzzle-solutions/']]));
page('challenges/time-trials/','Time Trials','Well Dweller 计时挑战区域记录；路线、时间与奖励待核验。',
 notice('当前区域记录仍在核验，目录不代表已完成全部挑战。')+catalogue(challenges,'challenges/time-trials'));
for(const e of challenges)page('challenges/time-trials/'+e.slug+'/',name(e)+' · Time Trial','计时挑战区域记录，条件与奖励待核验。',
 entityNotice(e)+table('挑战记录',['项目','状态'],[['区域',e.nameEn],['路线','待核验'],['奖励',publicValue(e,'reward','待补充')]]),{parent:['Time Trials','challenges/time-trials']});
page('challenges/puzzle-solutions/','Puzzle Solutions','Well Dweller 解谜资料整理中，不提供未核验的解法。',pending('解谜步骤'),{parent:['挑战','challenges']});
page('systems/','系统说明','Well Dweller 已确认系统名称及后续核验方向。',
 heading('游戏简介','intro')+'<p>'+esc(game.description)+'</p>'+
 heading('基本操作','controls')+pending('键位与操作教学')+
 heading('系统目录')+catalogue(abilities,'abilities')+
 heading('常见问题','faq')+notice('已建立资料目录不代表详细攻略已完成；英文名称不自动翻译成官方中文名。'));
page('secrets/','隐藏内容','Well Dweller 隐藏路线与结局条件待核验。',pending('隐藏事件')+heading('结局条件','endings')+pending('结局条件'));
page('updates/','更新记录','Well Dweller 资料库与攻略整理的真实更新记录。',updateList(updates.length),{status:'in-progress'});
// Keep previously linked addresses usable without publishing archived research content.
const aliases={'walkthrough/chapter-01/':'walkthrough/','walkthrough/chapter-02/':'walkthrough/the-bog/','walkthrough/chapter-03/':'walkthrough/the-drains/','walkthrough/chapter-04/':'walkthrough/graven-valley/','walkthrough/chapter-05/':'walkthrough/','walkthrough/chapter-06/':'walkthrough/the-docks/','walkthrough/chapter-07/':'walkthrough/the-deep/','walkthrough/final/':'walkthrough/','bosses/boss-01/':'bosses/the-groundskeeper/','bosses/boss-02/':'bosses/','bosses/boss-03/':'bosses/','bosses/boss-04/':'bosses/','maps/area-map/':'maps/','maps/hidden-area/':'maps/hidden-paths/'};
for(const [route,target] of Object.entries(aliases))page(route,'资料目录已更新','旧地址保留；详细研究稿未作为正式攻略公开。',
 notice('本站已改用区域与实体目录。旧视频研究稿保留在内部资料中，路线、打法和截图待进一步核验。')+list([['前往当前资料目录',base+target]]),{noindex:true});
const manifestPath=path.join(root,'_research/an-jing-wei-guang/generated-pages.json');
const oldPages=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):[];
for(const url of oldPages)if(!pages.includes(url)&&!aliases[url.slice(base.length)]){
 const route=url.slice(base.length);if(!url.startsWith(base)||route.includes('..')||!/^[-a-z0-9/]+$/.test(route))throw Error('Unsafe stale route');
 page(route,'资料暂未公开','此条目正在核验。',pending('资料')+list([['返回目录',base]]),{noindex:true});
}
fs.mkdirSync(path.dirname(manifestPath),{recursive:true});fs.writeFileSync(manifestPath,JSON.stringify(pages,null,2)+'\n');
const sitemapPath=path.join(root,'sitemap.xml');let sitemap=fs.readFileSync(sitemapPath,'utf8').replace(/\s*<url><loc>https:\/\/gamenote\.cc\/games\/an-jing-wei-guang\/[^<]*<\/loc><\/url>/g,'');
sitemap=sitemap.replace('</urlset>',pages.map(u=>`  <url><loc>https://gamenote.cc${u}</loc></url>`).join('\n')+'\n</urlset>');fs.writeFileSync(sitemapPath,sitemap);
console.log(`Generated ${pages.length} V1 public pages; research fields and images excluded.`);

