const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),guide=require('./lib/khazan-guide.cjs')(root);
const characters=require('../content/games/the-first-berserker-khazan/characters.cjs');
const normalizeName=require('./lib/khazan-names.cjs');
const english=require('./lib/khazan-english.cjs');
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
  assert.deepEqual(page('#'+boss.step.id+' img').map((_,el)=>page(el).attr('src')).get(),expected('#'+boss.step.id+' img').map((_,el)=>expected(el).attr('src')).get(),'Keep all boss fight images');
  assert.equal(page('#drops').length,boss.drops?1:0,'Only explicitly recorded drops should be listed');
 }
 const lists=new Map(guide.types.map(t=>[t.id,load(base+'collectibles/'+t.id+'/')]));
 const side=load(base+'side-quests/');
 assert.equal(side('.khazan-task-list>li').length,24,'Side mission index must link every task');
 for(const task of guide.tasks){
  const route=base+(task.kind==='main'?'walkthrough/':'side-quests/')+task.id+'/',$=load(route);
  assert.equal($('.khazan-flow-step').length,task.steps.length,route);
  assert.equal($('.khazan-flow-step img').length,task.steps.reduce((n,s)=>n+s.images.length,0),route);
  assert.equal($('.khazan-source-pages,.khazan-at-glance').length,0,'Source cards must not replace the route');
  assert(!/page_img_sn\.txt|配图范围|原文主线页码/.test($('article').text()),'Work metadata leaked to readers');
  for(const step of task.steps){
   assert.equal($('#'+step.id).length,1,'Missing or duplicate route step');
   assert($('#'+step.id+' p').text().trim(),'A route step needs its own prose');
   {
    assert.equal($('#'+step.id+' .khazan-route-copy > p').length,step.blocks.filter(b=>b.kind==='text').length,'Keep the full local body instead of only its summary');
    assert.equal($('#'+step.id+' .khazan-route-copy img').length,step.blocks.filter(b=>b.kind==='image').length,'Keep the source image and paragraph order');
    assert.deepEqual($('#'+step.id+' .khazan-route-copy img').map((_,el)=>$(el).attr('src')).get(),step.images,'Route image order must match the local text');
    if(prefix){
     const expected=step.blocks.map((b,index)=>b.text?normalizeName(english.paragraph(step.sourcePage,index),'en'):null).filter(text=>text!==null);
     const actual=$('#'+step.id+' .khazan-route-copy > p, #'+step.id+' .khazan-route-copy > h3').map((_,el)=>$(el).text()).get();
     assert.deepEqual(actual,expected,'Every English source paragraph must appear at its matching position');
     assert(!/[\u4e00-\u9fff]/.test($('#'+step.id).text()),'Chinese text leaked into an English route');
    }
   }
  }
  for(const point of task.points){
   const list=lists.get(point.type),row=list('#'+point.id);
   assert.equal(row.length,1,'Each pickup must have one list row');
   assert.equal(row.find('a').attr('href'),route+'#'+point.routeAnchor,'A location must link to its exact pickup paragraph');
   assert.equal($('#'+point.routeAnchor).length,1,'Missing pickup anchor');
   assert($(`#${point.stepId} a[href="${base}collectibles/${point.type}/#${point.id}"]`).length,'A route pickup must link back to its list');
  }
 }
 for(const type of guide.types)assert.equal(lists.get(type.id)('[data-collection-item]').length,guide.points.filter(p=>p.type===type.id).length,'Collection totals must match the task data');
}
console.log(`Verified 40 bilingual mission routes, 285 source steps, ${guide.points.length} collectible locations and ${imageCount} local image placements.`);
