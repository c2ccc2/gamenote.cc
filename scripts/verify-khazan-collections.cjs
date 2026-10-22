// Exercise the shipped collection controller against generated HTML with a small DOM adapter.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'assets/khazan-collections.js'),'utf8');
const key='gamenote.khazan.collections.v1',storage=new Map();
function open(route,{blocked=false,locale='zh'}={}){
 const $=cheerio.load(fs.readFileSync(path.join(root,locale==='en'?'en':'','games/the-first-berserker-khazan/collectibles',route,'index.html'),'utf8'));
 const cache=new Map();
 function wrap(el){
  if(!el)return null;if(cache.has(el))return cache.get(el);
  const node={dataset:{},events:{},value:$(el).is('select')?'all':'',checked:false,hidden:false,
   querySelector:s=>wrap($(el).find(s).get(0)),querySelectorAll:s=>$(el).find(s).toArray().map(wrap),
   addEventListener(type,fn){this.events[type]=fn;},classList:{toggle(name,on){$(el).toggleClass(name,on);}},
   get textContent(){return $(el).text();},set textContent(v){$(el).text(v);}};
  for(const [attr,value] of Object.entries(el.attribs||{}))if(attr.startsWith('data-'))node.dataset[attr.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
  cache.set(el,node);return node;
 }
 const downloads=[];let blob;
 const doc={querySelector:s=>wrap($(s).get(0)),body:{appendChild(){}},createElement:()=>({click(){downloads.push(blob);},remove(){}})},events={};
 vm.runInNewContext(script,{document:doc,window:{addEventListener:(type,fn)=>events[type]=fn},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);}},location:{search:''},URL:{createObjectURL:b=>{blob=b;return 'blob:test';},revokeObjectURL(){}},Blob,setTimeout:fn=>fn(),URLSearchParams,requestAnimationFrame:fn=>fn()});
 return {doc,downloads,checks:doc.querySelector('[data-collection-results]').querySelectorAll('[data-collection-check]'),rows:doc.querySelector('[data-collection-results]').querySelectorAll('[data-collection-item]'),events};
}
function toggle(check,value){check.checked=value;check.events.change();}
(async () => {
const a=open('records');toggle(a.checks[0],true);
assert.equal(JSON.parse(storage.get(key))[a.checks[0].dataset.collectionCheck],true,'A toggle must persist');
const b=open('records',{locale:'en'});assert.equal(b.checks[0].checked,true,'English shares the same item ID');
const c=open('soulstones');toggle(c.checks[0],true);a.events.storage({key});assert.equal(a.checks[0].checked,true,'Other categories must preserve records');
toggle(b.checks[0],false);a.events.storage({key});assert.equal(a.checks[0].checked,false,'Unchecking must sync across tabs');
const golden=open('ozma-records');toggle(golden.checks[0],true);a.events.storage({key});
assert.equal(a.checks.find(x=>x.dataset.collectionCheck===golden.checks[0].dataset.collectionCheck).checked,true,'Focused and ordinary record lists share progress');
const progress=a.doc.querySelector('[data-collection-progress]');progress.value='completed';progress.events.change();assert.equal(a.rows.filter(r=>!r.hidden).length,1);
progress.value='remaining';progress.events.change();assert.equal(a.rows.filter(r=>!r.hidden).length,a.rows.length-1);
const search=a.doc.querySelector('[data-collection-search]');search.value='nonexistent location xyz';search.events.input();assert(a.rows.every(r=>r.hidden));
const blocked=open('jarlings',{blocked:true});toggle(blocked.checks[0],true);assert.equal(blocked.checks[0].checked,true);assert(blocked.doc.querySelector('[data-collection-save-status]').textContent.includes('存储不可用'));
storage.set(key,'invalid JSON');const broken=open('soulstones');assert.equal(broken.checks[0].checked,false,'Corrupted storage must not crash');
storage.clear();const cleared=open('records');assert(cleared.checks.every(c=>!c.checked));
const source=open('soulstones');toggle(source.checks[0],true);
source.doc.querySelector('[data-collection-export]').events.click();
const backup=JSON.parse(await source.downloads[0].text());assert.equal(backup.game,'the-first-berserker-khazan');assert(backup.completed.includes(source.checks[0].dataset.collectionCheck));
const destination=open('records');toggle(destination.checks[0],true);
const uploader=destination.doc.querySelector('[data-collection-import]');
uploader.files=[{size:500,text:async()=>JSON.stringify(backup)}];await uploader.events.change();
assert.equal(JSON.parse(storage.get(key))[destination.checks[0].dataset.collectionCheck],true,'Import must preserve existing records');
assert.equal(JSON.parse(storage.get(key))[source.checks[0].dataset.collectionCheck],true,'Import must add other-category progress');
const before=storage.get(key);
for(const payload of ['invalid',JSON.stringify({game:'another-game',version:1,completed:[]}),JSON.stringify({game:'the-first-berserker-khazan',version:1,completed:['unknown-point']})]){
 uploader.files=[{size:100,text:async()=>payload}];await uploader.events.change();assert.equal(storage.get(key),before,'Invalid imports must not change saved progress');
}
uploader.files=[{size:131073,text:async()=>JSON.stringify(backup)}];await uploader.events.change();assert.equal(storage.get(key),before);
console.log('Verified collection persistence, language/category and golden-record sync, filters, storage failures, backup export and non-destructive import.');
})().catch(error=>{console.error(error);process.exitCode=1;});
