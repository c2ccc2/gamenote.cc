const fs=require('fs'),g=require('../../scripts/lib/astlibra-guide.cjs'),p='content/games/astlibra-revision/items.json',d=JSON.parse(fs.readFileSync(p,'utf8'));
const clean=s=>s.replace(/体力回复[是昌]/g,'体力回复量').replace(/精力提升[是昌]/g,'精力提升量').replace(/缓悒/g,'缓慢').replace(/每宣|第(\d+)宣/g,(m,n)=>n?'第'+n+'章':'每章').replace(/二张剧情/g,'二章剧情').replace(/宣佩可奇拉/g,'佩可奇拉').replace(/女丿L/g,'女儿').replace(/^[，．]/,'').replace(/；/g,'；').replace(/[（(]$/,'').replace(/(?<=\d)m/g,'00').replace(/[CO](?=\d|体力|精力|$)/g,'0');
for(const r of d.records){for(const k of ['source','effect','mastery'])r[k]=clean(r[k]);for(const k of Object.keys(r.stats))r.stats[k]=clean(r.stats[k]);
 if(['weapons','shields','armor','accessories'].includes(r.category))r.source=r.source.replace(/；(?:屁股|品红)xl$/,'');
 const gem=g.gems.find(gem=>r.name==='元件宝石['+gem.name+']');
 if(gem){r.source=gem.region+'：'+gem.location+' '+gem.condition;r.guideHref=gem.href;r.effect='用于新章元件强化；具体效果见新章强化规则'}
 if(r.name==='礼品盒')r.effect='与情人节蛋糕合成情人节礼物';
}
Object.assign(d.records.find(r=>r.id==='item-3-3-1'),{mastery:'攻击力237；重量原图记为16（疑似漏位，未作推断）'});
Object.assign(d.records.find(r=>r.id==='item-10-0-0'),{source:'佩可奇拉村第一个房间，与大女儿对话取得'});
Object.assign(d.records.find(r=>r.id==='item-56-0-1'),{effect:'记录稀有装备、小徽章与元件宝石的收集情况'});
Object.assign(d.records.find(r=>r.id==='item-89-0-0'),{source:'固定宝箱、装备精通、斗技场与成长盘奖励；原资料总数未含新章追加，不作为全收集上限'});
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const a=JSON.parse(fs.readFileSync('content/games/astlibra-revision/achievements.json','utf8'));
Object.assign(a.records.find(r=>r.id==='ACHI_029'),{condition:'取得并使用盾冲的奥义卷轴。',tip:'在艾里泽斯东海岸的固定宝箱取得，使用卷轴学习。'});
Object.assign(a.records.find(r=>r.id==='ACHI_032'),{tip:'在阿涅斯塔回收对应固定宝箱，使用卷轴学习；持有卷轴还不等于已学会。'});
a.sources.push({title:'ASTLIBRA Wiki：六名隐藏首领入口',url:'https://w.atwiki.jp/astlibra/pages/66.html'});
fs.writeFileSync('content/games/astlibra-revision/achievements.json',JSON.stringify(a,null,2)+'\n');
