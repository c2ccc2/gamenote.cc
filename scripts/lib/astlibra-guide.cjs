const data=require('../../content/games/astlibra-revision/source-content.json');
const signatures=require('../../content/games/astlibra-revision/source-signatures.json');
const layout=require('../../content/games/astlibra-revision/layout.cjs');
const supplements=require('../../content/games/astlibra-revision/supplements.cjs');
const base='/games/astlibra-revision/';
const docs=Object.fromEntries(data.documents.map(d=>[d.id,d]));
for(const d of data.documents)if(signatures[d.id]!==d.sha256)throw Error('Astlibra source changed; review reading boundaries before updating source-signatures.json: '+d.id);
const blocks=(doc,start,end)=>{
 if(!docs[doc]||start<0||end>docs[doc].blocks.length||start>=end)throw Error(`Invalid Astlibra range: ${doc}:${start}-${end}`);
 return docs[doc].blocks.slice(start,end).map((block,i)=>({...block,doc,index:start+i}));
};
const ref=(title,href)=>({title,href});
const href=p=>base+p.category+'/'+p.id+'/';
const routePages=(records,category)=>records.map(p=>({...p,category,sections:p.steps.map(s=>({...s,blocks:blocks(s.doc,s.start,s.end)}))}));
const main=routePages(layout.main,'walkthrough'),postgame=routePages(layout.postgame,'postgame');
const detail=(category,id,title,description,doc,start,end,extra={})=>({category,id,title,description,sections:[{id:'guide',title,blocks:blocks(doc,start,end)}],...extra});
const equipment=[
 ['weapons','武器：属性、精通与获取图表',1,9],['shields','盾牌：格挡与精通图表',10,14],['armor','防具：属性与精通图表',15,19],['accessories','饰品：效果与获取图表',20,27]
].map(([id,title,start,end])=>detail('equipment',id,title,'按装备类型查看属性、获取方式与精通奖励，点击图表可放大阅读。','equipment',start,end,{imageTable:true}));
const itemCategories=[['misc','探索工具与杂物',30,33],['subweapons','副武器与投掷道具',34,37],['medicine','回复药品与异常状态应对',38,41],['food','料理与食品',42,50],['ingredients','食材与料理材料',51,54],['books-cards','书籍、卡片与配方',55,63],['minerals','矿石与宝石',64,71],['monster-materials','怪物素材',72,81],['key-items','剧情贵重品',82,88],['collection-items','徽章与收集品',89,92]];
equipment.push(...itemCategories.map(([id,title,start,end])=>detail('equipment',id,title,'查看道具用途、来源与对应资料图表。','equipment',start,end,{imageTable:true})));
const skillSpecs=[['basic','基础操作与信息显示',36,76],['exploration','探索、跳跃与采掘',76,115],['weapon','武器攻击与破防',115,158],['defense','防御、格挡与生存',158,198],['possession','凭依技与精力运用',198,238],['elements','属性与异常状态',238,283],['techniques','动作与技能变化',283,324],['special','特殊战斗与资源能力',324,364]];
const skills=skillSpecs.map(([id,title,start,end])=>{
 const entries=[];for(let i=start+1;i<end;i++){
  const b=docs.systems.blocks[i];if(b.kind!=='heading')continue;
  const match=b.text.match(/^\d+(.+)（(\d+)）$/);if(!match)throw Error('Unrecognized KARON skill '+b.text);
  const last=entries.at(-1);if(last)last.end=i;
  entries.push({id:`skill-${i}`,title:match[1],cost:+match[2],start:i+1,end});
 }
 return {category:'skills',id,title,description:'按用途查找嘉隆技能的水晶消耗、取得装备与效果；斜线后名称对应新章的技能变化。',sections:entries.map(e=>({...e,blocks:blocks('systems',e.start,e.end)}))};
});
const systems=[
 {category:'systems',id:'libra',title:'天平搭配：平衡、抵消与强化',description:'先理解两侧平衡和同效果抵消，再查询各档加成与挂盘强化。',sections:[{id:'balance',title:'先看平衡比例与同效果抵消',blocks:[...docs.systems.leadImages.map((b,i)=>({...b,doc:'systems',index:'lead-'+i})),...blocks('systems',2,12)]},{id:'upgrade',title:'新章挂盘强化',blocks:blocks('systems',13,15)},{id:'effects',title:'各档加成对照',table:'arrows',headers:['效果','星级','极','强','普通'],blocks:blocks('systems',17,33)}]},
 {category:'systems',id:'equipment-upgrades',title:'新章强化：装备盘、元件与蜕变',description:'装备强化、装备盘及元件宝石在新章开放，按用途查看成长规则。',sections:[{id:'upgrade',title:'强化装备的基础属性',blocks:blocks('systems',365,368)},{id:'boards',title:'为装备配置装备盘',blocks:blocks('systems',369,373)},{id:'gems',title:'元件宝石的强化效果',table:'gem-effects',blocks:blocks('systems',374,391)},{id:'transform',title:'嘉隆蜕变的循环顺序',table:'transforms',blocks:blocks('systems',391,423)}]},
 {category:'systems',id:'medals',title:'小徽章兑换：奖励顺序与位置入口',description:'按兑换次序查询小徽章奖励，并跳转到地图收集位置。',sections:[{id:'rewards',title:'兑换奖励顺序',table:'medals',blocks:blocks('systems',425,462)}]},
 {category:'systems',id:'arena',title:'斗技场：挑战与奖励查询',description:'按杯赛查找挑战奖励，包括饰品槽、配方、武器与小徽章。',sections:[]},
 {category:'systems',id:'crafting',title:'合成查询：补给、钥匙与剧情道具',description:'按配方来源查询材料组合，优先查找火把、炸弹、钥匙与状态药。',sections:[{id:'basic',title:'初始合成与高级配方',table:'recipes',blocks:blocks('systems',531,610)},{id:'alchemy',title:'小徽章奖励的炼金配方',table:'recipes',blocks:blocks('systems',611,625)}]}
];
for(const [n,start,end]of [[1,464,470],[2,470,476],[3,476,482],[4,482,488],[5,488,494],[6,494,500],[7,500,506],[8,506,512],[9,512,518],[10,518,529]]){
 const title=docs.systems.blocks[start].text.replace(/^\d+、|^⭐/g,'');systems.find(p=>p.id==='arena').sections.push({id:'cup-'+n,title,table:'arrows',headers:['挑战','奖励'],blocks:blocks('systems',start+1,end)});
}
const bosses=[
 ['loretta','女神洛丽塔：城镇壁画入口',628,631],['al-khamis','龙王阿尔哈米斯：城外地下路线',634,637],['unknown-creature','未知生物：井下隐藏区域',638,641],['beatrice','女神贝阿朵莉切：伊利西昂隐藏门',642,647],['adolphus','暴君阿道弗斯：贤者塔守卫',648,653]
].map(([id,title,start,end])=>detail('bosses',id,title,'查看隐藏区域入口、战前准备、招式应对与胜利奖励。','systems',start,end));
const collectionSpecs=[
 ['chapter-1','边境、村庄与天平洞窟','collect-upper',1,22,'第一章'],['chapter-2','城镇与布里帝恩湿地','collect-upper',23,51,'第二章'],['chapter-3','贝尔克多火山','collect-upper',52,81,'第三章'],['chapter-4','渔村海岸与海蛇洞窟','collect-upper',82,116,'第四章'],['chapter-5','阿克拉希诺城外与魔王城','collect-upper',117,160,'第五章'],['chapter-6','雪山与伊利西昂','collect-lower',1,34,'第六章'],['chapter-7','故乡与贝尔克多矿镇','collect-lower',35,69,'第七章'],['chapter-8','东京战区与研究所','collect-lower',70,99,'第八章'],['final-chapter','城镇回收与铁娘子','collect-lower',100,117,'最终章'],['postscript','新章区域追加收集','collect-lower',118,143,'新章']
];
const pickups=[];
const collections=collectionSpecs.map(([id,title,doc,start,end,sourceChapter])=>{
 const all=blocks(doc,start,end),records=[],maps=[];let pending=[];
 for(const b of all){
  if(b.kind==='text'&&/^宝箱\s*\d+[：:]/.test(b.text)){
   const match=b.text.match(/^宝箱\s*(\d+)[：:](.*)/),number=Number(match[1]),hint=docs[doc].hints?.[sourceChapter+':'+number];
   const record={id:`chest-${id}-${String(number).padStart(2,'0')}`,number,title:hint||`宝箱 ${String(number).padStart(2,'0')}`,description:match[2],blocks:pending.concat(b),chapter:id,category:hint?.includes('小徽章')?'medal':hint?.includes('天平挂盘')?'libra':hint?.includes('奥义')?'technique':'other'};
   records.push(record);pickups.push(record);pending=[];
  }else if(b.kind==='heading'){
   // A map heading separates the previous chest from the next area.
   maps.push(...pending);pending=[];maps.push(b);
  }else pending.push(b);
 }
 maps.push(...pending);
 if(new Set(records.map(r=>r.number)).size!==records.length)throw Error('Duplicate chest number in '+id);
 return {category:'collectibles',id,title,description:'按地图与开启条件寻找宝箱，位置图和路线说明一起阅读。',records,maps,all,sourceChapter};
});
const chestRewards=require('../../content/games/astlibra-revision/chest-rewards.json');
for(const record of chestRewards.records){
 const pickup=pickups.find(p=>p.id===record.id);
 if(!pickup)throw Error('Unknown chest reward '+record.id);
 for(const e of record.evidence){
  if(e.type!=='external'&&!docs[e.doc]?.blocks[e.block])throw Error('Missing reward evidence '+record.id);
  if(e.type==='image'&&!pickup.blocks.some(b=>b.doc===e.doc&&b.index===e.block&&b.kind==='image'))throw Error('Reward image belongs to another chest '+record.id);
 }
 pickup.rewards=record.rewards;
 pickup.rewardEvidence=record.evidence;
 pickup.rewardNote=record.note||'';
 pickup.title=record.rewards.map(r=>r.name+(r.quantity>1?' × '+r.quantity:'')+(r.position?'（'+r.position+'）':'')).join('；');
 pickup.category=pickup.title.includes('小徽章')?'medal':pickup.title.includes('天平挂盘')?'libra':pickup.title.includes('奥义')?'technique':'other';
}
const events=[
 {category:'side-quests',id:'ciro',title:'小百的同行选择与生存路线',description:'在魔王城保留关键人物的后续事件，先完成两次必要对话。',spoiler:true,sections:[{id:'choice',title:'入城时的同行选择',blocks:blocks('flow-upper',117,118)},{id:'return',title:'与盖乌会合后返回入口',blocks:blocks('flow-upper',137,140)}]},
 {category:'side-quests',id:'time-branches',title:'时间分歧：哪些选择会提前结束旅程',description:'按第六、七章的实际对话节点查看继续主线的选择。',spoiler:true,sections:[{id:'past',title:'第六章：是否改变过去',blocks:blocks('flow-upper',153,154)},{id:'future',title:'第七章：继续寻找嘉隆',blocks:blocks('flow-lower',26,33)}]},
 {category:'side-quests',id:'love',title:'阿努莉斯的记忆与爱情事件',description:'查看爱情的使用、记忆变化和后续结局入口。',redirect:base+'postgame/love/'}
];
const gemIndex={category:'postgame',id:'gems',label:'元件宝石位置总表',title:'新章元件宝石：位置与取得条件',description:`按名称和区域查找 ${supplements.gems.length} 种元件宝石的位置、前置条件与对应截图。`,indexType:'gems',sources:['flow-lower']};
const reminderIndex={category:'side-quests',id:'progress-reminders',label:'按进度查看易错过提醒',title:'易错过事项与分支提醒',description:'按游玩进度检查补给、条件收集和剧情选择，重要选项默认折叠。',indexType:'reminders',sources:['flow-upper','flow-lower']};
const sourceHref=record=>base+record.route+'/#source-'+record.doc+'-'+record.block;
for(const record of [...supplements.gems,...supplements.reminders,...supplements.encounters]){
 const source=docs[record.doc]?.blocks[record.block];
 if(!source||source.kind!=='text')throw Error('Index must reference an instruction: '+record.id);
 const route=record.route.startsWith('postgame/')||record.route.startsWith('walkthrough/')?record.route:'postgame/'+record.route;
 record.route=route;
 const page=[...main,...postgame].find(p=>p.category+'/'+p.id===route);
 if(!page||!page.sections.some(s=>s.blocks.some(b=>b.doc===record.doc&&b.index===record.block)))throw Error('Index instruction does not belong to target route: '+record.id);
 record.href=sourceHref(record);
 if(record.image!==undefined){
  const image=docs[record.doc].blocks[record.image];
  if(image?.kind!=='image'||!page.sections.some(s=>s.blocks.some(b=>b.doc===record.doc&&b.index===record.image)))throw Error('Index image does not belong to target route: '+record.id);
  record.imageSrc=image.src;
 }
}
systems.unshift({category:'systems',id:'beginners',title:'新手入门：成长、加点与战斗配置',description:'从难度选择到成长盘、装备精通、嘉隆与天平，按第一次游玩的顺序理解系统。',indexType:'beginner',sources:[]});
equipment.unshift({category:'equipment',id:'database',title:'装备与道具文字查询',description:'按名称、属性、精通奖励和来源检索 521 条装备与道具记录，并对照原图。',indexType:'items',sources:['equipment']});
equipment.unshift({category:'equipment',id:'crafting',title:'装备制作：材料、数量与费用',description:'221 条装备记录的制作条件、材料来源与用途反查。',indexType:'crafting',sources:['equipment']});
equipment.unshift({category:'equipment',id:'builds',title:'分阶段配装与嘉隆预算',description:'按主线到新章整理候选装备、获取入口、配置预算和换装时机。',indexType:'builds',sources:[]});
bosses.unshift({category:'bosses',id:'tactics',title:'首领打法：招式、应对与卡点排查',description:'48 场主线与新章遭遇的准备、招式处理与常见失败原因。',indexType:'tactics',sources:[]});
bosses.push({category:'bosses',id:'geraldin',title:'斗神杰拉丁：火山入口与限时战',description:'从火山隐藏入口挑战守卫与杰拉丁，核对胜利奖励。',indexType:'geraldin',sources:[]});
const rewardAudit={category:'collectibles',id:'reward-audit',title:'宝箱奖励与开启条件核对',description:'104 条位置记录的奖励、数量、开启条件与对应核对依据。',indexType:'collectionAudit',sources:[]};
const pages=[...main,...postgame,...equipment,...skills,...systems,...bosses,...collections,...events,gemIndex,reminderIndex,rewardAudit];
for(const p of pages){p.href=href(p);p.sources=[...new Set((p.sources||[]).concat((p.sections||[]).flatMap(s=>s.blocks.map(b=>b.doc)),(p.all||[]).map(b=>b.doc)))];}
const categories=[
 {id:'walkthrough',title:'主线图文流程',description:'从天平洞窟到铁娘子，按区域和推进目标阅读。',pages:main},
 {id:'postgame',title:'新章与结局',description:'重访区域、元件回收、盖亚迷宫与爱情事件。',pages:[gemIndex,...postgame]},
 {id:'collectibles',title:'地图与宝箱',description:'按探索区域查地图、开启条件和宝箱位置。',pages:[rewardAudit,...collections]},
 {id:'equipment',title:'装备与道具',description:'521 条文字记录与原图对照，按名称、属性和来源查询。',pages:equipment},
 {id:'skills',title:'嘉隆技能',description:'按战斗与探索用途查询 96 项技能的消耗、来源和效果。',pages:skills},
 {id:'systems',title:'天平、合成与斗技场',description:'查询天平效果、强化、配方、小徽章奖励与杯赛。',pages:systems},
 {id:'bosses',title:'首领与隐藏区域',description:'48 场主线与新章遭遇打法，以及 6 名隐藏首领的入口、机制和奖励。',pages:bosses},
 {id:'side-quests',title:'人物事件与分支',description:'按进度检查易错过事项，单独查看人物选择和结局相关事件。',pages:[reminderIndex,...events]},
 {id:'achievements',title:'成就与常见问题',description:'本体与新章 84 项成就的条件、前置、完成顺序与对应路线。',pages:[]}
];
// Preserve existing inbound step links when the new reading sections change.
const aliases={'chapter-1':{finish:'golden-dragon'},'chapter-4':{underwater:'cards'},'chapter-5':{mist:'mist'},'chapter-7':{hometown:'branch'},'chapter-8':{retreat:'future'},'final-chapter':{rush:'trials'}};
module.exports={base,data,docs,blocks,main,postgame,equipment,skills,systems,bosses,collections,pickups,events,pages,categories,aliases,ref,href,...supplements,gemIndex,reminderIndex};

