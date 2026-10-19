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
  assert.equal(page('#drops').length,boss.drops?1:0,'Only explicitly recorded drops should be listed');
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
