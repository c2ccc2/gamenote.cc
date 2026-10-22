const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const g=require('./lib/astlibra-guide.cjs');
const root=path.resolve(__dirname,'..');
const routes=require('../content/games/astlibra-revision/published-routes.json');
const renderedImages=new Set(),renderedBlocks=new Set();
assert.equal(g.pickups.length,104,'Source chest inventory changed; review chapter grouping');
assert.equal(g.skills.reduce((n,p)=>n+p.sections.length,0),96,'KARON entries lost during grouping');
assert.equal(g.docs['flow-upper'].blocks.filter(b=>b.kind==='image').length+g.docs['flow-lower'].blocks.filter(b=>b.kind==='image').length,128);
for(const route of routes){
 const file=path.join(root,route.slice(1),'index.html'),html=fs.readFileSync(file,'utf8'),$=cheerio.load(html);
 assert.equal($('h1').length,1,route);
 assert.equal($('link[rel=canonical]').attr('href'),'https://gamenote.cc'+route);
 assert.equal($('meta[name=robots][content*=noindex]').length,0,route);
 assert.equal($('[data-breadcrumb-schema]').length,1,route);
 assert.equal($('a[aria-current=page]').length,1,'Sidebar current page: '+route);
 assert.ok(!/框架搭建中|内容待整理|框架已建立|C:\\Users\\|\.minimax|全游戏攻略索引|本攻略\)/.test($('article').text()),route);
 const ids=$('[id]').toArray().map(n=>$(n).attr('id'));assert.equal(ids.length,new Set(ids).size,'Duplicate anchor: '+route);
 assert.equal($('.astlibra-spoiler[open]').length,0,'Plot choices must start collapsed');
 $('[data-source-doc][data-source-block]').each((_,n)=>renderedBlocks.add($(n).attr('data-source-doc')+':'+$(n).attr('data-source-block')));
 $('img').each((_,n)=>{const img=$(n),src=img.attr('src');renderedImages.add(src);const asset=g.data.assets[src];assert.ok(asset,'Unknown asset '+src);assert.equal(+img.attr('width'),asset.width);assert.equal(+img.attr('height'),asset.height);assert.ok(img.attr('alt'));});
 $('a[href]').each((_,n)=>{
  const href=$(n).attr('href'),url=new URL(href,'https://gamenote.cc'+route);if(url.origin!=='https://gamenote.cc')return;
  const target=path.join(root,decodeURIComponent(url.pathname));const resolved=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
  assert.ok(fs.existsSync(resolved),'Broken destination '+href+' on '+route);
  if(url.hash&&resolved.endsWith('.html')){const other=cheerio.load(fs.readFileSync(resolved,'utf8'));assert.ok(other('[id]').toArray().some(n=>other(n).attr('id')===decodeURIComponent(url.hash.slice(1))),'Broken anchor '+href+' on '+route);}
 });
}
for(const [src,asset]of Object.entries(g.data.assets)){
 assert.ok(renderedImages.has(src),'Imported illustration not used: '+src);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,src))).digest('hex'),asset.sha256,'Changed illustration: '+src);
}
for(const doc of g.data.documents)for(const [i,b]of doc.blocks.entries())if(b.kind==='image')assert.ok(renderedBlocks.has(doc.id+':'+i),'Unplaced source illustration '+doc.id+':'+i);
const chapter6=cheerio.load(fs.readFileSync(path.join(root,'games/astlibra-revision/walkthrough/chapter-6/index.html'),'utf8'));
assert.ok(chapter6('#snow').length&&chapter6('#green-rune').length&&chapter6('#escape').length,'Sixth chapter must join both source articles');
const chestPage=cheerio.load(fs.readFileSync(path.join(root,'games/astlibra-revision/collectibles/index.html'),'utf8'));
assert.equal(chestPage('[data-astlibra-row]').length,104);
assert.equal(chestPage('input[type=checkbox], [data-astlibra-progress]').length,0);
for(const page of g.collections)for(const chest of page.records)assert.ok(fs.readFileSync(path.join(root,page.href,'index.html'),'utf8').includes(`id="${chest.id}"`));
console.log(`Verified ${routes.length} Astlibra pages, ${g.pickups.length} unique chest records, 96 skills, all source illustrations and their integrity.`);

// Publication gates for the supplemental guide and transcribed item database.
const itemData=require('../content/games/astlibra-revision/items.json').records;
const achievementData=require('../content/games/astlibra-revision/achievements.json').records;
const read=route=>cheerio.load(fs.readFileSync(path.join(root,'games/astlibra-revision',route,'index.html'),'utf8'));
const database=read('equipment/database'),achievementPage=read('achievements'),beginner=read('systems/beginners');
assert.equal(itemData.length,521);
assert.equal(new Set(itemData.map(r=>r.id)).size,521);
assert.equal(database('[data-lookup-row]').length,521);
assert.equal(new Set(itemData.map(r=>r.image)).size,76,'All source item tables must have text records');
for(const r of itemData){
 assert.ok(r.name&&r.source,'A record needs a name and an acquisition reference: '+r.id);
 assert.equal(g.docs.equipment.blocks[r.sourceBlock].src,r.image,'Item must trace to its source image');
 assert.ok(database('#'+r.id).text().includes(r.name));
 assert.ok(!/undefined|[口囗]{2}|芊|[0-9][COm]|回复[是昌]|精力提升[是昌]|缓悒|廣|袢|宣后|；i|\uFFFD/.test(JSON.stringify(r)),'Unreviewed transcription artifact: '+r.id);
}
assert.equal(achievementData.length,84);
assert.deepEqual(achievementData.map(r=>r.id),Array.from({length:84},(_,i)=>'ACHI_'+String(i+1).padStart(3,'0')),'Cover the base game once, without DLC');
assert.equal(achievementPage('[data-achievement-id]').length,84);
assert.equal(achievementPage('[data-achievement-id=ACHI_085]').length,0);
assert.ok(achievementPage('#achi_022').text().includes('困难'));
assert.ok(achievementPage('#achi_080').text().includes('13'));
assert.ok(achievementPage('#achi_081').text().includes('14'));
for(const id of ['difficulty','growth','stats','mastery','karon','libra','combat','packing','first-route'])assert.equal(beginner('#'+id).length,1);
assert.equal(database('input[type=checkbox]').length+achievementPage('input[type=checkbox]').length,0);
console.log('Verified 84 base-game achievements, 521 source-linked item records, 76 table images and 9 beginner sections.');

const combatPlans=require('../content/games/astlibra-revision/combat-plans.cjs');
const buildsPage=read('equipment/builds'),tacticsPage=read('bosses/tactics'),rewardAudit=read('collectibles/reward-audit');
for(const p of combatPlans.builds){
 assert.equal(buildsPage('#'+p.id).length,1);
 for(const name of p.items)assert.ok(itemData.some(r=>r.name===name),'Build item must exist: '+name);
 for(const name of p.skills)assert.ok(g.skills.some(p=>p.sections.some(s=>s.title===name)),'Build skill must exist: '+name);
}
for(const [id] of combatPlans.tactics){assert.ok(g.encounters.some(r=>r.id===id));assert.equal(tacticsPage('#'+id).length,1);}
assert.equal(rewardAudit('#records tbody tr').length,104);
assert.equal(read('bosses/geraldin')('#combat-plan').length,1);
assert.ok(read('systems/crafting')('article').text().includes('铁矿石+冶炼套件'));
assert.equal(buildsPage('input[type=checkbox]').length+rewardAudit('input[type=checkbox]').length,0);
console.log('Verified 4 build stages, 48 combat plans, Geraldin route and 104 reward audit rows.');
const rewards=require('../content/games/astlibra-revision/chest-rewards.json').records;
assert.equal(rewards.length,104);
assert.deepEqual(new Set(rewards.map(r=>r.id)),new Set(g.pickups.map(p=>p.id)));
for(const r of rewards){
 assert.ok(r.rewards.length&&r.evidence.length);
 for(const item of r.rewards)assert.ok(item.name&&Number.isInteger(item.quantity)&&item.quantity>0);
 assert.ok(!g.pickups.find(p=>p.id===r.id).title.startsWith('宝箱'));
}
const reward=id=>rewards.find(r=>r.id==='chest-'+id).rewards;
assert.equal(reward('chapter-7-06')[0].name,'魔导水晶');
assert.equal(reward('chapter-7-07')[0].name,'龙卷的奥义卷轴');
assert.deepEqual(reward('chapter-8-09'),[{name:'精力卡',quantity:2}]);
assert.equal(reward('chapter-8-10')[0].name,'失重的奥义卷轴');
assert.deepEqual(reward('final-chapter-04'),[{name:'攻击卡',quantity:10}]);
assert.equal(reward('chapter-5-08').length,3);
assert.ok(!rewardAudit('article').text().includes('原资料未注明奖励'));
console.log('Verified rewards, quantities and evidence for all 104 location records, including three grouped chests and corrected scroll labels.');

const equipmentCosts=require('./lib/astlibra-equipment-costs.cjs').records;
const craftingPage=read('equipment/crafting');
assert.equal(equipmentCosts.length,221);
assert.equal(craftingPage('[data-equipment-cost]').length,221);
assert.equal(craftingPage('[data-material-source]').length,100);
for(const r of equipmentCosts){
 assert.ok(itemData.some(item=>item.id===r.id));
 assert.ok(r.gold===null || Number.isInteger(r.gold)&&r.gold>=0);
 for(const m of r.materials){assert.ok(itemData.some(item=>item.id===m.itemId));assert.ok(Number.isInteger(m.quantity)&&m.quantity>0);}
}
assert.equal(equipmentCosts.find(r=>r.name==='铜剑').gold,140);
assert.deepEqual(equipmentCosts.find(r=>r.name==='铜剑').materials.map(m=>[m.name,m.quantity]),[['铜锭',1],['恶心的肉',1],['曼德拉',1]]);
assert.equal(equipmentCosts.find(r=>r.name==='心天平').costType,'exchange');
assert.equal(equipmentCosts.filter(r=>r.costType==='unlisted').length,1);
assert.equal(new Set(combatPlans.tactics.map(p=>p[0])).size,48);
assert.equal(tacticsPage('[data-combat-plan]').length,48);
for(const r of g.encounters)assert.equal(tacticsPage('#'+r.id).length,1);
const hiddenCombat=require('../content/games/astlibra-revision/hidden-combat.cjs');
assert.equal(Object.keys(hiddenCombat).length,6);
for(const [id,p] of Object.entries(hiddenCombat)){
 const page=read('bosses/'+id);
 assert.equal(page('#combat-plan').length,1);
 assert.equal(page('#rewards').length,1);
 assert.ok(p.moves.length>=3);
 for(const name of p.rewards)assert.ok(itemData.some(r=>r.name===name));
 const achievement=achievementData.find(r=>r.id.toLowerCase()===p.achievement);
 assert.ok(achievement&&achievement.group==='隐藏首领');
 if(id!=='geraldin')assert.equal(achievement.route,'bosses/'+id+'/');
}
console.log('Verified 221 equipment cost records, 100 material links, 48 detailed encounters and 6 hidden boss guides.');
