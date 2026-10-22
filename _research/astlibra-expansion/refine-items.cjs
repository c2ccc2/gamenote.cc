const fs=require('fs');const p='content/games/astlibra-revision/items.json',d=JSON.parse(fs.readFileSync(p,'utf8'));const tiles=JSON.parse(fs.readFileSync('_research/astlibra-expansion/cell-ocr.json','utf8').replace(/^\uFEFF/,''));
const clean=s=>s.replace(/\s+/g,'').replace(/力是/g,'力量').replace(/重是/g,'重量').replace(/[ＣCＯO](?=\d|$)/g,'0').replace(/一(?=\d)/g,'-').replace(/廣/g,'魔').replace(/袢/g,'神').replace(/徽宣/g,'徽章').replace(/羸得/g,'获得').replace(/凍京|冻京/g,'东京').replace(/芊1互|芊互/g,'幸运').replace(/恢复是|回复是/g,'回复量').replace(/[|]/g,'').replace(/新宣/g,'新章').replace(/宣后/g,'章后');
function rect(lines,x1,y1,x2,y2){return clean(lines.map(l=>({y:Math.min(...l.words.map(w=>w.y)),ws:l.words.filter(w=>w.x+w.w/2>=x1&&w.x+w.w/2<x2&&w.y+w.h/2>=y1&&w.y+w.h/2<y2)})).filter(l=>l.ws.length).sort((a,b)=>a.y-b.y).map(l=>l.ws.map(w=>w.text).join('')).join('；'))}
for(const r of d.records){const lines=tiles.find(t=>t.block===r.id.slice(5)).lines.map(l=>({...l,words:l.words.map(w=>({...w,x:w.x/3,y:w.y/3,w:w.w/3,h:w.h/3}))}));
 if(r.category==='accessories'){
  r.stats={};for(const [x1,x2,v1,v2]of [[118,188,188,233],[233,302,302,347]])for(const [y1,y2]of [[48,81],[81,114]]){
   let key=rect(lines,x1,y1,x2,y2),value=rect(lines,v1,y1,v2,y2);if(key&&value){key=key.replace(/最大体刂/g,'最大体力').replace(/格扌当/g,'格挡');if(/^[\u4e00-\u9fff]+$/.test(key)&&/^-?\d+$/.test(value))r.stats[key]=value}
  }
  r.effect=rect(lines,188,114,347,147).replace(/^效果/,'');
 }
 if(!['weapons','armor','shields','accessories'].includes(r.category)){
  const extra=rect(lines,220,107,340,145);
  if(extra)r.stats['天平效果']=[r.stats['天平效果'],extra].filter(Boolean).join('；');
  r.effect=rect(lines,112,145,340,182);
 }
 for(const k of ['effect','mastery','source'])r[k]=clean(r[k]).replace(/；+/g,'；');
 if(r.category==='accessories'&&r.effect==='无')r.effect='';
}
// Manually checked against the original table and the previously transcribed systems.
const fixes={
'item-20-0-0':{stats:{'敏捷':'15'}},'item-20-0-1':{stats:{'攻击力':'2'}},'item-24-2-0':{effect:'增加掉落提升能力的装备盘',source:'扭蛋兑换奖励（详见小徽章奖励表）'},'item-24-2-1':{effect:'增加掉落提升特殊效果的装备盘'},'item-25-3-1':{stats:{'幸运':'30'},effect:'无法获得经验'},'item-26-3-1':{effect:'更容易掉落装备盘'},
'item-30-1-0':{effect:'返回佩可奇拉村；通关天平洞窟后消失'},'item-30-1-1':{effect:'在允许自由传送时，返回已经到过的水晶'},'item-32-1-1':{effect:'重置能力点分配'},'item-32-2-1':{effect:'战斗不能时用于复活'},
'item-38-0-0':{effect:'回复 300 体力'},'item-38-0-1':{effect:'回复 500 体力'},'item-38-1-0':{effect:'回复 1200 体力'},'item-38-1-1':{effect:'高级体力回复药',source:'随机宝箱、合成配方'},
'item-56-1-1':{name:'世界童话集'},'item-52-0-0':{name:'栗子'},'item-84-1-1':{name:'金色稻穗'}
};
for(const r of d.records)Object.assign(r,fixes[r.id]||{});
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
console.log(d.records.filter(r=>r.category==='accessories').map(r=>[r.name,JSON.stringify(r.stats),r.effect].join(' | ')).join('\n'));
