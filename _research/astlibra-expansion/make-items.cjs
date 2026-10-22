const fs=require('fs'),g=require('../../scripts/lib/astlibra-guide.cjs'),raw=require('./extracted.json');
const names={weapons:'树枝|棍棒|石制小刀|骨剑|钢锥锤|魔法杖|赤石剑|银臂|钉锤|铜剑|铜枪|罗马短剑|铁斧|银制哥布林锤|阔剑|石制大剑|双蛇杖|短剑|铁锤|西洋剑|战斧|钉锤|阔头枪|魔导士之杖|冰剑|屠龙剑圣乔治|青龙刀|远古锤|精灵之杖|铁块锤|弯刀|阵风龙|火匕首|冰凌枪|魔剑格拉墨|斧枪|火锤|拳刃|暗黑斧|毁灭|雷魔法杖|克里斯马德礼剑|正宗|米斯特汀|大魔导师之杖|鲨牙剑|薄冰匕首|流星锤|巨魔锤|兴风者|骑枪|护手刺剑|雷神之锤妙尔尼尔|雷瓦汀|斩裂剑提尔锋|炽天使|朗基努斯之枪|地龙锤布尔特根|神圣法杖圣连斯提尔|龙颚|黑暗剑|高洁之剑|迪朗达尔|不断之杖|兽爪|双刃斧|大地剑迦伦提恩|纳格灵|大精灵之杖|龙枪盖伯尔加|钢剑巴鲁姆克|里迪尔|魔杖乌鲁斯拉格纳|断钢圣剑|破坏锤诸神黄昏|神枪冈格尼尔|光剑克拉乌索拉斯|魔剑阿隆戴特|弑神剑阿涅斯泽西亚|超究极切割光剑村正',shields:'木制圆盾|皮盾|小圆盾|一线盾|古罗马长盾|石制圆盾|鸢盾|宗族盾|铜盾|护林盾|战盾|不死鸟之盾|铁制小圆盾|铁塔盾|宝石盾|苍银盾|黄金小圆盾|骑士盾|死灵盾|暗黑盾|石像盾|雪原盾|秘银盾|古代盾|拉达曼迪斯盾|狮盾|金塔盾|狮鹫盾|龙神盾|机械盾|防暴盾|恶魔盾|重生盾|晶莹之露|神盾残虐命数',armor:'无|皮衣|皮甲|胧|霸者盔甲|猎人服|象牙盔甲|仪式盔甲|妖精盔甲|鳞甲|强化皮革盔甲|武士盔甲|黑魔女的衣物|暗黑甲|铁盔甲|武将盔甲|近卫骑士盔甲|蝎子旃那|无限方阵|元素护佑|赤龙盔甲|忍者服|大地盔甲|正统国王盔甲|大马士革钢盔甲|白银盔甲|世纪末盔甲|塔那托斯|钢铁盔甲|黄金仪式服|天鹅绒龙盔甲|克罗诺斯|机械盔甲|暗黑盔甲|英雌盔甲|灵魂盔甲|繁星盔甲|心天平',accessories:'木戒指|漂亮的戒指|碎骨项链|牙齿护身符|龙酒杯|铁戒|脚镣|火焰戒指|印第安饰品|龙竖琴|纯白羽翼|螺旋戒|苍宝石耳坠|力量戒|龙戒|金项链|龙法杖|祈祷戒|蛇神戒|祖母绿耳环|花环|十字架|不死鸟羽毛|龙皮靴|守护戒|金色假发|泪珠项链|金手镯|古代戒|古代项链|花戒|坦桑石戒|力量手套|元素披风|恶魔戒|龙女戒|万圣节腰带|魔法手套|金怀表|魔矿石戒|魔法壳|英雌的发饰|暗物质宝珠|荣耀宝珠|能力护目镜|特殊护目镜|排斥石板|探知石板|盗贼手套|荆棘徽章|石块徽章|菖蒲徽章|月桂徽章|鹰戒|纯金锚|龟壳|精金盾|勇气八音盒|狮子头|舔舔糖果|反射戒|天马的羽毛靴|悠久的高卢·申|凯撒戒|硬币勋章|力量晶体勋章|等级勋章|KEIZO徽章'};
for(const k in names)names[k]=names[k].split('|');
const overrides={'30-1-0':'佩可奇拉滴露','32-2-1':'嗼啾玩偶','38-1-1':'仙馔密酒','52-0-0':'栗子','52-0-1':'苹果','56-1-1':'世界童话集','72-0-1':'圆木','73-0-0':'曼德拉','75-0-1':'鮟鱇鱼肝','84-1-1':'金色稻穗'};
const fix=t=>t.replace(/\s+/g,'').replace(/重是/g,'重量').replace(/格扌当/g,'格挡').replace(/精邇|精遄/g,'精通').replace(/弓虽/g,'强').replace(/廣/g,'魔').replace(/袢/g,'神').replace(/徽宣/g,'徽章').replace(/勋宣/g,'勋章').replace(/新宣/g,'新章').replace(/([一二三四五六七八九十])宣/g,'$1章').replace(/鏢亮/g,'漂亮').replace(/翎(?=矿石|锭)/g,'铜').replace(/晏德拉/g,'曼德拉').replace(/力是/g,'力量').replace(/图丝|丝纸/g,'图纸').replace(/儡可|偑可|佩可/g,'佩可').replace(/[旧囝儡]木/g,'圆木').replace(/金昜/g,'金币').replace(/犒|镝/g,'镐').replace(/[×]/g,'x').replace(/业(?=；|$)/g,'业').replace(/；[．，；]+/g,'；').replace(/^[；．，]+|[；．，]+$/g,'');
const tiles=JSON.parse(fs.readFileSync('_research/astlibra-expansion/cell-ocr.json','utf8').replace(/^\uFEFF/,''));
const original=JSON.parse(fs.readFileSync('_research/astlibra-expansion/ocr.json','utf8').replace(/^\uFEFF/,''));
function rect(words,x1,y1,x2,y2){const ls=new Map();for(const w of words){if(w.x+w.w/2<x1||w.x+w.w/2>=x2||w.y+w.h/2<y1||w.y+w.h/2>=y2)continue;const key=w.line;let l=ls.get(key);if(!l){l={y:w.y,ws:[]};ls.set(key,l)}l.ws.push(w)}return fix([...ls.values()].sort((a,b)=>a.y-b.y).map(l=>l.ws.sort((a,b)=>a.x-b.x).map(w=>w.text).join('')).join('；'))}
const counts={},records=[];
for(const r of raw){
 if(!r.title&&!r.newTitle)continue;
 const i=(counts[r.type]||0);counts[r.type]=i+1;
 const category=g.equipment.find(p=>p.sections.some(s=>s.blocks.some(b=>b.index===r.sourceBlock))).id;
 const n=r.type==='items'?parseInt((r.newTitle||r.title).replace(/^[^\d]+/,'')):i+1;
 let name=names[r.type]?.[i]||fix(r.newTitle.replace(/^[^\u4e00-\u9fff【\[]*/,''));
 name=overrides[r.key]||name.replace(/[〖【]/g,'[').replace(/[}】]/g,']').replace(/；[．，]+$/,'');
 const words=tiles.find(t=>t.block===r.key).lines.flatMap((l,i)=>l.words.map(w=>({...w,x:w.x/3,y:w.y/3,w:w.w/3,h:w.h/3,line:i}))),stats={},isItem=r.type==='items';
 if(r.type==='weapons'){
  stats['属性']=rect(words,190,40,241,73);stats['种类']=rect(words,326,40,377,73);stats['攻击力']=rect(words,190,73,241,106);stats['重量']=rect(words,326,73,377,106);
 }else if(r.type==='shields'){
  stats['防御力']=rect(words,188,40,233,73);stats['格挡']=rect(words,302,40,347,73);stats['重量']=rect(words,188,73,233,106);stats['全抗性']=rect(words,302,73,347,106);
 }else if(r.type==='armor'){
  stats['防御力']=rect(words,188,48,233,81);stats['最大体力']=rect(words,302,48,347,81);stats['最大精力']=rect(words,188,81,233,114);stats['魔导力']=rect(words,302,81,347,114);
 }
 let mastery=rect(words,r.type==='weapons'?190:188,r.type==='weapons'?140:r.type==='armor'?114:106,r.type==='weapons'?377:347,r.type==='weapons'?173:r.type==='armor'?147:140);
 // Cross-reference all named KARON rewards against the already transcribed system article.
 const skill=g.skills.flatMap(p=>p.sections).find(s=>s.blocks.some(b=>b.text?.includes(String(i+1).padStart(2,'0')+name)));
 if(skill&&!isItem&&r.type!=='accessories')mastery=skill.title.split('/')[0]+`（${skill.cost}）`;
 let source=rect(words,r.type==='weapons'?190:118,r.type==='weapons'?174:140,r.type==='weapons'?377:347,300).replace(/；/g,' ');
 if(isItem)source=rect(words,112,182,340,232).replace(/；/g,' ');
 if(r.type==='armor')source=rect(words,118,147,347,260).replace(/；/g,' ');
 if(r.type==='accessories')source=rect(words,118,140,347,260).replace(/；/g,' ');
 source=fix(source).replace(/\b[123][．.]/g,'').replace(/^(?:获得方法|获得方洼)/,'');
 let effect=isItem?rect(words,112,107,340,182):r.type==='accessories'?rect(words,118,42,347,140):'';
 if(isItem){stats['天平重量']=rect(words,220,41,340,74);stats['天平效果']=rect(words,220,74,340,107)}
 if(!name||name.length>35)throw Error('Bad item title '+r.key+':'+name);
 for(const key of Object.keys(stats)){if(['攻击力','防御力','重量','最大体力','最大精力','魔导力','格挡','全抗性'].includes(key))stats[key]=stats[key].replace(/[CＯO]/g,'0').replace(/l/g,'1')}
 records.push({id:'item-'+r.key,name,number:Number.isFinite(n)?n:null,category,stats,effect:fix(effect),mastery:(!isItem&&r.type!=='accessories')?fix(mastery):'',source,sourceBlock:r.sourceBlock,image:r.src,sourceHref:g.base+'equipment/'+category+'/#source-equipment-'+r.sourceBlock});
}
fs.writeFileSync('content/games/astlibra-revision/items.json',JSON.stringify({checkedAt:'2026-10-21',source:'https://www.bilibili.com/read/cv19511254',records},null,2)+'\n');
console.log(counts,'TOTAL',records.length);
fs.writeFileSync('_research/astlibra-expansion/items-review.txt',records.map(r=>[r.id,r.name,JSON.stringify(r.stats),r.mastery,r.effect,r.source].join(' | ')).join('\n'));
