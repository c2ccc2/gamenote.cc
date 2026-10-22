const fs=require('fs'),p='content/games/astlibra-revision/items.json',d=JSON.parse(fs.readFileSync(p,'utf8'));const tiles=JSON.parse(fs.readFileSync('_research/astlibra-expansion/cell-ocr.json','utf8').replace(/^\uFEFF/,''));
const clean=s=>s.replace(/\s+/g,'').replace(/(?:[0-9CＯO]*[CＯO][0-9CＯO]*|\d+m)/g,t=>t.replace(/[CＯO]/g,'0').replace(/m/g,'00')).replace(/回复是|回复昌|恢复是|恢复昌/g,'回复量').replace(/精力提升是|精力提升昌|尽力提升是/g,'精力提升量').replace(/重昌/g,'重量').replace(/缓悒/g,'缓慢').replace(/格拦/g,'格挡').replace(/每宣/g,'每章').replace(/追宣/g,'新章').replace(/二张剧情/g,'二章剧情').replace(/凍京|冻京/g,'东京').replace(/小麦风/g,'小麦粉').replace(/黄湖/g,'黄油').replace(/傈子/g,'栗子').replace(/怪物掉率/g,'怪物掉落').replace(/王城周边/g,'魔王城周边').replace(/股得/g,'获得').replace(/[|!！']/g,'').replace(/；?i；?/g,'；').replace(/[；]+/g,'；').replace(/^；|；$/g,'').replace(/〔/g,'（');
function rect(lines,x1,y1,x2,y2){return lines.map(l=>({y:Math.min(...l.words.map(w=>w.y)),ws:l.words.filter(w=>w.x+w.w/2>=x1&&w.x+w.w/2<x2&&w.y+w.h/2>=y1&&w.y+w.h/2<y2)})).filter(l=>l.ws.length).sort((a,b)=>a.y-b.y).map(l=>l.ws.map(w=>w.text).join('')).join('；').replace(/\s+/g,'')}
for(const r of d.records){const lines=tiles.find(t=>t.block===r.id.slice(5)).lines.map(l=>({...l,words:l.words.map(w=>({...w,x:w.x/3,y:w.y/3,w:w.w/3,h:w.h/3}))}));
 if(!['weapons','armor','shields','accessories'].includes(r.category)){
  let value=rect(lines,112,107,340,145);r.stats['天平效果']=[r.stats['天平效果'].split('；')[0],value].filter(Boolean).join('；');
 }else{
  const x=r.category==='weapons'?190:118,y=r.category==='weapons'?174:r.category==='shields'?140:147,w=r.category==='weapons'?377:347;
  let a=rect(lines,x,y,w,300).split('；');r.source=a.filter((v,i)=>i===0||(!/金币|金幣|x\d|×\d/.test(v))).join('；').replace(/^[1１][．.、]?/,'');
 }
 for(const key of ['source','effect','mastery'])r[key]=clean(r[key]);
 for(const key of Object.keys(r.stats))r.stats[key]=clean(r.stats[key]);
 if(r.stats['幸']){r.stats['幸运']=r.stats['幸'];delete r.stats['幸']}
 if(r.name.startsWith('封]'))r.name='['+r.name;
}
Object.assign(d.records.find(r=>r.id==='item-22-0-0'),{stats:{'最大体力':'50','最大精力':'20'}});
Object.assign(d.records.find(r=>r.id==='item-24-2-0'),{source:'小徽章扭蛋兑换奖励'});
Object.assign(d.records.find(r=>r.id==='item-26-2-1'),{stats:{'幸运':'20'}});
Object.assign(d.records.find(r=>r.id==='item-8-4-0'),{source:'集齐除第79、80号外的武器、盾牌、防具后，在贤者塔一层右侧房间与老贤者对话'});
Object.assign(d.records.find(r=>r.id==='item-8-4-1'),{source:'向阿努莉斯交付14份爱情，她出现在酒馆后对话取得'});
Object.assign(d.records.find(r=>r.id==='item-55-2-0'),{stats:{'天平重量':'68业','天平效果':'经验获取；金钱获取；魔导力强'}});
Object.assign(d.records.find(r=>r.id==='item-91-2-0'),{source:'原图未注明取得方式；核对游戏内图鉴后补充'});
// Source table has no numbers for this armor; do not turn absence into zero.
const ceremonial=d.records.find(r=>r.id==='item-15-3-1');ceremonial.effect='原资料未列基础数值';ceremonial.stats={};
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
