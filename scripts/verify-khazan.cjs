const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),guide=require('./lib/khazan-guide.cjs')(root);
const characters=require('../content/games/the-first-berserker-khazan/characters.cjs');
const normalizeName=require('./lib/khazan-names.cjs');
const english=require('./lib/khazan-english.cjs');
const dialogueNames=require('./lib/khazan-dialogue-names.cjs');
assert.equal(normalizeName('达芙罗纳、Daphrona、特里斯坦、Quimuk','zh'),'达芙罗娜、达芙罗娜、特利斯坦、奎穆珂');
assert.equal(normalizeName('特里斯坦、尤利安、杜伊穆克','en'),'Tristan、Yulian、Duimuk');
assert.equal(guide.points.filter(p=>p.type==='soulstones').length,100,'All source Soulstones must be represented');
assert.equal(guide.points.filter(p=>p.type==='jarlings').length,44,'Include the six jars in the introductory jar mission');
assert.equal(guide.main[9].points.filter(p=>p.type==='soulstones').length,5,'The library page contains two distinct Soulstones');
const imageCount=guide.tasks.reduce((n,t)=>n+t.steps.reduce((sum,s)=>sum+s.images.length,0),0);
assert.equal(imageCount,2362,'Every image from the local guide belongs in its mission route');
for(const prefix of ['', '/en']){
 const base=prefix+'/games/the-first-berserker-khazan/';
 const load=route=>cheerio.load(fs.readFileSync(path.join(root,route.slice(1),'index.html'),'utf8'));
 const people=load(base+'characters/'),locale=prefix?'en':'zh';
 assert.equal(people('.khazan-reference-entry').length,characters.length,'Every registered character needs a directory entry');
 for(const character of characters){
  const section=people('#'+character.id);
  assert.equal(section.find('h2').text(),character[locale].title,'Character names must use the page language');
  const profileRoute=base+'characters/'+character.id+'/';
  assert.equal(section.find('h2 a').attr('href'),profileRoute,'Index must link the independent character page');
  const profile=load(profileRoute);
  assert.equal(profile('h1').text(),character[locale].title);
  assert(profile('#missions li a').length,'Characters need a related route');
  for(const link of profile('#missions li a').toArray()){
   const [route,anchor]=profile(link).attr('href').split('#');
   assert.equal(load(route)('#'+anchor).length,1,'Character links must reach an existing route step');
  }
 }
 for(const boss of require('./lib/khazan-bosses.cjs')(guide)){
  const page=load(base+'bosses/'+boss.id+'/');
  assert(page('#overview p').text(),'Boss needs an introduction');
  assert(page('#location p').text(),'Boss needs a location');
  const expected=load(base+'walkthrough/'+boss.task.id+'/');
  assert.deepEqual(page('#'+boss.step.id+' img').map((_,el)=>page(el).attr('src')).get(),expected('[data-source-page="'+boss.step.sourcePage+'"] img').map((_,el)=>expected(el).attr('src')).get(),'Keep all boss fight images');
  assert.equal(page('#drops').length,1,'Every main boss needs the current material-drop rules');
  assert(page('#drops a[href*="bosses/drops/"]').length,'Boss rewards must link to the shared farming table');
 }
 const referenceGuides=require('../content/games/the-first-berserker-khazan/reference-guides.json');
 assert.equal(new Set(referenceGuides.map(p=>p.route)).size,referenceGuides.length,'Reference routes must not overwrite one another');
 for(const reference of referenceGuides){
  const page=load(base+reference.route);
  assert.equal(page('h1').text(),normalizeName(reference[locale].title,locale),'Reference title must match its language');
  assert.equal(new Set(reference.sections.map(s=>s.id)).size,reference.sections.length,'Section IDs must be unique');
  for(const section of reference.sections){
   const body=page('#'+section.id);
   assert.equal(body.length,1,'Reference sections must be reachable');
   if(prefix)assert(!/[\u4e00-\u9fff]/.test(body.text()),'Reference prose, tables and links need English text');
  }
  for(const a of page('article a[href^="'+base+'"]').toArray()){
   const [route,anchor]=page(a).attr('href').split('#');
   if(/\.(jpg|jpeg|png|gif|webp)$/.test(route)){assert(fs.existsSync(path.join(root,route.slice(1))),'Reference images must be local');continue;}
   const target=load(route);
   if(anchor)assert.equal(target('[id="'+anchor+'"]').length,1,'Reference links must reach existing instructions');
  }
 }
 const setDetails=require('../content/games/the-first-berserker-khazan/set-details.json');
 for(const set of setDetails){
  if(set.recipe)assert(guide.points.some(p=>p.id===set.recipe&&p.type==='scrolls'),'Set recipes must resolve to real scroll pickups');
  const page=load(base+'equipment/sets/'+set.id+'/');
  assert.equal(page('#bonuses tbody tr').length,set.bonuses.length,'Do not lose a set bonus threshold during rendering');
  assert(set.bonuses.every((r,i)=>r[0]>=2&&(!i||r[0]>set.bonuses[i-1][0])),'Set thresholds must ascend without duplicates');
 }
 const ledger=require('../content/games/the-first-berserker-khazan/set-value-verification.json');
 assert.equal(ledger.length,setDetails.reduce((n,s)=>n+s.bonuses.length,0),'Every threshold needs a verification record');
 for(const row of ledger){assert(setDetails.some(s=>s.id===row.set&&s.bonuses.some(b=>b[0]===row.pieces)),'Verification must refer to a real threshold');if(row.inGameChecked)assert(row.evidence,'In-game verification needs evidence');}
 const sideEncounters=require('./lib/khazan-side-bosses.cjs')(guide);
 assert.equal(sideEncounters.length,23,'Every combat side mission needs an index entry');
 assert(!sideEncounters.some(b=>b.task.id==='jar-enthusiast'),'The jar collection mission is not a boss encounter');
 for(const {task,step,startBlock} of sideEncounters){
  const page=load(base+'bosses/side/'+task.id+'/');
  const expected=step.blocks.slice(startBlock).filter(b=>b.kind==='image').map(b=>b.src);
  assert.deepEqual(page('#strategy img').map((_,el)=>page(el).attr('src')).get(),expected,'Keep every image in the selected battle sequence');
  assert.equal(page('#location a').attr('href'),base+'side-quests/'+task.id+'/#'+step.id);
  assert(load(base+'side-quests/'+task.id+'/')('article a[href="'+base+'bosses/side/'+task.id+'/"]').length,'Mission pages must link back to their independent boss guide');
 }
 for(const type of guide.types){const page=load(base+'collectibles/'+type.id+'/');
  assert.equal(page('[data-collection-check]').length,guide.points.filter(p=>p.type===type.id).length);
  assert.equal(page('[data-collection-progress]').length,1);
 }
 const materials=require('../content/games/the-first-berserker-khazan/crafting-materials.json');
 assert.deepEqual(materials.map(m=>m.boss),require('./lib/khazan-bosses.cjs')(guide).map(b=>b.id),'Every main boss must have one matched crafting material');
 for(const material of materials)assert(guide.points.some(p=>p.id===material.recipe&&p.type==='scrolls'),'A material recipe must resolve to a scroll');
 const phantomData=require('../content/games/the-first-berserker-khazan/phantom-abilities.json');
 assert.equal(phantomData.length,8,'All eight phantoms must be included');
 for(const phantom of phantomData){
  assert(guide.points.some(p=>p.type==='relics'&&p.name.zh===phantom.relic),'Each phantom needs real matching relic locations');
  assert(load(base+'systems/phantom-abilities/')('#'+phantom.id+' a').length,'Phantom entries need acquisition links');
 }
 for(const weapon of ['dual-wield','greatsword','spear'])assert(load(base+'systems/builds/'+weapon+'/')('#skills table').length,'Every weapon setup needs a usable skill-priority table');
 const rewardIndex=load(base+'bosses/drops/');
 assert.equal(rewardIndex('[data-boss-reward]').length,16,'The reward table must cover all main bosses');
 const golden=load(base+'collectibles/ozma-records/');
 assert.equal(golden('[data-golden-record]').length,15,'All fifteen golden records must be represented');
 assert.equal(new Set(golden('[data-golden-record]').map((_,el)=>golden(el).attr('id')).get()).size,15,'Golden records must not be duplicated');
 assert(golden('#golden-black-moon-ii a[href*="why-abandon-us"]').length,'The formerly missing Black Moon II must link to its mission');
 const supplemental=guide.points.find(p=>p.id==='why-abandon-us-records-black-moon-ii');
 assert(supplemental,'Missing Black Moon II in shared collection data');
 const recordList=load(base+'collectibles/records/'),pickupRoute=base+'side-quests/why-abandon-us/';
 assert.equal(recordList('[data-collection-item][id="'+supplemental.id+'"]').length,1,'The supplemental record must be searchable in the ordinary records list');
 const pickupHref=pickupRoute+'#'+supplemental.routeAnchor;
 assert.equal(recordList('#'+supplemental.id+' a').attr('href'),pickupHref,'Ordinary records must reach the exact supplemental instruction');
 assert.equal(golden('#golden-black-moon-ii a').first().attr('href'),pickupHref,'Both indexes must share one exact pickup anchor');
 assert.equal(guide.points.find(p=>p.id==='why-abandon-us-records-2').name.zh,'生命创造之旅','Existing record IDs must survive additions');
 const combat=load(base+'systems/combat-basics/');
 for(const id of ['resources','defense-choice','burst-and-grabs','reflection','exhaustion','practice','troubleshooting'])assert.equal(combat('#'+id).length,1,'Basic combat topics must be accessible');
 assert.equal(combat('#resources tbody tr').length,3,'Combat resource comparison must be present');
 assert.equal(combat('#defense-choice tbody tr').length,5,'Defensive action comparison must be present');
 if(prefix)assert(!/[\u4e00-\u9fff]/.test(combat('article section').not(':has(h2:contains("Sources"))').text()),'Combat guide body must be translated');
 for(const [pageNumber,label,occurrence] of [[70,'Attack ②',0],[284,'Attack ③',1]]){
  const task=guide.main.find(t=>t.steps.some(s=>s.sourcePage===pageNumber)),step=task.steps.find(s=>s.sourcePage===pageNumber);
  const labels=step.blocks.filter(b=>b.text?.startsWith(pageNumber===70?'攻击方式②：':'攻击方式③：'));
  assert(labels[occurrence].text.length>40,'Attack demonstrations need actual response instructions');
 }
 const roadmap=load(base+'achievements/roadmap/');
 for(const id of ['before-start','early-game','during-story','palace-choice','after-ending','version-notes'])assert.equal(roadmap('#'+id).length,1,'Roadmap must cover the complete journey');
 for(const document of [golden,roadmap,rewardIndex,combat]){
  for(const a of document('article a[href^="'+base+'"]').toArray()){
   const [route,anchor]=document(a).attr('href').split('#'),target=load(route);
   if(anchor)assert.equal(target('[id="'+anchor+'"]').length,1,'New reference links must reach real destinations');
  }
 }
 const lists=new Map(guide.types.map(t=>[t.id,load(base+'collectibles/'+t.id+'/')]));
 const side=load(base+'side-quests/');
 assert.equal(side('.khazan-task-list>li').length,24,'Side mission index must link every task');
 for(const task of guide.tasks){
  const route=base+(task.kind==='main'?'walkthrough/':'side-quests/')+task.id+'/',$=load(route);
  assert.equal($('.khazan-route-section').length,task.routeSections.length,route);
  assert.equal($('.khazan-route-copy img').length,task.steps.reduce((n,s)=>n+s.images.length,0),route);
  assert.equal($('.khazan-source-pages,.khazan-at-glance').length,0,'Source cards must not replace the route');
  assert(!/page_img_sn\.txt|配图范围|原文主线页码/.test($('article').text()),'Work metadata leaked to readers');
  assert.deepEqual($('.khazan-flow-nav > ol > li > a').map((_,el)=>$(el).attr('href')).get(),task.routeNavigation.map(e=>'#'+e.id),'Numbered navigation must follow actual paragraph order');
  for(const section of task.routeSections){
   const el=$('#'+section.id);
   assert.equal(el.length,1,'Missing landmark section');
   assert.equal(el.children('h2').first().text(),String(section.number).padStart(2,'0')+normalizeName(section.title[locale],locale),'Route heading must match its landmark');
   assert(el.find('[data-source-page]').length,'A landmark section must contain walkthrough content');
  }
  for(const step of task.steps){
   assert.equal($('#'+step.id).length,1,'Missing legacy bookmark');
   const blocks=$('[data-source-page="'+step.sourcePage+'"]');
   const expected=step.blocks.map((b,index)=>({b,index})).filter(({b})=>!/^章节：/.test(b.text||''));
   assert.equal(blocks.length,expected.length,'Preserve every narrative paragraph and image');
   assert.deepEqual(blocks.map((_,el)=>Number($(el).attr('data-source-block'))).get(),expected.map(x=>x.index),'Preserve block order across new route sections');
   assert.deepEqual(blocks.filter('figure').find('img').map((_,el)=>$(el).attr('src')).get(),step.images,'Route image order must match the local text');
   const prose=expected.filter(({b})=>b.text).map(({b,index})=>normalizeName(prefix?english.paragraph(step.sourcePage,index):dialogueNames(step,b.text),locale));
   assert.deepEqual(blocks.filter('p,h3').map((_,el)=>$(el).text()).get(),prose,'Preserve the full bilingual walkthrough');
  }
  if(prefix)assert(!/[\u4e00-\u9fff]/.test($('.khazan-route-copy').text()),'Chinese text leaked into an English route');
  for(const point of task.points){
   const list=lists.get(point.type),row=list('#'+point.id);
   assert.equal(row.length,1,'Each pickup must have one list row');
   assert.equal(row.find('a').attr('href'),route+'#'+point.routeAnchor,'A location must link to its exact pickup paragraph');
   assert.equal($('#'+point.routeAnchor).length,1,'Missing pickup anchor');
   const pickupToc=$('.khazan-flow-nav > ol > li > a').filter((i,a)=>$(a).attr('href')==='#'+point.routeAnchor);
   assert.equal(pickupToc.length,1,'Each collectible must have exactly one top-level numbered destination');
   const next=$('#'+point.routeAnchor).nextAll(':not(.khazan-pickup-anchor)').first();
   assert(next.is('p,h3'),'Pickup destination must immediately precede its instruction');

   assert($(`.khazan-route-section a[href="${base}collectibles/${point.type}/#${point.id}"]`).length,'A route pickup must link back to its list');
  }
 }
 for(const type of guide.types)assert.equal(lists.get(type.id)('[data-collection-item]').length,guide.points.filter(p=>p.type===type.id).length,'Collection totals must match the task data');
}
console.log(`Verified 40 bilingual mission routes, ${guide.tasks.reduce((n,t)=>n+t.routeSections.length,0)} landmark sections, 285 source steps, ${guide.points.length} collectible locations and ${imageCount} local image placements.`);

require('./verify-khazan-collections.cjs');
