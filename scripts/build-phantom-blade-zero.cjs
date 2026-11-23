const fs=require('node:fs');
const write=require('./lib/write-file.cjs');
const opening=require('./lib/phantom-blade-zero-opening.cjs');
const regions=require('./lib/phantom-blade-zero-regions.cjs');
const areaBriefs=require('./lib/phantom-blade-zero-area-briefs.cjs');
const pickupTiming=require('./lib/phantom-blade-zero-pickup-timing.cjs');
const materialCounts=require('./lib/phantom-blade-zero-material-counts.cjs');
const areaLoot=require('./lib/phantom-blade-zero-area-loot.cjs');
// Use descriptive Chinese labels where the in-game localization is unconfirmed.
const chineseQuestTerms=Object.entries({
 'Abyssal Bell':'深渊铃','All Return to Dust':'万物归尘','Aureate':'金色单手剑','Blood Feast':'血宴','Border Poems':'边塞诗','Cell Key':'牢房钥匙','Dark Sigil Burst':'暗纹爆发','Dread Axe':'巨凶斧','Fanatic’s Obsession':'狂信者的执念','Fixation':'执念','Forge':'锻造','Full-Power Strike':'全力一击','Ghostfire Wreath':'鬼火环','Herald’s Lingering Threads':'梦差残丝','Hidden Passage to Pangzhen':'通往庞镇的密道','Jagged Steel':'残钢','Leng Tu':'冷茶','One-Armed Tiger':'独臂虎','Phantom of The Old House':'老宅幻影','Remnant Dust':'残尘','Remnant Spark':'余火','Rift of Bones':'白骨裂隙','Sanguine Reach':'血色长锋','Serpent’s Memory':'蛇之记忆','Sundering Dual Axes':'破裂双斧','The Fanatic’s Broken Blade':'狂信者的断刃','The Fanatic’s Drunken Sword':'狂信者的醉剑','The Grand Design':'宏图','The Lady’s Crown':'夫人的冠饰','The Lady’s Fan':'夫人的扇子','Valley Sha-Chi Tower 1st Floor':'溪谷杀气塔一层','Wolfjaw':'狼颚',
 'Lóng’s Roar':'龙之咆哮','Honor Among Thieves：飞贼营地三道问答':'飞贼营地三道问答',
 'Festering Secret':'据点秘事','Honor Among Thieves':'飞贼营地问答','A Healer’s Mercy':'救治受伤飞贼','A Puppet’s Wooden Heart':'人偶木心','A Severed Mindseal':'杀气塔原石','Allure of Vanity':'虚荣诱惑','Apprentice Healer':'玉儿采药','Annihilation':'歼灭','Attachment':'执念',
 'Backstreet Archway':'后街拱门','Baishan Headband':'白山派头巾','Beneath the Well':'井下','Bi Feng':'毕锋','Blackwater Crew Deck':'黑水帮船甲板','Blemish Goldweed':'带斑金草','Blood Oath Dagger':'血誓匕首','Blood-Stopper Vine':'止血藤','Bloodline Awakening':'龙脉觉醒','Broken Puppet Pit Entrance':'断偶坑入口','Broken Vessel':'破损容器','Cavern Passage':'洞穴通道','Commander’s Platform':'指挥台','Congealeaf':'凝血叶','Core':'核心','Crimson Manor':'红衣女子的宅邸','Cui':'小翠',
 'Daughter of the Dark Sect':'红衣女子支线','Deep in the Valley':'溪谷深处','Dovecote':'鸽舍','Dusk':'暮色','Engine Giant Remains':'机关巨人残骸','Fanatic’s Fragment':'狂信者碎片','Fiend Saws':'妖锯','Final Battle':'最终决战','Fish Fragment':'鱼形碎片','Fist Fragment':'拳形碎片','Flaming Mane':'烈焰鬃毛','Forbidden Arts Beneath the Lake':'湖底禁术','Forbidden Path':'禁道','Frozen Lake Dock':'冰湖码头','Gentle Thief':'温和的飞贼','Grief-Stricken Jin':'悲恸的荆野','Hanging Cage Cavern':'挂笼洞窟','Heel Reinforcement Part':'足跟强化部件','Hero’s Courage':'侠士之勇',
 'Illusion of Inanis':'虚空幻象','Illusory Pipa':'幻术琵琶','Inanis’ Radiant Fan':'虚空的光扇','Ink Cut':'墨斩','Iron Butcher’s Camp':'铁屠营地','Kui Yanyan':'魁炎炎','Kuye Temple Sutra':'苦叶寺经文','Ledger of Atonement':'赎罪账簿','Longevity Tonic':'延寿药','Loong Emblem':'龙纹徽记','Lu Sanquian':'陆三千','Master Healer’s Memory':'医师记忆','Meigu Songhouse Dock':'梅谷乐坊码头','Merciful Dew':'慈悲露','Nimble Thief':'妙手小张','Nirvana':'涅槃','Outlaw Trap':'飞贼陷阱','Parting Mists':'拨开迷雾','Path of the Baishan’s Fall':'白山派覆灭之路','Perfect Vessel Estate':'人偶宅邸','Phantom Illusionist Ruins':'幻术师遗迹','Pillars of Kunlun':'昆仑龙柱','Pond of Fading Song':'余音池','Pong of Fading Song':'余音池',
 'Puppet Cell':'人偶牢房','Purge the Sect':'清剿教派','Remnant Spark Cube':'余火方块','Ritual Cauldron Fragment III':'祭鼎碎片三','Rogue Box':'飞贼匣','Rootless Dew':'无根露','Secrets at the Heart of the Lake':'湖心秘密','Secrets of the Baishan Sect':'白山派秘事','Sha-Chi Headscarf':'杀气头巾','Sha-Chi Powered Boat':'杀气驱动船','Shaded Bamboo Path':'竹荫小径','Shell':'外壳','Shrine Outer Gate':'神龛外门','Silent Wrap':'静默缠布','Snow and Blood':'雪与血','Sunset Path':'落日小径','Temple of Blue Fireflies':'幽蓝萤火之庙','The Herald’s Illusion':'使者幻象','The Lady Grounds':'夫人所在的场地','The Lady’s Cave':'夫人洞窟','The Lady’s Shrine':'夫人神龛','The Last Mandate Encampment':'末令营地','This won’t absolve you of your sins':'这不能洗清你的罪孽','Tianxuan Bronze Sword':'天玄铜剑','Training Grounds Depths':'训练场深处','Transcension Cores':'超脱核心','Twin Fish Pendant':'双鱼佩','Ultimate Talisman':'终极护符','Weeping Mistgate':'悲雾门','Whence the Weeping':'悲泣缘由','Whiteshadow':'白影','Whiteshadow’s Fall':'白影的陨落','Wu Xuan':'武玄','Yan Qiansui':'燕千岁','Young Mistress':'大小姐','Zhang’s Hideout':'小张藏身处'
});
// Describe pickups and landmarks by their appearance when a Chinese in-game name is unverified.
const chineseAreaTerms=[
 ['The Journey Home','归家委托'],['Young Master Lan','兰大少'],
 ['Lady’s Rift','山崖下的存档钟'],['Sanguine Twin','双持武器'],['Broken Puppet Valley','断偶所在的谷地'],
 ['Rustblade Pavilion','残钢战后的存档钟'],['Outpost Courtyard','据点庭院'],['Outpost','据点'],
 ['Blackstone Shard','黑石碎片'],['Peng Meng','澎猛'],['Valley Sha-Chi Tower 1st Floor','溪谷杀气塔一层'],
 ['Hua','阿花'],['铁匠 Forge','铁匠'],['Yu’er','玉儿'],['Crimson Forest','血色森林'],['Thieves Camp','飞贼营地'],
 ['Scarlet Wraithblade','可生成减速花的刀'],['Gu Wanyue','顾晚月'],
 ['Heartpiercer','白蛇屋守卫'],['Perfect Vessel Pond','红灯石阶下的水边'],['Lei Dang','独臂虎'],['Tiger Cannon','虎炮'],
 ['Violet Blossom','虚空交付的紫色花朵'],['The Last Chance','冰洞前的存档钟'],['Soulrend Cliff','断魂山崖'],
 ['Final Battle 结局卡和 With Heart and Blood 成就','真结局卡和对应的成就提示'],
 [' Phantom of The Old House',''],['单手剑 Aureate','金色单手剑'],['Broken Lóng Body','真龙之躯的残骸'],['Radiant Heart','发光的心形道具']
];
const questTerms=[...chineseQuestTerms,...chineseAreaTerms].sort((a,b)=>b[0].length-a[0].length);
const localizeQuest=text=>questTerms.reduce((value,[term,translation])=>{
 const pattern=term.replace(/[.*+?^$${}()|[\]\\]/g,'\\$&').replaceAll('’',"[’']\\s*");
 return value.replace(new RegExp('(?<![A-Za-z])'+pattern+'(?![A-Za-z])','g'),translation);
},text).replace(/\b([AB]) P(\d+)/g,(_,series,n)=>'实录'+(series==='A'?'一':'二')+'第 '+n+' 集').replace(/\bP(\d+)/g,'第 $1 集');
const areaGroups=[
 ['against-the-flow','悲泣溪谷','Weeping Creek Valley','flesh-lily','tower-to-waterfall','late-57','red-house-revisit'],
 ['forest-entry','血色森林','Crimson Forest','hanging-cage','bandit-camp','cliffside-lodge','mirror-forest','mirror-deep','forest-tower-revisit','three-faced-puppet'],
 ['lu-village','陆家村','Lu Village','lu-village-route','danghui'],
 ['pang-town','庞镇','Pang Town','pang-town-route','pang-tower','late-65'],
 ['orthodox-camp','正道大营','Orthodox Camp','orthodox-camp-route'],
 ['plum-lake','梅谷湖与水域','Plum Valley Lake and waterways','water-gang','water-gang-route'],
 ['late-55','枷笼山','Cage Mountain','late-56','cage-late-fight'],
 ['late-58','雪山','Snow Mountain','late-59','snow-swordsman'],
 ['late-60','戏梦山庄','Dreamplay Manor','late-61','yuding','late-62','late-63','manor-memories'],
 ['late-66','断魂山','Soulbreak Mountain','soulbreak-pair','late-67','soulbreak-finale','zuo-shang']
];
const areaEntries=new Map(opening.walkthrough.map(entry=>[entry[0],entry]));
const groupedAreas=new Map(areaGroups.map(([id,zh,en,...rest])=>[
 id,[id,zh,en,null,null,[id,...rest].map(key=>areaEntries.get(key))]
]));
const movedAreas=new Map(areaGroups.flatMap(([id,,, ...rest])=>rest.map(key=>[key,id])));
const bossSections={
 'jagged-steel':'against-the-flow',
 'peng-meng':'against-the-flow',
 hua:'flesh-lily',
 pursuer:'tower-to-waterfall',
 qiufeng:'late-62',
 yuding:'yuding',
 'three-faced-puppet':'three-faced-puppet',
 'zuo-shang':'zuo-shang',
 heartpiercer:'water-gang-route',
 'lei-dang':'late-60'
};
for(const [id,,,,source] of opening.bosses){
 if(source?.startsWith('../../walkthrough/'))bossSections[id]=source.split('#')[1];
}
opening.walkthrough=opening.walkthrough.filter(([id])=>!movedAreas.has(id)).map(entry=>groupedAreas.get(entry[0])||entry);
const slug='phantom-blade-zero';
const curated=require('./lib/phantom-blade-zero-collection-index.cjs');
const official='https://pbz.s-game.com/en-US/';
const systems='https://blog.playstation.com/2026/08/17/phantom-blade-zero-state-of-play-dives-deep-into-combat-and-the-wulin-world/';
const combat='https://blog.playstation.com/2026/10/28/phantom-blade-zero-how-boss-weapons-transform-combat-and-exploration/';
const pages=[
 ['walkthrough','主线流程','Main walkthrough','按区域查看推进路线与收集时机。每个区域列出初次能拿的物品、容易错过的步骤，以及取得道具或推进剧情后可回访的地点。','Browse each area for the main route, first-visit pickups, missable steps and reasons to return after obtaining an item or advancing the story.',systems],
 ['side-quests','支线任务','Side quests','按任务查找所需道具、交付位置和后续步骤。','Find quest items, hand-in locations and follow-up steps.',null],
 ['bosses','首领图鉴','Boss archive','查看已整理的首领进场路线、招式应对与战后去向。','Find arena routes, attack responses and what to do after each fight.',combat],
 ['equipment','兵器与配装','Weapons & builds','先给两把主武器安排不同用途：一把练习短连段，一把用于切换后接续攻势。副武器有使用限制，留给明确的输出或控场机会。阿花掉落的刀可通过连段生成减速敌人的花。','Give the two main weapons distinct roles: practise short strings with one and continue pressure after swapping to the other. Save limited-use Phantom Edges for deliberate openings. Scarlet Wraithblade combos can create flowers that slow enemies.',combat],
 ['collectibles','探索与收集','Exploration & collectibles','下方已整理山谷前段的固定拾取。回访时分别记录未开的岔路、未完成的对话和当前无法抵达的位置；后续按区域补入地标、前置条件和路线截图。','Early valley pickups are listed below. For return visits, record unopened branches, unfinished conversations and unreachable spots separately. Future entries will include landmarks, prerequisites and route images.',systems],
 ['systems','攻防入门','Combat fundamentals','先练“短连段 → 防御或闪避 → 换武器”。持续格挡会消耗煞气，耗尽后容易失衡；精准招架和成功闪避后的反击可压制对手。切换主武器可以回补自身煞气，别等到防御崩溃才换。','Practise a short combo, defend or dodge, then swap weapons. Blocking drains Sha-Chi and running out leaves you exposed. Timed parries and dodge counters pressure the opponent. Swapping main weapons replenishes Sha-Chi, so practise it before your guard breaks.',combat]
];
for(const en of [false,true]){
 const base=(en?'/en':'')+'/games/'+slug+'/', title=en?'Phantom Blade Zero':'影之刃零';
 const entries=curated.map(([id,zh,english,stepZh,stepEn,area,section,image])=>[
  id,zh,english,[[stepZh,stepEn,[[image,zh,english]]]],base+'walkthrough/'+area+'/#'+section
 ]);
 const questIds=new Set(['flesh-lily-item','three-memories','four-snake-houses','red-house']);
 const weaponIds=new Set(['dread-axe','yuding-crescent','baiying','apparition-fan','duanchang-axes']);
 const content={
  ...opening,
  'side-quests':[...require('./lib/phantom-blade-zero-missables.cjs'),...entries.filter(([id])=>questIds.has(id)&&id!=='four-snake-houses')],
  collectibles:[...entries,...opening.collectibles],
  equipment:[...opening.equipment,...entries.filter(([id])=>weaponIds.has(id))]
 };
 const label=p=>en?p[2]:localizeQuest(p[1]);
 const questGroups=[
  ['checkpoints','推进检查','Progression checks','missable-quests','ending-checkpoints'],
  ['valley','悲泣溪谷','Weeping Creek Valley','flesh-lily-item','apprentice-healer','festering-secret','four-fierce-axes'],
  ['forest','血色森林','Crimson Forest','healers-mercy','baishan-secrets','purge-the-sect','honor-among-thieves','use-it-against-them','heart-of-the-fist'],
  ['village','陆家村','Village of Lu','journey-home','young-master-lan','young-mistress','puppet-wooden-heart','cui-rescue','dahuang','leave-none-alive','heart-of-the-lake'],
  ['town','庞镇','Pangzhen','star-performer','remnant-spark-cube','mothers-heart','sword-and-way','brother-once-more','kin-against-kin','dont-forget-me','sha-chi-powered-boat','four-snake-houses'],
  ['camp','正道大营','Mandate Encampment','daughter-of-dark-sect','undying-heroic-spirit','xue-admirer'],
  ['lake','梅谷湖','Meigu Lake','allure-of-vanity','illusory-pipa'],
  ['mountain','枷笼山','Mountain of Imprisonment','bai-xue','broad-saber','heros-lament'],
  ['estate','戏梦山庄','Mirage Estate','three-memories'],
  ['revisits','跨区收集与回访','Cross-region collections and revisits','severed-mindseal','red-house','quick-hand-treasures','heart-of-the-banyan','quick-hand-hideouts','bloodline-awakening']
 ];
 const questEntries=new Map(content['side-quests'].map(quest=>[quest[0],quest]));
 const groupedQuestIds=questGroups.flatMap(group=>group.slice(3));
 if(new Set(groupedQuestIds).size!==groupedQuestIds.length||groupedQuestIds.length!==questEntries.size||groupedQuestIds.some(id=>!questEntries.has(id))){
  throw Error('Each side quest must appear in exactly one directory group.');
 }
 const routes=pages.flatMap(page=>[[page],...content[page[0]].map(entry=>[page,entry])]);
 for(const [page,entry] of [[null],...routes]){
  const category=page?page[0]+'/':'';
  const tail=category+(entry?entry[0]+'/':''),url=base+tail,alt=(en?'':'/en')+'/games/'+slug+'/'+tail;
  const heading=entry?label(entry):page?label(page):title;
  const lead=entry?heading:page?page[en?4:3]:en?'A wuxia guide in progress. Start with combat and weapons; mission routes and pickup locations will be added as verified.':'攻略整理中。先从攻防、兵器与探索入手，逐步补齐正式版主支线、首领招式和收集路线。';
  const directoryLabel=en?'Guide index':'攻略目录';
  const collapseLabel=en?'Collapse all':'全部收起';
  const menuId=key=>'pbz-menu-'+key;
  const links=pages.map(p=>{
   const key=p[0],href=base+key+'/',id=menuId(key),title=label(p);
   const childLink=child=>`<a href="${href+child[0]}/"${child===entry?' aria-current="page"':''}>${label(child)}</a>`;
   const children=key==='side-quests'?questGroups.map((group)=>{
    const quests=group.slice(3).map(id=>questEntries.get(id));
    return `<details${quests.includes(entry)?' open':''}><summary>${label(group)}</summary>${quests.map(childLink).join('')}</details>`;
   }).join(''):content[key].map(childLink).join('');
   return `<section class="classic-nav-group"><div class="classic-nav-group-heading"><h2><a href="${href}"${p===page&&!entry?' aria-current="page"':''}>${title}</a></h2><button class="classic-group-toggle" type="button" aria-expanded="true" aria-controls="${id}" aria-label="${en?'Collapse ':'收起'}${title}">−</button></div><div class="classic-nav-group-items" id="${id}">${children}</div></section>`;
  }).join('');
  const directory=`<details open><summary>${directoryLabel}</summary><nav class="classic-nav" aria-label="${directoryLabel}"><div class="classic-nav-home"><a href="${base}"${page?'':' aria-current="page"'}>${en?'Guide home':'专题首页'}</a><button class="classic-collapse-all" type="button" aria-expanded="true" aria-controls="${pages.map(([key])=>menuId(key)).join(' ')}">${collapseLabel}</button></div>${links}</nav></details>`;
  const clean=value=>value.replace(/&(?:amp;)?#(?:x20|32);/gi,' ');
  const areaText=value=>en?value:localizeQuest(value).replace(/(^|第\s*)(VI|IV|III|II|V|I)(?=\s*[·段])/g,(_,prefix,n)=>prefix.trim()+({I:'一',II:'二',III:'三',IV:'四',V:'五',VI:'六'}[n]));
  const renderStep=([zh,english,frames=[]])=>`<div class="pbz-step"><p>${clean(areaText(en?english:zh))}</p>${frames.map(([file,zhCaption,enCaption])=>{
    const caption=areaText(en?enCaption:zhCaption);
    return `<figure><img src="/assets/phantom-blade-zero/${file}.webp" alt="${caption}" width="960" height="540" loading="lazy" style="max-width:100%;height:auto"></figure>`;
  }).join('')}</div>`;
  const items=page?content[page[0]]:[];
  const chapter=page?.[0]==='walkthrough'?`<section class="pbz-info"><h2 class="classic-heading">${en?'Story chapters':'剧情章节'}</h2><p><a href="${base}walkthrough/against-the-flow/#against-the-flow">${en?'Against the Flow — Weeping Creek Valley':'逆流而上 · 悲泣溪谷'}</a></p><p>${en?'This chapter title is confirmed by the onscreen title card. Further chapter boundaries are being checked against the recordings.':'实录出现「逆流而上」章节题字。后续章节名称与起止位置正在逐段核对。'}</p></section>`:'';
  const indexGrid=(items,title)=>`<nav class="pbz-grid" aria-label="${title}">${items.map(item=>`<a id="${item[0]}" href="${base+category+item[0]}/">${label(item)} →</a>`).join('')}</nav>`;
  const timingIndex=page?.[0]==='walkthrough'&&!entry?`<section id="pickup-timing-index"><h2 class="classic-heading">${en?'Collection timing by area':'各区域收集时机'}</h2><ul class="pbz-timing-links">${items.filter(([id])=>pickupTiming[id]).map(item=>`<li><a href="${base}walkthrough/${item[0]}/#pickup-timing">${label(item)}</a></li>`).join('')}</ul></section>`:'';
  const index=page?.[0]==='side-quests'
   ?questGroups.map(group=>`<section id="quests-${group[0]}"><h2 class="classic-heading">${label(group)}</h2>${indexGrid(group.slice(3).map(id=>questEntries.get(id)),label(group))}</section>`).join('')
   :page?chapter+indexGrid(items,label(page))+timingIndex:'';
  const renderLuCheck=(index)=>{
   const [title,steps]=require('./lib/phantom-blade-zero-lu-checklist.cjs')[en?'en':'zh'][index];
   return '<section id="lu-checklist-'+index+'"><h2 class="classic-heading">'+title+'</h2><ol>'+steps.map(text=>'<li>'+text+'</li>').join('')+'</ol></section>';
  };
  const luMaterials=[
   ['圣母像山洞外围。','如果刚打完拙壁，先打开村口战场里的宝箱，拿 1 枚黑石碎片。','If you just defeated Zhuo Bi, open the arena chest at the village entrance for one Blackstone Shard.','https://www.18183.com/gonglue/202611/f8861g18.html'],
   ['三人偶水井。','下河往右，清掉宝箱前的敌人，再回去找哭泣的人交谈，拿 1 枚杀气琥珀碎片。','Go down to the river and turn right. Clear the enemies in front of the chest, then return to the crying person and talk to them for one Amber Shard.','https://www.gamersky.com/handbook/202610/2238132_2.shtml'],
   ['大廊桥。','到廊桥下层的神龛后清敌，调查树下的棺材，拿 1 枚黑石碎片。过桥后在岔路右转，进屋下梯，到外侧悬崖拿 1 枚杀气琥珀碎片。','Clear the enemies past the shrine on the lower level and inspect the coffin beneath the tree for one Blackstone Shard. After crossing the bridge, take the right fork, enter the house and go down the ladder to the outer cliff for one Amber Shard.'],
   ['飞贼密道。','在密道入口击败碧海大师残躯后，打开右侧紫色宝箱，拿 1 枚黑石碎片。','Defeat the remnant at the passage entrance and open the purple chest on the right for one Blackstone Shard.'],
   ['人偶试验场。','打开通往庞镇的通道后，进入尽头房间，调查桌上的紫光，拿 1 枚黑石碎片。','After opening the passage to Pang Town, enter the room at the end and inspect the purple glow on the table for one Blackstone Shard.']
  ];
  const renderLuMaterials=(id,step)=>{
   if(entry?.[0]!=='lu-village'||id!=='lu-village-route') return '';
   const material=luMaterials.find(([start])=>step.startsWith(start));
   if(!material) return '';
   const [,zh,english,reference]=material;
   const anchor=material===luMaterials[0]?' id="lu-material-locations"':'';
   const source=reference?` <a href="${reference}">${en?'Location reference':'位置参考'} ↗</a>`:'';
   return `<p${anchor}>${en?english:zh}${source}</p>`;
  };
  const luRouteHeadings=[
   ['圣母像山洞外围。','从村口出发，经山洞外围到湖岸','From the village entrance to the lakeside'],
   ['三人偶水井。','搜水井与大廊桥，再走飞贼密道','Search the well and covered bridge, then take the bandit passage'],
   ['梯田。','上梯田，先办小院和萤火之庙的支线','Climb the terraces and check the courtyard and temple quests'],
   ['人偶试验场。','穿过人偶试验场，到湖畔挑战沐小葵','Cross the testing ground and fight Mu Xiaokui'],
   ['飞贼藏宝地窖。','可选探索：飞贼藏宝地窖','Optional exploration: the bandit treasure cellar']
  ];
  const renderContent=([id,,,steps,source])=>steps.map(step=>{
   const luRoute=entry?.[0]==='lu-village'&&id==='lu-village-route';
   const heading=luRoute&&luRouteHeadings.find(([start])=>step[0].startsWith(start));
   const bossPosition=luRoute&&step[0].startsWith('湖畔。');
   const cellar=luRoute&&step[0].startsWith('飞贼藏宝地窖。');
   return (heading?`<h3>${heading[en?2:1]}</h3>`:'')+
    (bossPosition?renderLuCheck(0):'')+renderStep(step)+renderLuMaterials(id,step[0])+
    (bossPosition?renderLuCheck(1):'')+(cellar?renderAreaPickups(id):'');
  }).join('')+(source?'<p><a href="'+source+'">'+((source.startsWith('/')||source.startsWith('../'))?(en?'Open the area walkthrough':'查看区域图文流程'):(en?'Walkthrough reference':'攻略资料来源'))+' ↗</a></p>':'');
  const brief=page?.[0]==='walkthrough'&&entry?areaBriefs[entry[0]]:null;
  const counts=entry&&materialCounts[entry[0]];
  const areaPickups=entry?curated.filter(item=>item[5]===entry[0]):[];
  const summaryRow=(title,text)=>text?'<div class="pbz-summary-row"><dt>'+title+'</dt><dd>'+areaText(text)+'</dd></div>':'';
  const materialText=counts?(counts[0]===null?(en?'No separate count published':'未单列数量'):(en?'Blackstone Shards '+counts[0]+' · Amber Shards '+counts[1]:'黑石碎片 '+counts[0]+' 枚 · 杀气琥珀碎片 '+counts[1]+' 枚')):'';
  const lootText=entry&&areaLoot[entry[0]]?areaLoot[entry[0]].map(pair=>pair[en?1:0]).join(en?'; ':'；'):'';
  const overview=brief?'<section class="pbz-area-summary pbz-summary"><h2 class="classic-heading">'+(en?'Area highlights':'本区域要点')+'</h2><dl>'+
   summaryRow(en?'Goal':'推进目标',brief[0]?.[en?1:0])+
   summaryRow(en?'Bosses':'首领',brief[1]?.[en?1:0])+
   summaryRow(en?'Materials':'收集数量',materialText)+
   summaryRow(en?'Items':'可收集物品',lootText)+
   summaryRow(en?'Rewards':'战后奖励',brief[2]?.[en?1:0])+
   summaryRow(en?'Side content':'支线与探索',brief[3]?.[en?1:0])+'</dl><details class="pbz-summary-extra" open><summary>'+(en?'Items and services details':'道具与服务补充')+'</summary><p>'+areaText(brief[4]?.[en?1:0]||'')+'</p></details>'+
   '<footer class="pbz-summary-footer">'+(areaPickups.length?'<a href="#area-pickup-details">'+(en?'Item locations':'物品位置')+' →</a>':'')+
   (entry[0]==='lu-village'?'<a href="#lu-material-locations">'+(en?'Material locations':'黑石与琥珀位置')+' →</a>':'')+'</footer>'+
   (counts?.[2]?'<p class="pbz-summary-note">'+(en?(entry[0]==='lu-village'?'One amber shard is on an adjoining route.':counts[0]===null?'The Snow Mountain extension has no separate material count.':'Combined count for Pang Town and Dreamplay Manor.'):counts[2])+'</p>':'')+'</section>':'';
  const firstPickupSection=entry?.[5]?.find(section=>areaPickups.some(item=>item[6]===section[0]))?.[0];
  const renderAreaPickups=section=>{
   const pickups=areaPickups.filter(item=>item[6]===section);
   return pickups.length?`<ul${section===firstPickupSection?' id="area-pickup-details"':''}>${pickups.map(item=>`<li><strong>${areaText(label(item))}</strong> · ${areaText(item[en?4:3])}</li>`).join('')}</ul>`:'';
  };
  const renderBossLinks=section=>{
   const bosses=opening.bosses.filter(([id])=>bossSections[id]===section);
   return bosses.length?`<nav class="pbz-grid" aria-label="${en?'Boss guides':'首领打法'}">${bosses.map(boss=>`<a href="${base}bosses/${boss[0]}/">${areaText(label(boss))} →</a>`).join('')}</nav>`:'';
  };
  const bossSection=page?.[0]==='bosses'&&entry?bossSections[entry[0]]:null;
  const areaLink=bossSection?`<p><a href="${base}walkthrough/${movedAreas.get(bossSection)||bossSection}/#${bossSection}">${en?'Open the area walkthrough':'查看区域图文流程'} ↗</a></p>`:'';
  const rewardEquipment={
   danghui:'puppeteers-bell',mengcha:'puppeteers-bell','holy-mother':'ladys-fan','zuo-shang':'aureate',
   'hua-qianxiao':'fanatics-broken-blade','gu-wanyue':'fanatics-broken-blade','yan-qiansui':'fanatics-broken-blade',
   'wu-xuan':'wolfjaw','lei-dang':'tiger-cannon','four-snake-houses':'white-serpent-crimson-viper'
  };
  const reward=['bosses','side-quests'].includes(page?.[0])&&entry?content.equipment.find(([id])=>id===rewardEquipment[entry[0]]):null;
  const rewardLink=reward?`<p><a href="${base}equipment/${reward[0]}/">${label(reward)} →</a></p>`:'';
  const memoryLink=page?.[0]==='bosses'&&['lei-dang','heartpiercer'].includes(entry?.[0])
   ?`<p><a href="${base}collectibles/leng-tu-memories/">${en?'All six Leng Tu memories':'查看冷茶的六段记忆'} →</a></p>`
   :'';
  const tigerCannonLink=page?.[0]==='equipment'&&entry?.[0]==='wolfjaw'
   ?`<p><a href="${base}equipment/tiger-cannon/">${en?'Tiger Cannon acquisition and wall breaking':'查看虎炮的获取与破墙方法'} →</a></p>`
   :page?.[0]==='equipment'&&entry?.[0]==='tiger-cannon'
    ?`<p><a href="${base}bosses/lei-dang/">${en?'Lei Dang boss guide':'查看独臂虎两阶段打法'} →</a></p>`
    :'';
  const linkedQuest=page?.[0]==='side-quests'&&entry
   ?content['side-quests'].find(([id])=>id===({'illusory-pipa':'allure-of-vanity','allure-of-vanity':'illusory-pipa'})[entry[0]])
   :null;
  const questLink=linkedQuest?`<p><a href="${base}side-quests/${linkedQuest[0]}/">${label(linkedQuest)} →</a></p>`:'';
  const questBosses={'allure-of-vanity':['yan-qiansui'],'sha-chi-powered-boat':['wu-xuan','gu-wanyue'],'four-snake-houses':['heartpiercer']};
  const questBossLinks=page?.[0]==='side-quests'&&entry
   ?(questBosses[entry[0]]||[]).map(id=>{
    const boss=opening.bosses.find(([bossId])=>bossId===id);
    return `<p><a href="${base}bosses/${id}/">${label(boss)} →</a></p>`;
   }).join('')
   :'';
  const renderPickupLinks=section=>{
   const pickups=curated.filter(([, , , , ,area,id])=>area===entry[0]&&id===section);
   const areaQuests={
    'pang-town-route':['sha-chi-powered-boat','star-performer','remnant-spark-cube','mothers-heart','sword-and-way','brother-once-more','kin-against-kin','dont-forget-me','undying-heroic-spirit','xue-admirer','dahuang','quick-hand-treasures','heart-of-the-banyan'],
    'water-gang-route':['sha-chi-powered-boat','allure-of-vanity','illusory-pipa','remnant-spark-cube','brother-once-more','kin-against-kin','quick-hand-treasures','heart-of-the-banyan'],
    'cage-late-fight':['dont-forget-me','broad-saber','heros-lament','cui-rescue','heart-of-the-banyan'],
    'lu-village-route':['illusory-pipa','cui-rescue','dahuang','quick-hand-treasures','quick-hand-hideouts','leave-none-alive'],
    'orthodox-camp-route':['illusory-pipa','undying-heroic-spirit','xue-admirer','heart-of-the-banyan'],
    'forest-tower-revisit':['use-it-against-them','heart-of-the-fist','heart-of-the-banyan'],
    'bandit-camp':['quick-hand-treasures','quick-hand-hideouts'], 'manor-memories':['quick-hand-treasures'], 'soulbreak-pair':['cui-rescue']
   }[section]||[];
   pickups.push(...content['side-quests'].filter(([id])=>areaQuests.includes(id)));
   return pickups.length?`<nav class="pbz-grid" aria-label="${en?'Related quests and collectibles':'相关支线与收集'}">${pickups.map(item=>{
    const group=questIds.has(item[0])||areaQuests.includes(item[0])?'side-quests':'collectibles';
    return `<a href="${base}${group}/${item[0]}/">${label(item)} →</a>`;
   }).join('')}</nav>`:'';
  };
  const cutoffLink=page?.[0]==='walkthrough'&&entry?`<p><a href="${base}side-quests/missable-quests/">${en?'Check missable quests before advancing':'推进前查看支线错过条件'} →</a></p>`:'';
  const timing=page?.[0]==='walkthrough'&&entry&&pickupTiming[entry[0]];
  const renderTiming=timing?`<section id="pickup-timing" class="pbz-area-summary"><h2 class="classic-heading">${en?'Collection timing':'收集时机'}</h2><dl>${[
   ['first','首次可收集','First visit'],
   ['miss','容易错过 · 推进前检查','Missable steps and checkpoints'],
   ['ability','拿到新能力或道具后回访','Return with an ability or item'],
   ['story','剧情推进后回访','Return after story progress']
  ].filter(([key])=>timing[key]?.length).map(([key,zh,english])=>`<dt>${en?english:zh}</dt><dd><ul>${timing[key].map(([textZh,textEn,route])=>`<li>${areaText(en?textEn:textZh)} <a href="${route.startsWith('#')?route:base+route}">${en?'Route':'查看路线'} →</a></li>`).join('')}</ul></dd>`).join('')}</dl></section>`:'';
  const checkpoints={
   'cage-late-fight':['交还账簿前，留意会影响白雪支线的对话选项。','The dialogue choice when returning the ledger determines whether Bai Xue’s tale opens.'],
   'hanging-cage':['挑战荆野前，把三种药草带回悲泣溪谷据点交给玉儿。击败荆野后，未完成的采药支线会失败。','Return all three herbs to Yu’er at the valley outpost before defeating Jing Ye. An unfinished Apprentice Healer tale fails after the fight.'],
   'mirror-deep':['挑战白赤练前，先回悲泣溪谷领取坚岩护腕和浑源静脉仪，再完成据点与飞贼营地的限时支线，并在大桥找兰兰接白山派支线。','Before Bai Chilian, return to the valley for the two timed accessories, finish the outpost and camp tales and accept the Baishan quest from Lanlan.'],
   'lu-village-route':['从村口一路走到湖畔。离开陆家村前要做两次检查：开打沐小葵前处理限时委托，打完后先拿码头和树下宝箱的物品，再回村找兰大少和老根头复命。','Head from the village entrance to the lakeshore. Finish the timed quest steps before fighting Mu Xiaokui, collect the dock and tree-side loot afterward, then return to report to Lan and the old man.'],
   'orthodox-camp-route':['白山派支线需先击败乌冷霜并调查花丛遗体，再挑战玉璧。首次遇见红衣女子时，击败她会使其支线失败。','For the Baishan tale, defeat Wu Lengshuang and inspect the body among the flowers before Yubi. Defeating Red on your first encounter fails her tale.'],
   'pang-town-route':['进入戏梦山庄前，建议先核对湖心秘密及其前置任务。到断魂山最终冰洞前，再核对湖心仪式后的虚空对话与五处龙柱挑战。','Before entering Mirage Estate, check Secrets at the Heart of the Lake and its prerequisites. Before the final ice cave on Mount Soulrend, verify the post-ritual Inanis conversation and all five pillar trials.','ending-checkpoints'],
   'soulbreak-finale':['进入断魂山终局冰洞前，确认五处龙柱挑战完成，并在湖心仪式后与虚空交谈、领取 Violet Blossom。','Before entering the final ice cave on Mount Soulrend, confirm all five pillar trials are complete and you received Violet Blossom from Inanis after the lake ritual.','ending-checkpoints']
  };
  const renderCheckpoint=id=>{
   const checkpoint=checkpoints[id];
   const mindsealSections=['tower-to-waterfall','pang-tower','forest-tower-revisit'];
   if(mindsealSections.includes(id))return `<p><a href="${base}side-quests/severed-mindseal/">${en?'Tower stones and return visits':'查看杀气塔原石与回访路线'} →</a></p>`;
   if(!checkpoint)return '';
   const [zh,english,target='missable-quests']=checkpoint;
   const relatedGuides={
    'pang-town-route':[
     ['heart-of-the-lake','湖心秘密完整路线','Secrets at the Heart of the Lake route'],
     ['illusory-pipa','幻术琵琶的零件与修复','Illusory Pipa parts and repair']
    ],
    'soulbreak-finale':[
     ['bloodline-awakening','五处龙柱挑战','Five pillar challenges'],
     ['heart-of-the-lake','湖心仪式与虚空对话','Lake ritual and the Inanis conversation']
    ],
    'hanging-cage':[['apprentice-healer','玉儿采药路线','Apprentice Healer route']],
    'mirror-deep':[
     ['../walkthrough/against-the-flow/#against-the-flow','坚岩护腕领取路线','Bracer pickup route'],
     ['../walkthrough/against-the-flow/#tower-to-waterfall','浑源静脉仪领取路线','Timing accessory pickup route'],
     ['healers-mercy','四名飞贼的救治路线','Route to the four wounded thieves'],
     ['baishan-secrets','白山派支线接取路线','Baishan tale and where to accept it'],
     ['purge-the-sect','羽弓交付路线','Feather Bow hand-in'],
     ['festering-secret','队长命令与据点回报','Captain’s orders and outpost return'],
     ['four-fierce-axes','四斧文书的七处位置','All seven Four Fierce Axes books'],
     ['honor-among-thieves','飞贼营地三道问答','Three questions at Thieves’ Camp']
    ],
    'orthodox-camp-route':[
     ['baishan-secrets','白山派支线调查顺序','Baishan investigation order'],
     ['daughter-of-dark-sect','红衣女子支线路线','Red’s quest route']
    ],
    'cage-late-fight':[['bai-xue','白雪支线与后街钥匙','Bai Xue and the courtyard key']],
    'lu-village-route':[
     ['journey-home','老人的归家委托','The Journey Home'],
     ['young-master-lan','开路回报与宅邸钥匙','Young Master Lan'],
     ['young-mistress','五处头巾的位置','Five headband locations'],
     ['puppet-wooden-heart','人偶木心送信路线','A Puppet’s Wooden Heart route']
    ]
   };
   const routeLink=(relatedGuides[id]||[]).map(guide=>` <a href="${base}side-quests/${guide[0]}/">${label(guide)} →</a>`).join('');
   return `<aside class="pbz-info"><p>${areaText(en?english:zh)}</p><p><a href="${base}side-quests/${target}/">${en?'View quest requirements':'查看任务条件'} →</a>${routeLink}</p></aside>`;
  };

  const detail=entry?overview+renderTiming+cutoffLink+(entry[5]?entry[5].map(section=>`<section id="${section[0]}"><h2 class="classic-heading">${label(section)}</h2>${renderCheckpoint(section[0])}${renderBossLinks(section[0])}${renderContent(section)}${section[0]==='lu-village-route'?'':renderAreaPickups(section[0])}${renderPickupLinks(section[0])}</section>`).join(''):areaLink+renderContent(entry[4]?.startsWith('../../walkthrough/')?[...entry.slice(0,4),null]:entry)+rewardLink+memoryLink+questBossLinks+questLink+tigerCannonLink):'';
  const position=items.indexOf(entry);
  const adjacent=entry?`<nav class="pbz-grid" aria-label="${en?'Adjacent entries':'相邻条目'}">${[items[position-1],items[position+1]].map((item,i)=>item?`<a href="${base+category+item[0]}/">${i===0?'← ':''}${label(item)}${i===1?' →':''}</a>`:'').join('')}</nav>`:'';
  const facts=en?[['Developer','S-Game'],['Genre','Wuxia action'],['Platforms','PS5 / PC'],['Release','29 October 2026']]:[['开发商','灵游坊（S-Game）'],['类型','武侠动作'],['平台','PS5 / PC'],['发售日期','2026 年 10 月 29 日']];
  const intro=en?'With sixty-six days left to live, Soul fights his way through a dark martial arts world to uncover the conspiracy pursuing him. Combat combines close-range weapon swaps with parries and dodge counters.':'只剩六十六天可活的「魂」，在杀机四伏的江湖中追查幕后阴谋。战斗以近身交锋为主，可在两把主武器之间切换，衔接招架和闪避反击。';
  const body=page?`<section><h2 class="classic-heading">${en?'Field notes':'攻略笔记'}</h2><p>${lead}</p>${page[5]?`<p><a href="${page[5]}">${en?'Source and demonstration':'资料与演示'} ↗</a></p>`:''}</section>`:`<div class="pbz-landscape"><img class="pbz-cover" src="/assets/catalog/phantom-blade-zero.jpg" alt="${title}" width="460" height="215"></div><section class="pbz-info" aria-labelledby="game-info"><h2 id="game-info" class="classic-heading">${en?'Game overview':'游戏信息'}</h2><p>${intro}</p><dl class="pbz-facts">${facts.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl><p><a href="${en?'/en':''}/catalog/${slug}/" target="_blank" rel="noopener">${en?'Game profile':'查看游戏图鉴'} ↗</a> · <a href="https://store.steampowered.com/app/4115450/" target="_blank" rel="noopener">${en?'Steam Store':'Steam 商店'} ↗</a> · <a href="${official}" target="_blank" rel="noopener">${en?'Official site':'游戏官网'} ↗</a></p></section><h2 class="classic-heading">${en?'Guide sections':'攻略入口'}</h2><p>${lead}</p><div class="pbz-grid">${pages.map(p=>`<a href="${base+p[0]}/">${label(p)} →</a>`).join('')}</div>`;
  const language=`<details class="language-menu"><summary aria-label="${en?'Choose language':'选择语言'}"><span aria-hidden="true">◎</span> ${en?'English':'简体中文'} <span class="language-chevron" aria-hidden="true"></span></summary><div class="language-menu-options"><a href="${en?alt:url}" lang="zh-CN" hreflang="zh-CN"${en?'':' aria-current="page"'}>简体中文</a><a href="${en?url:alt}" lang="en" hreflang="en"${en?' aria-current="page"':''}>English</a></div></details>`;
  const regional=!entry&&page?.[0]==='walkthrough'?`<details class="pbz-info"><summary>${en?'Recording index by region':'参考资料：按区域查看实录分集'}</summary><p>${en?'A: 67-part run by 友利奈绪大魔王. B: high-difficulty series by 11的游戏世界 (55 files). Episode references below come from the recording titles; verified gameplay notes are listed separately.':'实录一为友利奈绪大魔王的 67 集实录，实录二为 11的游戏世界的最高难度系列（55 个文件）。下方分集索引依据视频标题整理，已核对画面的路线见正文。'}</p><nav class="pbz-grid" aria-label="${en?'Regions':'区域目录'}">${regions.map(([id,zh,eng])=>'<a href="#region-'+id+'">'+(en?eng:zh)+'</a>').join('')}</nav>${regions.map(([id,zh,eng,z,e,a,b])=>'<section id="region-'+id+'"><h3>'+(en?eng:zh)+'</h3><p>'+(en?e:localizeQuest(z))+'</p><p>'+(en?'A: P'+a+(b?' · B: P'+b:''):'实录一：第 '+a+' 集'+(b?' · 实录二：第 '+b+' 集':''))+'</p></section>').join('')}</details>`:'';
  const html=`<!doctype html><html lang="${en?'en':'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${heading} | GAME NOTE</title><meta name="description" content="${lead}"><link rel="canonical" href="https://gamenote.cc${url}"><link rel="alternate" hreflang="${en?'zh-CN':'en'}" href="https://gamenote.cc${alt}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/classic.css"><link rel="stylesheet" href="/assets/classic-menu.css"><link rel="stylesheet" href="/assets/classic-language.css"><link rel="stylesheet" href="/assets/phantom-blade-zero.css"><script src="/assets/classic.js" defer></script></head><body class="classic pbz${page?'':' pbz-home'}" data-theme="classic"><div class="classic-shell"><aside class="classic-sidebar"><a class="classic-brand" href="${en?'/en/':'/'}">GAME NOTE CLASSIC</a>${directory}</aside><main class="classic-main" id="main"><header><nav class="classic-language-switch" aria-label="${en?'Language':'语言'}">${language}</nav><p class="pbz-seal">${en?'WULIN ARCHIVE':'武林卷宗'}</p>${entry?`<p><a href="${base+category}">← ${label(page)}</a></p>`:''}<h1>${heading}</h1></header><article data-pagefind-body>${entry?detail+adjacent:body+index+regional}</article></main></div></body></html>\n`;
  fs.mkdirSync('.'+url,{recursive:true});write('.'+url+'index.html',html);
 }
 for(const [id,area] of movedAreas){
  const path=base+'walkthrough/'+id+'/';
  const target=base+'walkthrough/'+area+'/#'+id;
  fs.mkdirSync('.'+path,{recursive:true});
  write('.'+path+'index.html',`<!doctype html><html lang="${en?'en':'zh-CN'}"><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><title>${label(areaEntries.get(id))}</title><a href="${target}">${en?'Open the area guide':'打开区域攻略'}</a></html>\n`);
 }
}

