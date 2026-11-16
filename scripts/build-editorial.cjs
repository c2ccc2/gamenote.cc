// Final public-page pass: reader copy, provenance, article metadata and a fresh sitemap.
const writeFile = require('./lib/write-file.cjs');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cheerio=require('cheerio');
const {loadClassicData,confirmed}=require('./lib/classic-data.cjs');
const root=path.resolve(__dirname,'..'),origin='https://gamenote.cc',base='/games/an-jing-wei-guang/',today='2026-09-27';
const data=loadClassicData(root),summaries=require('../content/games/an-jing-wei-guang/region-summaries.json');
const spiritLocations=require('../content/games/an-jing-wei-guang/spirits-by-area.json');
const bossFollowUps=[
 ["the-groundskeeper","园丁","从战场右侧进入猎人小屋，找拾荒者解锁焰瓶，再往深处拿弹弓。","Leave the arena to the right for Hunter’s Cabin. Speak to Looter for the Flaming Vessel, then continue deeper for Slingshot.","walkthrough/hunters-cabin/"],
 ["the-swarm","虫群","战场右侧下落，在下层鸟巢学攀爬。","Drop to the right of the arena and learn Climb at the lower nest.","abilities/climb/"],
 ["the-lady-of-the-drains","排水道女士","继续到后续房间拿金色羽毛。帐篷入口出现红色感叹号时，进去找 Willow 领首枚工坊代币。","Continue to the next room for the Golden Feather. When a red exclamation mark appears at a tent, speak to Willow inside for the first Workshop Token.","achievements/in-the-workshop/"],
 ["lida-the-terrible","莉达","往左进相邻房间，和艾格伯特交谈完成救援。再从他身后的地板下落，可前往午夜暴雨。","Go to the next room on the left and speak to Egbert to complete the rescue. Drop through the floor beyond him to reach Midnight Drench.","quests/graven-valley-rescue/"],
 ["shrine-of-the-seven-sons","七子神龛","向左拾取金色羽毛，再开通往干涸城堡的捷径。","Go left for the Golden Feather, then open the shortcut to Desiccated Castle.","walkthrough/midnight-drench/"],
 ["starsinger","星歌者","向右进相邻房间拾取金色羽毛。","Pick up the Golden Feather in the next room to the right.","collectibles/golden-feathers/"],
 ["forest-king","森林之王","向右进羽毛房和伊尔达交谈，顺手查她右侧暗道里的书页。","Go right to the feather room, speak to Ilda and check the hidden passage to the right for a story page.","walkthrough/autumn-forest/"],
 ["creature-from-the-deep","深海生物","继续到篝火，听完船员与 Barge 的对话后解锁水上载具。","Continue to the campfire and finish the conversation with Barge to unlock water vessels.","abilities/water-vessel/"],
 ["the-colony","The Colony","完成双胞胎救援与团聚，回码头船坞找 Barge 学无限攀爬。","Finish the twins’ rescue and reunion, then return to Barge at the Docks shipyard for Endless Climb.","abilities/endless-climb/"],
 ["dollmaker","玩偶师之镜","向西救出玛格达，再进能力巢穴学墙壁弹射。","Go west to rescue Magda, then enter the ability nest to learn Wall Sling.","abilities/wall-sling/"],
 ["gravedigger","掘墓者","继续往左送 Irma 去生日聚会，完成剧情再领金色羽毛。","Continue left with Irma to the birthday party and finish the scene to receive the Golden Feather.","quests/a-ride-to-the-party/"],
 ["silver-doll","银色玩偶","继续向右，敲牢笼旁的拉杆救出一对兄弟姐妹。再按救援任务核对另外两处牢笼。","Keep going right and strike the lever beside the cage to free one sibling pair. Use the rescue guide to check the other two cages.","quests/the-queens-chamber/"],
 ["the-queen","女王","与现场角色交谈完成庆祝剧情。回战场上方找拾荒者，敲天花板拉杆进寝室，拿桌上的女王金币。","Speak to everyone present to finish the celebration. Return above the arena, speak to Looter and strike the ceiling lever. Pick up the Queen’s Coin from the table inside.","collectibles/key-items/the-queens-coin/"],
];
const questOverview=[
 ["repair-the-elevator","修理升降机","排水道中央帐篷旁的故障升降机。","学会乘风并收齐三件部件后，下行挑战排水道女士。","Broken lift beside the central Drains tent.","Learn Wind Ride and collect three parts to reach the Lady of the Drains."],
 ["graven-valley-rescue","墓谷救援","墓谷帐篷下方的会场入口。","拿门票、击败莉达并救出艾格伯特，接续午夜暴雨。","Ceremony entrance below the Graven Valley tent.","Get the ticket, defeat Lida and rescue Egbert to continue into Midnight Drench."],
 ["missing-sailors","失踪的船员","码头三块门石后的战场。","先解锁载具，再进深海救双胞胎，返回船坞拿无限攀爬。","Arena beyond the three Docks gate stones.","Unlock vessels, rescue the twins in the Deep and return to the shipyard for Endless Climb."],
 ["a-ride-to-the-party","护送 Irma 去聚会","埋葬墓穴入口往左找 Irma。","击败掘墓者后继续往左赴宴，领取金色羽毛。","Head left from the Burial Vault entrance to find Irma.","Defeat the Gravedigger and continue left to the party for a Golden Feather."],
 ["the-castle-gate","女王城堡入口","沼泽北侧的大门。","带齐七根金色羽毛，登上山路后向守卫出示。","Gate in the northern Bog.","Bring seven Golden Feathers and show them to the guard at the top of the climb."],
 ["the-queens-chamber","女王城堡救援","入城后，与第一处帐篷附近的伊尔达交谈。","救出三对兄弟姐妹，再回找伊尔达开路前往女王战。","Speak to Ilda near the first tent after entering the castle.","Rescue three sibling pairs and return to Ilda to open the route to the Queen."],
];
const achievementCleanup=[
 ["taking-a-break","先在排水道找 Willow，再在帐篷触发后续对话，最后去夜之庭园水疗馆。","Meet Willow in the Drains, check tents for his follow-up and visit the Night Garden spa."],
 ["bouncing-bottles","装备瓶盖，用火柴连续向上击打同一只焰瓶 10 次。","Equip Bottle Cap and hit the same Flaming Vessel upward ten times."],
 ["complete-flock","把 20 个灵魂送回鸟巢交付，缺项时先查计时挑战的奖励房。","Return all 20 spirits to the nest. Check time trial reward rooms for missing statues."],
 ["expert-collector","只差一两件时，先对照六件商店商品与三件灵魂奖励。","If you’re one or two short, check the six shop purchases and three spirit rewards."],
 ["fully-stocked","回帐篷逐件检查工坊菜单，确认所有可升级饰物都已升满。","Check each tent workshop entry and max out every upgradeable trinket."],
 ["together-at-last","学会腾空、找到神秘标记，再把五枚碎片带回夜之庭园鸟巢。","Learn Soar, find Mysterious Markings, then bring all five fragments back to the Night Garden nest."],
];
const collectionChecks=[
 ["饰物","Trinkets","核对 32 件。商店商品与灵魂交付奖励也计入。","Check all 32, including shop purchases and spirit rewards.","collectibles/trinkets/#all-trinkets"],
 ["灵魂","Spirits","救出 20 个后，回夜之庭园鸟巢交付。","Rescue all 20 and return them to the Night Garden nest.","collectibles/spirits/#spirits-by-area"],
 ["书页","Story pages","按三本书核对 9、8、6 页。","Check the three books for 9, 8 and 6 pages.","collectibles/story-pages/#story-pages-by-book"],
 ["工坊代币","Workshop Tokens","按区域查 27 枚的位置。升满成就要回帐篷逐件升级。","Check all 27 locations by area. Apply the upgrades at a tent for Fully Stocked.","collectibles/workshop-tokens/#tokens-by-area"],
 ["饰物槽","Trinket slots","漏项可先查计时奖励房、商店和需要后期能力的位置。","Check trial reward rooms, shops and pickups gated by late-game abilities.","collectibles/trinket-slots/#slot-cleanup"],
 ["计时挑战","Time trials","核对十场挑战的奖励是否已领取。","Check whether you claimed the rewards from all ten trials.","challenges/time-trials/"],
 ["团聚结局","Reunion ending","学会腾空后，收齐五枚灵魂碎片并回鸟巢触发团聚。","After learning Soar, collect all five Spirit Fragments and return to the nest.","collectibles/spirit-fragments/"],
];
const slotCleanupRoutes=[
 ["夜之庭园、干涸城堡、码头、墓谷","Night Garden, Desiccated Castle, the Docks and Graven Valley","这四场计时挑战都能拿饰物槽。过线后进奖励房领取，墓谷的奖励路线还需要无限攀爬。","These four time trials award slots. Enter the reward room after finishing. The Graven Valley reward route also needs Endless Climb.","challenges/time-trials/"],
 ["秋日森林 · 第 42 项","Autumn Forest · Entry 42","用弹弓玩帐篷旁的射靶小游戏。金色靶奖励饰物槽，窄浅蓝靶奖励蓝色蝴蝶结。","Use Slingshot in the tent-side minigame. The gold target awards a slot, and the narrow light-blue target awards Blue Bow.","walkthrough/autumn-forest/"],
 ["深海 · 第 49、50 项","The Deep · Entries 49 and 50","第 49 项要用鱼雷打通左支路。第 50 项是另一处拾取，按图文房间截图定位。","For entry 49, use Torpedo to clear the left branch. Entry 50 is a separate pickup; use its room screenshot to locate it.","walkthrough/the-deep/"],
 ["蛛雨旅店 · 第 101、102 项","Webdrench Inn · Entries 101 and 102","第 101 项从下方腾空上去。第 102 项还可以借蛛网团上去。","Use Soar from below for entry 101. Web balls also reach entry 102.","walkthrough/webdrench-inn/"],
 ["商店补购","Shop purchases","检查存档帐篷的拾荒者商店。通关后先拿女王金币，再回帐篷补买可享折扣。","Check Looter’s shop in a save tent. After the ending, pick up the Queen’s Coin before returning to buy remaining slots at a discount.","collectibles/key-items/the-queens-coin/"],
];
const trinketEntries=[
 ["猎人吊坠","Hunter’s Locket","hunters-cabin"],
 ["玻璃眼","Glass Eye","450"],
 ["发夹","Hair Pin","the-bog"],
 ["金针","Golden Needle","burial-vault"],
 ["风化硬币","Weathered Coin","600"],
 ["一束头发","Bundle of Hair","night-garden"],
 ["小女巫雕像","Tiny Witch Sculpture","2"],
 ["融化蜡烛","Melted Candle","the-drains"],
 ["破铃","Broken Bell","graven-valley"],
 ["裂纹弹珠","Cracked Marble","graven-valley"],
 ["银戒指","Silver Ring","800"],
 ["瓶盖","Bottle Cap","250"],
 ["银勺","Silver Spoon","desiccated-castle"],
 ["烧焦鞋带","Burnt Shoelace","desiccated-castle"],
 ["玻璃碎片","Glass Shard","night-garden"],
 ["骷髅钥匙扣","Skull Keychain","350"],
 ["生锈顶针","Rusted Thimble","550"],
 ["蜘蛛网","Spider’s Web","midnight-drench"],
 ["蓝色蝴蝶结","Blue Bow","autumn-forest"],
 ["玩偶头","Doll’s Head","autumn-forest"],
 ["臼齿","Molar Tooth","graven-valley"],
 ["珍珠饰品","Pearl Jewelry","12"],
 ["缠线钉","Nails with Twine","the-docks"],
 ["邮票","Postage Stamp","the-docks"],
 ["鸟形纽扣","Bird-Shaped Button","dollmakers-house"],
 ["布片","Scrap of Fabric","the-bog"],
 ["虫翅","Insect Wing","webdrench-inn"],
 ["余烬瓶","Ember Vial","webdrench-inn"],
 ["生锈罗盘","Rusted Compass","burial-vault"],
 ["带线回形针","Paper Clip with String","20"],
 ["鱼钩","Fish Hook","the-drains"],
 ["生锈叉子","Rusty Fork","hunters-cabin"],
];
const tokenGroups=[
 ["the-drains",[[1,""],[7,"HW"]]],
 ["hunters-cabin",[[2,"C"],[9,"SHC"]]],
 ["graven-valley",[[3,"CS"],[19,"SHEL"],[20,"SHEL"]]],
 ["desiccated-castle",[[4,""],[5,"SC"]]],
 ["night-garden",[[6,"C"]]],
 ["midnight-drench",[[8,"SC"]]],
 ["lookout-tower",[[10,"SHC"],[11,"HC"]]],
 ["the-docks",[[12,"HC"],[13,"CH"]]],
 ["the-bog",[[14,"EH"],[16,"HCL"]]],
 ["dollmakers-house",[[15,""],[26,"SE"]]],
 ["webdrench-inn",[[17,"H"],[18,"HL"]]],
 ["autumn-forest",[[21,"HEL"],[22,"H"]]],
 ["burial-vault",[[23,"H/C"],[24,"HE"],[25,"HEL"]]],
 ["queens-castle",[[27,"EH"]]],
];
const tokenAbilities={S:['弹弓','Slingshot'],C:['攀爬','Climb'],H:['悬停','Hover'],W:['乘风','Wind Ride'],E:['无限攀爬','Endless Climb'],L:['墙壁弹射','Wall Sling']};
const storyPageGroups=[
 ["《女巫的交易》","The Witch’s Bargain",[["night-garden",1],["desiccated-castle",5],["graven-valley",6],["desiccated-castle",8],["midnight-drench",9],["midnight-drench",10],["hunters-cabin",20],["desiccated-castle",21],["queens-castle",23]]],
 ["《玩偶师》","The Dollmaker",[["hunters-cabin",2],["the-bog",3],["autumn-forest",13],["the-bog",15],["dollmakers-house",16],["dollmakers-house",17],["burial-vault",18],["dollmakers-house",19]]],
 ["《瞭望塔》","The Lookout Tower",[["night-garden",4],["graven-valley",7],["lookout-tower",11],["lookout-tower",12],["the-deep",14],["the-bog",22]]],
];
const sharedContext={window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/content.js'),'utf8'),sharedContext);
const shared=sharedContext.window.GAMENOTE_CONTENT;
const videoCopy=require('../content/games/an-jing-wei-guang/public-video-copy.json'),publicCopy=new Map();
for(let part=2;part<=7;part++){
 const items=require('../_research/an-jing-wei-guang/p'+part+'-map-notes.json').flatMap(c=>c.items);
 if(items.length!==videoCopy[part].length)throw Error('Public reading copy count mismatch: '+part);
 items.forEach((item,i)=>publicCopy.set(base+'images/p'+part+'/frame-'+String(item.sec).padStart(4,'0')+'.webp',videoCopy[part][i]));
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?all(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);
const files=[path.join(root,'index.html'),...['catalog','news','games','notes','updates','about','en','search'].flatMap(d=>all(path.join(root,d)))];
function clean(text,en){
 if(en){
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s=>!/has not been confirmed|not yet verified|not established|not been established|remain(?:s)? unconfirmed|left unconfirmed|not clearly read|not inferred|not assigned names|not presented as an ending|not proof|does not establish|does not confirm|does not show|does not imply|does not mean|not a completion frame|not a boss-defeat scene|not a fixed phase rule|not a completed rescue|not completion or a reward|not a complete attack cycle|only the pickup node|naming difference remains|correspondence with the Chinese video|Without a completion message|Without an item panel|One confirmed pickup|This confirms one pickup|formal name is unconfirmed|not readable in this frame|do not mistake visual descriptions|rather than assigning it|episode title|solely because of the video title|not proof that a new named region/i.test(s))
   .join(' ').replace(/The (?:later )?recording (?:then )?/g,'The route ').replace(/the recording /g,'the route ').replace(/The commentary explicitly points out this movement\. /g,'').replace(/; the commentary explicitly points out this movement/g,'').replace(/The commentary (?:highlights|points out|recommends|says|advises) /g,'').replace(/Record this separately from the earlier roadside conversation; these are two encounters with the same NPC\./g,'This is a second encounter with the same NPC.').replace(/Record this as a post-battle node\./g,'Finish the post-battle dialogue.').replace(/Document the first crossing separately from opening the return shortcut, then /g,'Then ').replace(/This records the controller prompt actually shown, not a universal binding for every platform\./g,'Check the controls in your own game settings.').trim();
 }
 return text.split(/(?<=[。！？])/).filter(s=>!/本轮|本次记录|当前记录|此处仅记录|不把|不将|不据此|不为看不清|不视为|不宣称|尚未.*核实|待确认|名称待核验|未.*确认.*(?:名称|数量)|只作.*参考|只记录|只确认|这里只|不作为|不等同于|不代表|尚未.*读出|不能据此|没有.*确认/.test(s))
  .join('').replace(/录像(?:在这里|随后|后段|末段|继续|打开地图，展示|显示|中|里)?/g,'').replace(/画面中的/g,'').replace(/画面中/g,'').replace(/这段画面中，/g,'这里，').replace(/游戏画面显示/g,'游戏提示').replace(/字幕明确提示这(?:一|个)动作[。；]?/g,'').replace(/记录这个节点/g,'留意这个节点').replace(/分开记录/g,'分别查看').replace(/若要整理相关任务，先以这两个实际对话节点为起点。/g,'继续任务时，留意这两处对话。').replace(/先完成当前段落的记录，再继续/g,'先完成当前段落，再继续').trim();
}
function references(record){
 if(!record)return [];
 const sources=[...(record.sources||[]),...Object.values(record.fields||{}).filter(confirmed).flatMap(f=>f.sources||[])];
 // The profile is credited as a creator profile, never as an exact video URL.
 const unique=new Map();for(const s of sources)if(s.url?.startsWith('https://'))unique.set(s.url,s.name);
 return [...unique].map(([url,label])=>[url.includes('space.bilibili.com/3804625')?'好吃的香草雪球 · Bilibili 作者主页':label.replace(/（用户提供页面截图）/g,''),url]);
}
const indexable=[];
for(const file of files){
 const url='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,''),en=url.startsWith('/en/'),current=url.replace(/^\/en\//,'/'),prefix=en?'/en':'',classic=current.startsWith(base);
 const $=cheerio.load(fs.readFileSync(file,'utf8')),article=classic?$('.classic-main > article'):$('.article');
 const parts=classic?current.slice(base.length).split('/').filter(Boolean):[],record=classic?({walkthrough:data.areas,maps:data.areas,bosses:data.bosses,abilities:data.abilities,achievements:data.achievements,collectibles:parts[1]==='key-items'&&parts[2]?data.keyItems:data.collectibles,quests:data.quests,challenges:data.challenges}[parts[0]]||[]).find(e=>e.slug===(parts[2]||parts[1])):null;
 $('[data-editorial],script[data-article-schema],script[data-site-schema]').remove();
 $('link[href="/assets/editorial.css"]').remove();$('head').append('<link rel="stylesheet" href="/assets/editorial.css">');
 if(classic){
  if(parts[0]==='bosses'&&record){
   const followUp=bossFollowUps.find(([slug])=>slug===record.slug);
   if(followUp){
    const [,,stepsZh,stepsEn,route]=followUp;
    const steps=en?stepsEn:stepsZh;
    const section=`<section data-editorial id="after-victory"><h2 class="classic-heading">${en?'After victory':'战后下一步'}</h2><p>${esc(steps)}</p><ul class="classic-links"><li><a href="${prefix+base+route}">${en?'Open the next guide':'查看后续攻略'}</a></li><li><a href="${prefix+base+'bosses/#boss-follow-ups'}">${en?'All boss follow-ups':'首领战后推进速查'}</a></li></ul></section>`;
    const related=article.children('h2').filter((_,node)=>/^(?:相关攻略|Related guides)$/i.test($(node).text().trim())).first();
    if(related.length)related.before(section);
    else article.append(section);
   }
  }
  if(current===base+'bosses/'){
   const rows=bossFollowUps.map(([slug,zh,stepsZh,stepsEn,route])=>{
    const boss=data.bosses.find(item=>item.slug===slug);
    return `<tr><th scope="row"><a href="${prefix+base+'bosses/'+boss.slug+'/'}">${esc(en?boss.nameEn:zh)}</a></th><td>${esc(en?stepsEn:stepsZh)}</td><td><a href="${prefix+base+route}">${en?'Open guide':'查看攻略'}</a></td></tr>`;
   }).join('');
   const headers=en?['Boss','What to do after victory','Guide']:['首领','战后要做什么','相关攻略'];
   article.prepend(`<section data-editorial id="boss-follow-ups"><h2 class="classic-heading">${en?'What to do after a boss fight':'首领战后推进速查'}</h2><div class="classic-table-wrap"><table class="classic-table"><thead><tr>${headers.map(label=>'<th scope="col">'+label+'</th>').join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`);
  }
  if(current===base+'quests/'){
   const headers=en?['Quest guide','Where to start','What it leads to']:['任务攻略','起点','后续推进'];
   const rows=questOverview.map(([slug,name,start,goal,startEn,goalEn])=>{
    const quest=data.quests.find(item=>item.slug===slug);
    return `<tr><th scope="row"><a href="${prefix+base+'quests/'+quest.slug+'/'}">${esc(en?quest.nameEn:name)}</a></th><td>${esc(en?startEn:start)}</td><td>${esc(en?goalEn:goal)}</td></tr>`;
   }).join('');
   article.prepend(`<section data-editorial id="quest-overview"><h2 class="classic-heading">${en?'Quest starting points and next steps':'任务起点与后续推进'}</h2><div class="classic-table-wrap"><table class="classic-table"><thead><tr>${headers.map(label=>'<th scope="col">'+label+'</th>').join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`);
  }
  if(current===base+'abilities/'){
   const checkpoints=[
    [['slingshot','climb','tent-travel'],'猎人小屋学弹弓。击败沼泽虫群后学攀爬，再沿战后通道进入夜之庭园东侧，攀右墙拿帐篷传送。','Learn Slingshot in Hunter’s Cabin. After the Swarm, learn Climb and follow the onward passage into eastern Night Garden. Climb the right wall for Tent Travel.'],
    [['wind-ride','hover'],'去排水道东南部学乘风。干涸城堡躲避女王后，继续沿下层路线找悬停能力蛋。','Learn Wind Ride in the southeastern Drains. After evading the Queen in Desiccated Castle, take the lower route to the Hover egg.'],
    [['water-vessel','torpedo','endless-climb'],'救出码头船员并完成篝火对话后登船。到深海拿鱼雷，救出双胞胎后回码头找 Barge 学无限攀爬。','Rescue the Docks crew member and finish the campfire scene to board. Find Torpedo in the Deep, rescue the twins, then return to Barge for Endless Climb.'],
    [['wall-sling','soar'],'救出玛格达后学墙壁弹射。击败女王并收齐 32 件饰物后，在寝室西门内学腾空。','Learn Wall Sling after rescuing Magda. Defeat the Queen and collect all 32 trinkets to learn Soar beyond the western chamber door.']
   ];
   const steps=checkpoints.map(([slugs,zh,english])=>{
    const links=slugs.map(slug=>{
     const ability=data.abilities.find(item=>item.slug===slug);
     return `<a href="${prefix+base+'abilities/'+slug+'/'}">${esc(en?ability.nameEn:ability.nameZh||ability.nameEn)}</a>`;
    }).join(' · ');
    return `<li><p>${esc(en?english:zh)}</p><p>${links}</p></li>`;
   }).join('');
   article.prepend(`<section data-editorial id="ability-unlock-route"><h2 class="classic-heading">${en?'Ability unlock route':'能力解锁路线'}</h2><ol>${steps}</ol></section>`);
  }
  if(current===base){
   const postgameLinks=[
    ['通关后收集核对表','Postgame collection checklist','补查饰物、灵魂、书页、工坊代币、饰物槽和计时挑战奖励。','Check trinkets, spirits, story pages, Workshop Tokens, slots and trial rewards.','collectibles/#collection-checklist'],
    ['通关后成就查漏','Postgame achievement cleanup','查看六项成就的补做提示，包括水疗馆、焰瓶连弹和饰物升满。','Find six cleanup guides, including the spa, Bouncing Bottles and Fully Stocked.','achievements/#achievement-cleanup'],
    ['团聚结局卡关排查','Reunion ending troubleshooting','定位女王寝室两扇门、神秘标记和五枚碎片的交付地点。','Check the Queen’s chamber doors, Mysterious Markings and where to deliver the five fragments.','achievements/together-at-last/']
   ];
   const items=postgameLinks.map(([zh,english,stepsZh,stepsEn,route])=>
    `<li><a href="${prefix+base+route}">${esc(en?english:zh)}</a> · ${esc(en?stepsEn:stepsZh)}</li>`
   ).join('');
   article.children('h2').filter((_,node)=>$(node).text().trim()===(en?'Research status':'资料整理状态')).first().before(
    `<section data-editorial id="postgame-guide-links"><h2 class="classic-heading">${en?'After defeating the Queen':'击败女王后'}</h2><ul class="classic-links">${items}</ul></section>`
   );
  }
  if(current===base+'achievements/'){
   const items=achievementCleanup.map(([id,zh,english])=>{
    const achievement=data.achievements.find(item=>item.id===id);
    const label=en?achievement.nameEn:achievement.nameZh;
    return `<li><a href="${prefix+base+'achievements/'+achievement.slug+'/'}">${esc(label)}</a> · ${esc(en?english:zh)}</li>`;
   }).join('');
   article.prepend(`<section data-editorial id="achievement-cleanup"><h2 class="classic-heading">${en?'Postgame achievement cleanup':'通关后成就查漏'}</h2><ul class="classic-links">${items}</ul></section>`);
  }
  if(current===base+'collectibles/'){
   const checks=collectionChecks.map(([zh,english,stepsZh,stepsEn,route])=>
    `<li><a href="${prefix+base+route}">${esc(en?english:zh)}</a> · ${esc(en?stepsEn:stepsZh)}</li>`
   ).join('');
   const mapSteps=en?[
    'At a save tent, open Map Markers and buy the category you are missing. Its markers cover items in rooms you have already entered.',
    'If the map shows no marker, check unexplored branches and reward rooms you may have skipped after a trial.',
    'Equip Rusted Compass when checking a specific room. It signals when the current room contains a collectible. If you get a signal, check for a hidden wall or an upper passage.'
   ]:[
    '在存档帐篷打开地图标记菜单，购买对应收集类别的标记。标记只显示你进过的房间里的漏项。',
    '地图上没有标记时，回查还没走过的岔路，以及计时通过后可能漏进的奖励房。',
    '逐间排查时装备生锈罗盘。它会在当前房间有收集品时发出提示。收到提示后，再找暗墙或上层通道。'
   ];
   article.prepend(`<section data-editorial id="collection-checklist"><h2 class="classic-heading">${en?'Postgame collection checklist':'通关后收尾核对表'}</h2><ul class="classic-links">${checks}</ul><h3 id="missing-collectibles">${en?'Find the last missing items':'地图上查不到漏项时'}</h3><ol>${mapSteps.map(step=>'<li>'+esc(step)+'</li>').join('')}</ol><p><a href="${prefix+base+'walkthrough/burial-vault/'}">${en?'Rusted Compass pickup route':'生锈罗盘获取路线'}</a> · <a href="https://meowdb.com/db/well-dweller/map-and-fast-travel">${en?'Map marker reference':'地图标记参考'}</a></p></section>`);
  }
  if(current===base+'collectibles/trinket-slots/'){
   const list=slotCleanupRoutes.map(([zh,english,stepsZh,stepsEn,route])=>
    `<li><strong><a href="${prefix+base+route}">${esc(en?english:zh)}</a></strong><p>${esc(en?stepsEn:stepsZh)}</p></li>`
   ).join('');
   article.prepend(`<section data-editorial id="slot-cleanup"><h2 class="classic-heading">${en?'Trinket slot cleanup routes':'饰物槽查漏路线'}</h2><p>${en?'The entry numbers match the room screenshots in the illustrated guide.':'下列编号对应实机图文中的房间截图。'} <a href="https://gamersocialclub.ca/2026/09/22/well-dweller-100-collectibles-achievement-trophy-walkthrough/">${en?'Open the illustrated guide':'查看全收集实机图文'}</a></p><ul>${list}</ul></section>`);
  }
  if(current===base+'collectibles/trinkets/'){
   const rows=trinketEntries.map(([zh,english,location],index)=>{
    const amount=Number(location);
    const area=data.areas.find(item=>item.id===location);
    const label=area?(en?area.nameEn:area.nameZh||area.nameEn):amount<=20?(en?`Return ${amount} spirits`:`归还 ${amount} 个灵魂`):(en?`Looter’s shop · ${amount}`:`拾荒者商店 · ${amount} 货币`);
    const route=area?'walkthrough/'+area.slug+'/':amount<=20?'collectibles/spirits/':'';
    const target=route?`<a href="${prefix+base+route}">${esc(label)}</a>`:esc(label);
    return `<tr><th scope="row">${index+1}</th><td>${esc(en?english:zh+'（'+english+'）')}</td><td>${target}</td></tr>`;
   }).join('');
   const labels=en?['Illustrated guide entry','Trinket','How to get it']:['图文编号','饰物','获取方式'];
   article.prepend(`<section data-editorial id="all-trinkets"><h2 class="classic-heading">${en?'All 32 trinkets':'32 件饰物查漏表'}</h2><p>${en?'Check room pickups, spirit rewards and shop purchases together. Shop prices shown are before discounts.':'按名称核对地图拾取、灵魂奖励和商店购入。表内商店价格为原价。'} <a href="https://gamersocialclub.ca/2026/09/21/well-dweller-all-trinket-locations-for-the-expert-collector-achievement-trophy-guide/">${en?'Open the illustrated guide':'查看饰物实机图文'}</a></p><div class="classic-table-wrap"><table class="classic-table"><thead><tr>${labels.map(label=>'<th scope="col">'+label+'</th>').join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`);
  }
  if(current===base+'collectibles/workshop-tokens/'){
   const rows=tokenGroups.flatMap(([id,entries])=>{
    const area=data.areas.find(item=>item.id===id);
    const label=en?area.nameEn:area.nameZh||area.nameEn;
    return entries.map(([number,codes])=>{
     const abilities=codes?codes.split('/').map(group=>[...group].map(code=>tokenAbilities[code][en?1:0]).join(en?', ':'、')).join(en?' or ':'或'):(en?'None':'无');
     const location=number===1?(en?'Tent after Lady of the Drains':'击败排水道女士后的帐篷'):label;
     return `<tr><th scope="row">${number}</th><td><a href="${prefix+base+'walkthrough/'+area.slug+'/'}">${esc(location)}</a></td><td>${esc(abilities)}</td></tr>`;
    });
   }).join('');
   const headers=en?['Illustrated guide entry','Area','Abilities']:['图文编号','所在区域','所需能力'];
   article.prepend(`<section data-editorial id="tokens-by-area"><h2 class="classic-heading">${en?'All 27 Workshop Tokens by area':'按区域核对 27 枚工坊代币'}</h2><p>${en?'The first token comes from Willow at a tent. Use the numbered entries to find room screenshots in the illustrated guide.':'首枚由帐篷里的 Willow 交付。其他代币可按表中编号在实机图文里找房间截图。'} <a href="https://gamersocialclub.ca/2026/09/21/well-dweller-all-workshop-token-locations-for-the-fully-stocked-achievement-trophy-guide/">${en?'Open the illustrated guide':'查看代币实机图文'}</a></p><div class="classic-table-wrap"><table class="classic-table"><thead><tr>${headers.map(label=>'<th scope="col">'+label+'</th>').join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`);
  }
  if(current===base+'collectibles/story-pages/'){
   const tables=storyPageGroups.map(([zh,english,entries])=>{
    const rows=entries.map(([id,reference],index)=>{
     const area=data.areas.find(item=>item.id===id);
     const name=en?area.nameEn:area.nameZh||area.nameEn;
     return `<tr><th scope="row">${index+1}</th><td><a href="${prefix+base+'walkthrough/'+area.slug+'/'}">${esc(name)}</a></td><td>${reference}</td></tr>`;
    }).join('');
    return `<div class="classic-table-wrap"><table class="classic-table"><caption>${esc(en?english:zh)}</caption><thead><tr><th scope="col">${en?'Page in book':'书内页码'}</th><th scope="col">${en?'Area':'所在区域'}</th><th scope="col">${en?'Illustrated guide entry':'图文编号'}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
   }).join('');
   article.prepend(`<section data-editorial id="story-pages-by-book"><h2 class="classic-heading">${en?'All 23 pages by book':'按书核对 23 张书页'}</h2><p>${en?'Match the page number in your Pages menu, then use the illustrated guide entry to find the room screenshot.':'先在游戏菜单确认缺的是哪一本、哪一页，再按右栏的图文编号找房间截图。'} <a href="https://gamersocialclub.ca/2026/09/21/well-dweller-all-story-page-locations-guide/">${en?'Open the illustrated guide':'查看书页实机图文'}</a></p>${tables}</section>`);
  }
  if(current===base+'collectibles/spirits/'){
   const regions=data.areas.filter(area=>spiritLocations[area.id]?.length);
   const total=regions.reduce((sum,area)=>sum+spiritLocations[area.id].length,0);
   const routes=regions.map(area=>{
    const birds=spiritLocations[area.id];
    const name=en?area.nameEn:area.nameZh||area.nameEn;
    return `<h3><a href="${prefix+base+'walkthrough/'+area.slug+'/#area-spirits'}">${esc(name)}</a>（${birds.length}）</h3><ol>${birds.map(pair=>'<li>'+esc(pair[en?1:0])+'</li>').join('')}</ol>`;
   }).join('');
   article.prepend(`<section data-editorial id="spirits-by-area"><h2 class="classic-heading">${en?'All '+total+' spirits by area':'按区域核对 '+total+' 个灵魂'}</h2><p>${en?'After breaking the statues, return the spirits to the nest west of the lower Night Garden tent.':'打碎石像后，回夜之庭园下层帐篷左侧的鸟巢交付。'}</p>${routes}</section>`);
  }
  if(['walkthrough','bosses'].includes(parts[0]))article.find('p').each((_,n)=>{const p=$(n);if(!p.find('a').length){const value=clean(p.text(),en);if(value)p.text(value);else p.remove()}});
  article.find('.classic-image-block').each((_,n)=>{const block=$(n),copy=publicCopy.get(block.find('img').attr('src'));if(copy){if(!block.children('p').length)block.append('<p></p>');block.children('p').text(copy[en?1:0])}});
  const encounters=[];
  if(parts[0]==='walkthrough'){
   article.children('h2').each((_,n)=>{const heading=$(n),label=heading.text().trim();if(!['NPC','Boss','Boss / encounter'].includes(label))return;const body=heading.next('p');if(body.length)encounters.push([label,body.html()]);body.remove();heading.remove()});
   if(!encounters.some(([label])=>label==='NPC')&&confirmed(record?.fields.npcs)){
    const englishNames=new Map(Object.entries(require('../content/games/an-jing-wei-guang/labels-zh.json')).map(([english,chinese])=>[chinese,english]));
    encounters.push(['NPC',record.fields.npcs.value.map(value=>esc(en?englishNames.get(value)||value:value)).join(' · ')]);
   }
   article.find('.classic-image-block').removeClass('reverse').addClass('center classic-walkthrough-image');
  }
  const birds=spiritLocations[record?.id]||[];
  if(parts[0]==='walkthrough'&&birds.length){
   const positions=`<section data-editorial class="classic-spirit-route" id="area-spirits"><h2 class="classic-heading">${en?'Bird spirit locations':'鸟灵位置'}</h2><ol>${birds.map((pair,index)=>`<li><strong>${en?'Bird spirit':'鸟灵'} ${index+1}</strong>：${esc(pair[en?1:0])}</li>`).join('')}</ol><p class="article-meta">${en?'Location reference':'位置参考'}：<a href="${spiritLocations.source}" target="_blank" rel="noopener noreferrer">Well Dweller · All Spirits Checklist</a></p></section>`;
   article.children('h2').filter((_,node)=>/^(?:相关攻略|Related guides)$/i.test($(node).text().trim())).first().before(positions);
  }
  const summary=summaries[record?.id];
  if(summary&&parts[0]==='walkthrough'){
   const links=[['地图','Map',base+'maps/'+record.slug+'/'],...(summary.bosses||[]).map(id=>{const e=data.bosses.find(e=>e.id===id);return [e.nameZh||require('../content/games/an-jing-wei-guang/labels-zh.json')[e.nameEn]||e.nameEn,e.nameEn,base+'bosses/'+e.slug+'/']}),...(summary.abilities||[]).map(id=>{const e=data.abilities.find(e=>e.id===id);if(!e)throw Error('Unknown summary ability '+id);return [e.nameZh||require('../content/games/an-jing-wei-guang/labels-zh.json')[e.nameEn]||e.nameEn,e.nameEn,base+'abilities/'+e.slug+'/']})];
   const bossIds=[...new Set([...(summary.bosses||[]),...(confirmed(record.fields.bosses)?record.fields.bosses.value:[])])];
   const bossRow=bossIds.length?'<dt>Boss</dt><dd>'+bossIds.map(id=>{const e=data.bosses.find(e=>e.id===id);if(!e)throw Error('Unknown regional boss '+id);return `<a href="${prefix+base+'bosses/'+e.slug+'/'}">${esc(en?e.nameEn:e.nameZh||require('../content/games/an-jing-wei-guang/labels-zh.json')[e.nameEn]||e.nameEn)}</a>`}).join(' · ')+'</dd>':'';
   const npcRows=encounters.filter(([label])=>label==='NPC').map(([,html])=>'<dt>NPC</dt><dd>'+html+'</dd>').join('')+(record.id==='the-bog'?`<dt>NPC</dt><dd>${en?'Ilda — roadside and campfire conversations.':'伊尔达 · 途中与营地篝火旁的两处对话。'}</dd>`:record.id==='desiccated-castle'?`<dt>NPC</dt><dd>${en?'Looter — dialogue along the castle route.':'拾荒者 · 荒堡路线中的对话节点。'}</dd>`:'');
   const birdRow=`<dt>${en?'Bird spirits':'鸟灵'}</dt><dd>${birds.length}${birds.length?` · <a href="#area-spirits">${en?'See locations':'查看位置'}</a>`:''}</dd>`;
   article.prepend(`<section data-editorial class="classic-region-summary"><h2 class="classic-heading">${en?'Area at a Glance':'本区域要点'}</h2><dl>${[['goal','推进目标','Goal'],['ability','能力 / 使用限制','Ability / Limits'],['revisit','回头探索','Return Visits']].map(([key,zh,english])=>`<dt>${en?english:zh}</dt><dd>${esc(summary[key][en?1:0])}</dd>`).join('')}${birdRow}${npcRows}${bossRow}</dl><p>${links.filter(([, ,u])=>!u.includes('/bosses/')).map(([zh,english,u])=>`<a href="${prefix+u}">${esc(en?english:zh)}</a>`).join(' · ')}</p></section>`);
   if(record.id==='the-well'){
    article.find('h2').filter((_,node)=>$(node).text().includes(en?'Return to':'回到起点')).first().attr('id','well-return');
    article.find('.classic-region-summary').after(`<nav data-editorial class="classic-route-outline" aria-label="${en?'Well route':'井底路线'}"><h2 class="classic-heading">${en?'Route at a Glance':'路线速览'}</h2><ol><li><a href="#well-start">${en?'Leave the skull':'离开头骨起点'}</a></li><li><a href="#well-return">${en?'Return to the Well':'返回井底继续下行'}</a></li></ol></nav>`);
    article.find('h2').filter((_,node)=>$(node).text().includes(en?'skull':'头骨起点')).first().attr('id','well-start');
   }
   if(record.id==='night-garden'){
    article.find('.classic-region-summary').after(`<nav data-editorial class="classic-route-outline" aria-label="${en?'Night Garden route':'夜之庭园路线'}"><h2 class="classic-heading">${en?'Route at a Glance':'路线速览'}</h2><ol><li><a href="#garden-early">${en?'Tent and supplies':'帐篷与补给'}</a></li><li><a href="#garden-groundskeeper">${en?'Groundskeeper':'园丁战'}</a></li><li><a href="#area-spirits">${en?'Bird spirit locations':'鸟灵位置'}</a></li></ol></nav>`);
    const headings=article.children('h2');headings.filter((_,node)=>/庭园前段|early garden|early route/i.test($(node).text())).first().attr('id','garden-early');
    headings.filter((_,node)=>/遭遇园丁|Groundskeeper/i.test($(node).text())).first().attr('id','garden-groundskeeper');
   }
   if(record.id==='the-bog'){
    const stops=[
     {frame:'0065',id:'bog-entrance',zh:'入口竖井与下层支路',en:'Entrance shaft and lower branches'},
     {frame:'0690',id:'bog-camp',zh:'伊尔达营地与回程地图',en:'Ilda’s camp and return map'},
     {frame:'1015',id:'bog-encounter',zh:'虫群战斗',en:'The Swarm encounter'},
     {frame:'1130',id:'bog-climb',zh:'攀爬教学与高处回访',en:'Climb and high-branch revisit'}
    ];
    for(const stop of stops){
     const image=article.find(`img[src="${base}images/p2/frame-${stop.frame}.webp"]`).first();
     const heading=image.closest('.classic-image-block').prev('h2');
     if(!heading.length)throw Error('Missing Bog route heading for frame '+stop.frame);
     heading.attr('id',stop.id);
    }
    article.find('.classic-region-summary').after(`<nav data-editorial class="classic-route-outline" aria-label="${en?'Bog route':'沼泽路线'}"><h2 class="classic-heading">${en?'Route at a Glance':'路线速览'}</h2><ol>${stops.map(stop=>`<li><a href="#${stop.id}">${esc(en?stop.en:stop.zh)}</a></li>`).join('')}</ol></nav>`);
   }
  }
  if(record&&['walkthrough','maps'].includes(parts[0])){
   const mapNotes=require('../content/games/an-jing-wei-guang/regional-map-notes.json').find(n=>n.id===record.id);
   const description=parts[0]==='walkthrough'?(summary?.[en?'en':'zh']||(en?`${record.nameEn}: regional guide in progress.`:`${$('h1').text()}区域路线资料持续整理中。`)):(mapNotes?(en?`${record.nameEn}: map orientation covering ${mapNotes.rowsEn.map(r=>r[0]).join(', ')}.`:`${$('h1').text()}：${mapNotes.rows.map(r=>r[0]).join('、')}的地标识别与地图定位。`):(en?`${record.nameEn}: map references in progress.`:`${$('h1').text()}的地图参考资料持续整理中。`));
   $('meta[name=description],meta[property="og:description"]').attr('content',description);
  }
  if(parts[0]==='bosses'&&parts[1]==='the-queen'){
   const achievements=data.achievements.filter(e=>['hide-and-seek','endgame'].includes(e.id));
   article.prepend(`<section data-editorial><h2 class="classic-heading">${en?'The Queen and Related Achievements':'女王与相关成就'}</h2><p>${en?'The Queen appears in two distinct Steam achievement descriptions: evading her and battling her. These are different objectives; the battle achievement description says “Battle the Queen”, not “Defeat the Queen”.':'Steam 成就包含两个与女王有关的目标：躲避女王和与女王战斗。两者不是同一个目标；“终局”的说明是“与女王战斗”，不是“击败女王”。'}</p><ul>${achievements.map(e=>`<li><a href="${prefix+base+'achievements/'+e.slug+'/'}">${esc(en?e.nameEn:e.nameZh)}</a>：${esc(en?e.descriptionEn:e.description)}</li>`).join('')}</ul><h2 class="classic-heading">${en?'Before the Encounter':'遭遇前准备'}</h2><p>${en?'Before continuing, review your available healing, supplies and equipped trinkets. Keep the ability and achievement indexes available when checking your remaining objectives.':'继续探索前，可先检查治疗、补给和已装备的饰物，并通过能力与成就目录核对自己的推进目标。'}</p><p class="classic-notice">${en?'Reference material in progress · Arena routes, attack patterns and detailed tactics will be added here.':'资料持续整理中 · 场地路线、招式与详细打法将在本页继续补充。'}</p></section>`);
   if(!confirmed(record?.fields.referenceStrategy)){
    $('meta[name=robots]').remove();$('head').append('<meta name="robots" content="noindex,follow">');$('[data-pagefind-body]').removeAttr('data-pagefind-body');
   }else article.children('section[data-editorial]').first().find('.classic-notice').remove();
   const hasStrategy=confirmed(record?.fields.referenceStrategy);
   $('meta[name=description],meta[property="og:description"]').attr('content',hasStrategy
    ?(en?'The Queen: castle prerequisites, floor spikes, fireballs and raised-platform tactics.':'女王攻略：王城前置条件、地刺和火球的应对，以及后半段的升降平台走法。')
    :(en?'The Queen: evasion and battle achievements and encounter preparation.':'女王：躲避与战斗成就，以及遭遇前准备。'));
  }
 }
 if(current==='/about/'){
  $('main section').has('a.text-link[href="'+prefix+'/notes/"]').remove();
  $('main').append(`<section class="section" data-editorial><h2>${en?'Who Writes GAME NOTE':'谁在整理 GAME NOTE'}</h2><p>${en?'GAME NOTE is an independent, player-made guide project. GAME NOTE editors organise routes, screenshots, bilingual text and corrections. The walkthrough videos referenced in the Well Dweller guide were created by 好吃的香草雪球; the video creator and this website’s guide editors are not presented as the same author.':'GAME NOTE 是玩家制作的独立攻略项目。本站攻略整理者负责路线编排、截图选取、中英文文字整理和勘误；《黯井微光》参考录像的原作者是好吃的香草雪球。攻略整理者与原视频作者分别署名，不将参考录像写成本站自行录制。'}</p><h2>${en?'How the Guides Are Prepared':'资料整理方法'}</h2><p>${en?'We compare gameplay footage, official game and Steam information, and referenced guides. Routes are organised by area, while maps, abilities and achievements have separate reference pages. Original evidence stays in the research archive; public pages show practical instructions and source links. Unresolved details remain drafts rather than invented conclusions.':'结合游戏画面、官方游戏与 Steam 资料以及注明来源的攻略进行对照，按区域整理路线，并将地图、能力和成就分别归档。原始依据保留在研究资料中；公开页面展示可用步骤与参考链接。尚未确定的信息保留为待补内容，不填充成结论。'}</p><h2>${en?'Corrections and Credits':'纠错与署名'}</h2><p>${en?'For corrections, include the page URL, region, problem and any supporting screenshot or source. Please use the contact page or open an issue in the GAME NOTE repository.':'反馈时请附页面地址、所在区域、具体问题及截图或参考资料。可通过联系方式页查看反馈渠道，或在 GAME NOTE 仓库提交 Issue。'}</p><p><a href="/contact.html">${en?'Contact and Corrections':'联系方式与纠错'}</a> · <a href="https://github.com/c2ccc2/gamenote.cc/issues" target="_blank" rel="noopener noreferrer">GAME NOTE Issues</a> · <a href="https://space.bilibili.com/3804625/" target="_blank" rel="noopener noreferrer">${en?'Original video creator: 好吃的香草雪球':'原视频作者：好吃的香草雪球'}</a></p></section>`);
 }
 if(article.length){
  let sources=references(record||((classic&&!parts.length)?data.game:null));
  if(current.startsWith('/notes/')&&current!=='/notes/'){
   sources.push([en?'GAME NOTE — editorial methods':'GAME NOTE · 资料整理方法',origin+prefix+'/about/']);
   const note=shared.notes.find(n=>n.url===current),game=shared.games.find(g=>g.id===note?.game);
   if(game)sources.push([en?'Related game guide':game.titleZh+'攻略专题',game.guideUrl.startsWith(base)?origin+prefix+game.guideUrl:game.guideUrl]);
  }
  if(classic&&parts[0]==='systems')sources.push(...require('../content/games/an-jing-wei-guang/systems-reference.json').map(s=>[en?s.titleEn:s.title,s.source]));
  if(classic&&parts[0]==='maps'&&parts[1]==='world')sources.push(['Gamer Guides — The Kingdom','https://www.gamerguides.com/well-dweller/maps/the-kingdom']);
  if(classic&&parts[0]==='abilities')sources.push(...Object.values(require('../content/games/an-jing-wei-guang/ability-reference.json').sources).map(s=>[s.name,s.url]));
  if(classic&&parts[0]==='achievements')sources.push([en?'Steam achievement list':'Steam 官方成就列表',`https://steamcommunity.com/stats/3699590/achievements/?l=${en?'english':'schinese'}`]);
  if(classic&&/\/images\/p[1-7]\//.test(article.html()))sources.push([en?'Original video creator: 好吃的香草雪球 — Bilibili profile':'好吃的香草雪球 · Bilibili 作者主页','https://space.bilibili.com/3804625/']);
  sources=[...new Map(sources.filter(([,u])=>u).map(s=>[s[1],s])).values()];
  if(sources.length){
   const block=`<section data-editorial class="article-references"><h2${classic?' class="classic-heading"':''}>${en?'References':'参考链接'}</h2><ul>${sources.map(([label,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(en&&u.includes('space.bilibili.com')?'Original video creator: 好吃的香草雪球 — Bilibili profile':en&&u.includes('steamcommunity.com')?'Steam — official achievement list':en&&/[\u3400-\u9fff]/.test(label)?'Reference — '+new URL(u).hostname:label)}</a></li>`).join('')}</ul></section>`;
   const nav=article.children('.classic-area-nav').first();if(nav.length)nav.before(block);else article.append(block);
  }
  const modifiedAt=classic?(record?.updatedAt||data.updatedAt):today;
  const modified=`<p data-editorial class="${classic?'classic-subtitle':'article-meta'}">${en?'Guide editor: GAME NOTE':'攻略整理：GAME NOTE'} · ${en?'Updated':'更新于'} <time datetime="${modifiedAt}">${modifiedAt}</time></p>`;
  const header=classic?$('.classic-main > header'):article.children('header').first();
  if(classic&&header.length){
   // Keep one visible byline; progress notices belong beside unfinished content.
   header.children('p.classic-subtitle').remove();
   header.children('h1').after(modified);
  }else if(header.length)header.append(modified);else article.prepend(modified);
  const isDetail=classic?(parts.length>1||parts[0]==='systems'):current.startsWith('/notes/')&&current!=='/notes/';
  if(isDetail){
   const schema={'@context':'https://schema.org','@type':current.startsWith('/notes/')?'BlogPosting':'Article','@id':origin+url+'#article',headline:$('h1').first().text(),description:$('meta[name=description]').attr('content'),inLanguage:en?'en':'zh-CN',dateModified:modifiedAt,author:{'@type':'Organization',name:'GAME NOTE',url:origin+(en?'/en/about/':'/about/')},publisher:{'@type':'Organization',name:'GAME NOTE',url:origin},mainEntityOfPage:origin+url};
   const published=article.find('header time').first().attr('datetime');if(published&&published!==today)schema.datePublished=published;
   const img=article.find('img').first().attr('src');if(img)schema.image=new URL(img,origin).href;
   $('head').append(`<script type="application/ld+json" data-article-schema>${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>`);
  }
 }
 if(current==='/')$('head').append(`<script type="application/ld+json" data-site-schema>${JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'GAME NOTE',url:origin+url,inLanguage:en?'en':'zh-CN',publisher:{'@type':'Organization',name:'GAME NOTE',url:origin}})}</script>`);
 const canonical=$('link[rel=canonical]').attr('href');if(!/noindex/i.test($('meta[name=robots]').attr('content')||'')&&canonical===origin+url&&current!=='/search/')indexable.push(origin+url);
 if(!process.argv.includes('--khazan')||file.replaceAll('\\','/').includes('/games/the-first-berserker-khazan/'))writeFile(file,$.html()+'\n');
}
const urls=[...new Set(indexable)].sort();
writeFile(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${esc(u)}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Editorial metadata and source lists applied; fresh sitemap contains ${urls.length} unique URLs.`);
