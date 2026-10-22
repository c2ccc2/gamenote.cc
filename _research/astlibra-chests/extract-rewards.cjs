const fs=require('fs'),g=require('../../scripts/lib/astlibra-guide.cjs');
const ocr=JSON.parse(fs.readFileSync(__dirname+'/all-ocr.json','utf8').replace(/^\uFEFF/,''));
const manual={
'chest-chapter-1-01':['飞剑的奥义卷轴',1,'image',4],
'chest-chapter-2-06':['升剑的奥义卷轴',1,'flow',23],
'chest-chapter-3-02':['小徽章',1,'image',58],
'chest-chapter-4-01':['血清',3,'image',85],
'chest-chapter-5-09':['攻击卡',2,'external','Ruined Town Well'],
'chest-chapter-5-13':['体力卡',1,'external','Stairwell between 2nd and 3rd floor'],
'chest-chapter-7-04':['魔导水晶',1,'external','Anesta Inn'],
'chest-chapter-8-01':['攻击卡',2,'external','Toward the Facility 1'],
'chest-chapter-8-03':['魔导水晶',1,'external','Toward the Facility 6'],
'chest-chapter-8-06':['攻击卡',3,'external','3rd Floor: Left Corridor 2'],
'chest-chapter-8-07':['防御卡',3,'external','4th Floor: Data Console Room'],
'chest-chapter-8-08':['魔导水晶',1,'external','3rd Floor: Right Corridor 2'],
'chest-chapter-8-09':['精力卡',2,'external','2nd Floor: Magma Chamber']
};
const records=g.pickups.map(p=>{
 const matches=ocr.filter(r=>r.block.startsWith(p.id+'-')).flatMap(r=>r.lines.map(l=>({r,text:l.text.replace(/\s/g,'')}))).filter(o=>/获得|得了|获得亍/.test(o.text));
 let name,quantity=1,evidence;
 const m=manual[p.id];
 if(m){[name,quantity]=m; evidence=m[2]==='external'?{type:'external',url:'https://steamcommunity.com/sharedfiles/filedetails/?id=2888133558',location:m[3]}:m[2]==='flow'?{type:'text',doc:'flow-upper',block:m[3]}:{type:'image',doc:p.blocks[0].doc,block:m[3]};}
 else{
 const hit=matches.at(-1);if(!hit)throw Error('No OCR '+p.id);
 const text=hit.text.replace('获得亍','获得了');quantity=+(text.match(/了(\d+)个/)||[])[1]||1;
 name=text.replace(/^.*?了(?:\d+个)?[“"「]?/,'').replace(/[”"」！!，。]+$/g,'');
 evidence={type:'image',doc:p.blocks[0].doc,block:+hit.r.block.split('-').at(-1)};
 }
 // Names manually checked against the displayed local screenshots.
 if(p.id==='chest-chapter-5-06')name='小徽章';
 if(p.id==='chest-postscript-05')name='小徽章';
 if(p.id==='chest-chapter-6-11')name='悠久的高卢·申';
 const record={id:p.id,rewards:[{name,quantity}],evidence:[evidence]};
 if(p.id==='chest-chapter-5-08'){
 record.rewards=[{name:'火药',quantity:2,position:'08A：门上方高台'},{name:'魔导水晶',quantity:1,position:'08B：墙壁遮挡房间'},{name:'魔导水晶',quantity:1,position:'08C：最右侧岩石后'}];
 record.evidence.push({type:'external',url:'https://steamcommunity.com/sharedfiles/filedetails/?id=2888133558',location:'Ruined Town: three chests after the green arrow'});
 record.note='原稿编号 08 合并了三只宝箱；按 A／B／C 分别列奖励，104 为位置记录数。';
 }
 return record;
});
fs.writeFileSync('content/games/astlibra-revision/chest-rewards.json',JSON.stringify({checked:'2026-10-22',method:'本地取得提示截图逐项阅读；缺少取得提示时交叉核对本地主线或 KH/TWRoxas 的同场景实玩收集指南。',records},null,2)+'\n');
console.log(records.map(r=>[r.id,r.rewards.map(a=>a.name+'×'+a.quantity).join('；')]).map(a=>a.join(' ')).join('\n'));
