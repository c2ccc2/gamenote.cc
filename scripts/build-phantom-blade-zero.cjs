const fs=require('node:fs');
const write=require('./lib/write-file.cjs');
const opening=require('./lib/phantom-blade-zero-opening.cjs');
const regions=require('./lib/phantom-blade-zero-regions.cjs');
const areaBriefs=require('./lib/phantom-blade-zero-area-briefs.cjs');
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
 'zuo-shang':'zuo-shang'
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
 ['walkthrough','主线流程','Main walkthrough','下方已整理山谷至煞气塔的首段路线。探索时先与沿途人物交谈，再记下未开的岔路；官方确认部分支线会开启新的故事路径。当前尚未确认具体任务的错过条件。','The first route from the valley to the tower is covered below. Talk to characters along the way and note unopened branches. The developer confirms some side quests open new story paths; individual missable conditions are pending.',systems],
 ['side-quests','支线任务','Side quests','按任务查找所需道具、交付位置和后续步骤。','Find quest items, hand-in locations and follow-up steps.',null],
 ['bosses','首领图鉴','Boss archive','查看已整理的首领进场路线、招式应对与战后去向。','Find arena routes, attack responses and what to do after each fight.',combat],
 ['equipment','兵器与配装','Weapons & builds','先给两把主武器安排不同用途：一把练习短连段，一把用于切换后接续攻势。副武器有使用限制，留给明确的输出或控场机会。Scarlet Wraithblade 的连段可生成减速敌人的花。','Give the two main weapons distinct roles: practise short strings with one and continue pressure after swapping to the other. Save limited-use Phantom Edges for deliberate openings. Scarlet Wraithblade combos can create flowers that slow enemies.',combat],
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
  'side-quests':[...require('./lib/phantom-blade-zero-missables.cjs'),...entries.filter(([id])=>questIds.has(id))],
  collectibles:[...entries,...opening.collectibles],
  equipment:[...opening.equipment,...entries.filter(([id])=>weaponIds.has(id))]
 };
 const label=p=>p[en?2:1];
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
   const children=content[key].map(child=>`<a href="${href+child[0]}/"${child===entry?' aria-current="page"':''}>${label(child)}</a>`).join('');
   return `<section class="classic-nav-group"><div class="classic-nav-group-heading"><h2><a href="${href}"${p===page&&!entry?' aria-current="page"':''}>${title}</a></h2><button class="classic-group-toggle" type="button" aria-expanded="true" aria-controls="${id}" aria-label="${en?'Collapse ':'收起'}${title}">−</button></div><div class="classic-nav-group-items" id="${id}">${children}</div></section>`;
  }).join('');
  const directory=`<details open><summary>${directoryLabel}</summary><nav class="classic-nav" aria-label="${directoryLabel}"><div class="classic-nav-home"><a href="${base}"${page?'':' aria-current="page"'}>${en?'Guide home':'专题首页'}</a><button class="classic-collapse-all" type="button" aria-expanded="true" aria-controls="${pages.map(([key])=>menuId(key)).join(' ')}">${collapseLabel}</button></div>${links}</nav></details>`;
  const clean=value=>value.replace(/&(?:amp;)?#(?:x20|32);/gi,' ');
  const renderStep=([zh,english,frames=[]])=>`<div class="pbz-step"><p>${clean(en?english:zh)}</p>${frames.map(([file,zhCaption,enCaption])=>{
    const caption=en?enCaption:zhCaption;
    return `<figure><img src="/assets/phantom-blade-zero/${file}.webp" alt="${caption}" width="960" height="540" loading="lazy" style="max-width:100%;height:auto"></figure>`;
  }).join('')}</div>`;
  const items=page?content[page[0]]:[];
  const chapter=page?.[0]==='walkthrough'?`<section class="pbz-info"><h2 class="classic-heading">${en?'Story chapters':'剧情章节'}</h2><p><a href="${base}walkthrough/against-the-flow/#against-the-flow">${en?'Against the Flow — Weeping Creek Valley':'逆流而上 · 悲泣溪谷'}</a></p><p>${en?'This chapter title is confirmed by the onscreen title card. Further chapter boundaries are being checked against the recordings.':'实录出现「逆流而上」章节题字。后续章节名称与起止位置正在逐段核对。'}</p></section>`:'';
  const index=page?chapter+`<nav class="pbz-grid" aria-label="${label(page)}">${items.map(item=>`<a id="${item[0]}" href="${base+category+item[0]}/">${label(item)} →</a>`).join('')}</nav>`:'';
  const renderContent=([,,,steps,source])=>steps.map(renderStep).join('')+(source?`<p><a href="${source}">${(source.startsWith('/')||source.startsWith('../'))?(en?'Open the area walkthrough':'查看区域图文流程'):(en?'Walkthrough reference':'攻略资料来源')} ↗</a></p>`:'');
  const brief=page?.[0]==='walkthrough'&&entry?areaBriefs[entry[0]]:null;
  const briefLabels=en?['Progression goal','Bosses','Drops','Side quests and clues','Items and services']:['推进目标','首领','掉落物品','支线与线索','道具与服务'];
  const overview=brief?`<section class="pbz-info"><h2 class="classic-heading">${en?'Area at a glance':'区域攻略速览'}</h2><dl class="pbz-facts">${briefLabels.map((title,i)=>`<div><dt>${title}</dt><dd>${brief[i]?.[en?1:0]??(en?'Pending verification':'待核对')}</dd></div>`).join('')}</dl></section>`:'';
  const renderBossLinks=section=>{
   const bosses=opening.bosses.filter(([id])=>bossSections[id]===section);
   return bosses.length?`<nav class="pbz-grid" aria-label="${en?'Boss guides':'首领打法'}">${bosses.map(boss=>`<a href="${base}bosses/${boss[0]}/">${label(boss)} →</a>`).join('')}</nav>`:'';
  };
  const bossSection=page?.[0]==='bosses'&&entry?bossSections[entry[0]]:null;
  const areaLink=bossSection?`<p><a href="${base}walkthrough/${movedAreas.get(bossSection)||bossSection}/#${bossSection}">${en?'Open the area walkthrough':'查看区域图文流程'} ↗</a></p>`:'';
  const rewardEquipment={
   danghui:'puppeteers-bell',mengcha:'puppeteers-bell','holy-mother':'ladys-fan','zuo-shang':'aureate',
   'hua-qianxiao':'fanatics-broken-blade','gu-wanyue':'fanatics-broken-blade','yan-qiansui':'fanatics-broken-blade'
  };
  const reward=page?.[0]==='bosses'&&entry?content.equipment.find(([id])=>id===rewardEquipment[entry[0]]):null;
  const rewardLink=reward?`<p><a href="${base}equipment/${reward[0]}/">${label(reward)} →</a></p>`:'';
  const linkedQuest=page?.[0]==='side-quests'&&entry
   ?content['side-quests'].find(([id])=>id===({'illusory-pipa':'allure-of-vanity','allure-of-vanity':'illusory-pipa'})[entry[0]])
   :null;
  const questLink=linkedQuest?`<p><a href="${base}side-quests/${linkedQuest[0]}/">${label(linkedQuest)} →</a></p>`:'';
  const questBosses={'allure-of-vanity':['yan-qiansui'],'sha-chi-powered-boat':['wu-xuan','gu-wanyue']};
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
  const checkpoints={
   'cage-late-fight':['交还账簿前，留意会影响白雪支线的对话选项。','The dialogue choice when returning the ledger determines whether Bai Xue’s tale opens.'],
   'hanging-cage':['挑战荆野前，把三种药草带回悲泣溪谷据点交给玉儿。击败荆野后，未完成的采药支线会失败。','Return all three herbs to Yu’er at the valley outpost before defeating Jing Ye. An unfinished Apprentice Healer tale fails after the fight.'],
   'mirror-deep':['挑战白赤练前，先完成据点和飞贼营地的限时支线，并在大桥找兰兰接取白山派支线。','Before Bai Chilian, finish the timed outpost and camp tales and accept Secrets of the Baishan Sect from Lanlan on the bridge.'],
   'lu-village-route':['进庞镇前，先回报 The Journey Home 的开路委托，并完成 Young Master Lan 开路后的对话。','Before entering Pangzhen, report back for The Journey Home and speak to Young Master Lan after opening his route.'],
   'orthodox-camp-route':['白山派支线需先击败乌冷霜并调查花丛遗体，再挑战玉璧。首次遇见红衣女子时，击败她会使其支线失败。','For the Baishan tale, defeat Wu Lengshuang and inspect the body among the flowers before Yubi. Defeating Red on your first encounter fails her tale.'],
   'pang-town-route':['通过青蛇屋蛇门进入戏梦山庄前，核对真结局所需的十项紫标任务。','Before entering Mirage Estate through the Green Serpent House, check the ten purple quests for the true ending.','ending-checkpoints'],
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
   return `<aside class="pbz-info"><p>${en?english:zh}</p><p><a href="${base}side-quests/${target}/">${en?'View quest requirements':'查看任务条件'} →</a>${routeLink}</p></aside>`;
  };
  const detail=entry?overview+cutoffLink+(entry[5]?entry[5].map(section=>`<section id="${section[0]}"><h2 class="classic-heading">${label(section)}</h2>${renderCheckpoint(section[0])}${renderBossLinks(section[0])}${renderContent(section)}${renderPickupLinks(section[0])}</section>`).join(''):areaLink+renderContent(entry[4]?.startsWith('../../walkthrough/')?[...entry.slice(0,4),null]:entry)+rewardLink+questBossLinks+questLink):'';
  const position=items.indexOf(entry);
  const adjacent=entry?`<nav class="pbz-grid" aria-label="${en?'Adjacent entries':'相邻条目'}">${[items[position-1],items[position+1]].map((item,i)=>item?`<a href="${base+category+item[0]}/">${i===0?'← ':''}${label(item)}${i===1?' →':''}</a>`:'').join('')}</nav>`:'';
  const facts=en?[['Developer','S-Game'],['Genre','Wuxia action'],['Platforms','PS5 / PC'],['Release','29 October 2026']]:[['开发商','灵游坊（S-Game）'],['类型','武侠动作'],['平台','PS5 / PC'],['发售日期','2026 年 10 月 29 日']];
  const intro=en?'With sixty-six days left to live, Soul fights his way through a dark martial arts world to uncover the conspiracy pursuing him. Combat combines close-range weapon swaps with parries and dodge counters.':'只剩六十六天可活的「魂」，在杀机四伏的江湖中追查幕后阴谋。战斗以近身交锋为主，可在两把主武器之间切换，衔接招架和闪避反击。';
  const body=page?`<section><h2 class="classic-heading">${en?'Field notes':'攻略笔记'}</h2><p>${lead}</p>${page[5]?`<p><a href="${page[5]}">${en?'Source and demonstration':'资料与演示'} ↗</a></p>`:''}</section>`:`<div class="pbz-landscape"><img class="pbz-cover" src="/assets/catalog/phantom-blade-zero.jpg" alt="${title}" width="460" height="215"></div><section class="pbz-info" aria-labelledby="game-info"><h2 id="game-info" class="classic-heading">${en?'Game overview':'游戏信息'}</h2><p>${intro}</p><dl class="pbz-facts">${facts.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl><p><a href="${en?'/en':''}/catalog/${slug}/" target="_blank" rel="noopener">${en?'Game profile':'查看游戏图鉴'} ↗</a> · <a href="https://store.steampowered.com/app/4115450/" target="_blank" rel="noopener">${en?'Steam Store':'Steam 商店'} ↗</a> · <a href="${official}" target="_blank" rel="noopener">${en?'Official site':'游戏官网'} ↗</a></p></section><h2 class="classic-heading">${en?'Guide sections':'攻略入口'}</h2><p>${lead}</p><div class="pbz-grid">${pages.map(p=>`<a href="${base+p[0]}/">${label(p)} →</a>`).join('')}</div>`;
  const language=`<details class="language-menu"><summary aria-label="${en?'Choose language':'选择语言'}"><span aria-hidden="true">◎</span> ${en?'English':'简体中文'} <span class="language-chevron" aria-hidden="true"></span></summary><div class="language-menu-options"><a href="${en?alt:url}" lang="zh-CN" hreflang="zh-CN"${en?'':' aria-current="page"'}>简体中文</a><a href="${en?url:alt}" lang="en" hreflang="en"${en?' aria-current="page"':''}>English</a></div></details>`;
  const regional=!entry&&page?.[0]==='walkthrough'?`<details class="pbz-info"><summary>${en?'Recording index by region':'参考资料：按区域查看实录分集'}</summary><p>${en?'A: 67-part run by 友利奈绪大魔王. B: high-difficulty series by 11的游戏世界 (55 files). Episode references below come from the recording titles; verified gameplay notes are listed separately.':'A 为友利奈绪大魔王的 67 集实录，B 为 11的游戏世界的最高难度系列（55 个文件）。下方分集索引依据视频标题整理，已核对画面的路线见正文。'}</p><nav class="pbz-grid" aria-label="${en?'Regions':'区域目录'}">${regions.map(([id,zh,eng])=>'<a href="#region-'+id+'">'+(en?eng:zh)+'</a>').join('')}</nav>${regions.map(([id,zh,eng,z,e,a,b])=>'<section id="region-'+id+'"><h3>'+(en?eng:zh)+'</h3><p>'+(en?e:z)+'</p><p>A: P'+a+(b?' · B: P'+b:'')+'</p></section>').join('')}</details>`:'';
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

