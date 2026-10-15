const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const archive=require('../../content/games/the-first-berserker-khazan/source-content.json');
const base=path.resolve(__dirname,'../../content/games/the-first-berserker-khazan');
const records=new Map();
for(const line of fs.readFileSync(path.join(base,'english-body.txt'),'utf8').split(/\r?\n/)){
 if(!line.trim())continue;
 const [page,index,...parts]=line.split('|'),key=page+':'+index,text=parts.join('|');
 if(records.has(key)||!text.trim())throw Error('Invalid English paragraph '+key);
 if(!archive.pages.find(p=>p.page===Number(page))?.blocks[Number(index)]?.text)throw Error('Unknown source block '+key);
 records.set(key,text);
}
function paragraph(page,index){
 const found=records.get(page+':'+index);if(found)return found;
 const text=archive.pages.find(p=>p.page===Number(page))?.blocks[index]?.text;
 if(text&&/^(攻击方式|二阶段.*方式|第二.*攻击方式).{0,8}[：:]$/.test(text)){
  const number=text.match(/[①②③④⑤⑥⑦⑧⑨⑩]/)?.[0]||'';
  const form=/第二形态/.test(text)?'Second form — ':'';
  return form+(/二阶段|第二阶段/.test(text)?'Phase two — ':'')+'Attack '+number+':';
 }
 throw Error('Missing English paragraph '+page+':'+index);
}
for(const page of archive.pages)page.blocks.forEach((b,i)=>{if(b.text)paragraph(page.page,i);});
const pairs=`押送令|Escort Order
某个士兵的记录|Soldier's Record
有关雪魈的记录|Record Concerning Yetis
班吉的识别牌|Bangi's Identification Tag
帝国士兵的日记|Imperial Soldier's Diary
某个班图战士的记录|Bantu Warrior's Record
某个班图预言家的记录|Bantu Prophet's Record
盗墓贼的手记|Grave Robber's Notes
冥界气息|Netherworld Energy
有关龙族的报告|Report on Dragonkin
侦查队员的破旧日记|Scout's Worn Diary
避难令|Evacuation Order
某个雪域学者的记录|Snowfield Scholar's Record
毒素抗性魔法卷轴|Poison Resistance Magic Scroll
消化了一半的观察记录|Half-digested Observation Record
铁匠工会许可证|Blacksmith Union Permit
通缉令：盗贼团账幕之刃|Wanted: Veiled Knives Bandits
鬼气弥漫的圣物|Ghostly Relic
沾染手垢的皇帝书信|Grimy Imperial Letter
吟游诗人卷轴|Bard Scroll
食人蛛卷轴|Maneater Spider Scroll
毒素召唤卷轴|Poison Summon Scroll
间谍的密信|Spy's Secret Letter
深邃无光卷轴|Deep Darkness Scroll
坦尼娅的实验记录|Tania's Experiment Log
鬼气弥漫的剑柄|Ghostly Sword Hilt
侦查队员的记录|Scout's Record
闪电净化魔法卷轴|Lightning Purification Magic Scroll
逃亡者卷轴|Fugitive Scroll
帝国哨兵的记录|Imperial Sentry's Record
尤利安的项链|Yulian's Necklace
劳役场行为准测|Labor Camp Rules
主教卷轴|Bishop Scroll
被水浸湿的日记|Water-soaked Diary
水净化魔法卷轴|Water Purification Magic Scroll
鬼气弥漫的兽牙护链|Ghostly Beast Fang Necklace
阿尔戴比勒的圆盘碎片|Aldevir Disc Fragment
鬼气弥漫的宝石|Ghostly Gem
未寄出的信|Unsent Letter
染血的委托书|Bloodstained Commission
猩红恶鬼卷轴|Crimson Fiend Scroll
幻觉净化魔法卷轴|Illusion Purification Magic Scroll
鬼气弥漫的锤子|Ghostly Hammer
随从兰提莫斯的日记|Attendant Lantimos's Diary
鬼气弥漫的盾牌|Ghostly Shield
预言|Prophecy
大将军卷轴|Great General Scroll
瓦尔萨勒的圆盘碎片|Vaisar Disc Fragment
破旧的日记本|Worn Diary
鎏金卷轴|Gilded Scroll
皇室音乐教师的手记|Royal Music Teacher's Notes
中央大剧院钥匙|Central Theatre Key
罗维利恩的圆盘碎片|Rovelion Disc Fragment
赫斯讨伐战|Hismar Campaign
鬼气弥漫的枪刃|Ghostly Spear Blade
关于莉丝|About Reese
黑月升起之日|The Day the Black Moon Rose
狂龙赫斯搬运日记|Hismar's Transport Diary
鬼气弥漫的双剑|Ghostly Dual Blades
屠戮者卷轴|Slaughterer Scroll
维拉德斯的忏悔录|Vilades's Confession
神殿骑士卷轴|Temple Knight Scroll
大地净化魔法卷轴|Earth Purification Magic Scroll
褪色回忆卷轴|Faded Memories Scroll
混沌之主卷轴|Lord of Chaos Scroll
少年的日记|Boy's Diary
火召唤卷轴|Fire Summon Scroll
幸福的少年和鹿|Happy Boy and Deer
堕落守护神卷轴|Fallen Guardian Scroll
没落君主卷轴|Fallen Monarch Scroll
某个魔法学者的记录|Magic Scholar's Record
猎杀者卷轴|Hunter Scroll
混沌蚕食卷轴|Chaos Erosion Scroll
愤怒盗贼卷轴|Angry Bandit Scroll
刺客秘方|Assassin Recipe
盗贼的指令|Bandit's Orders
战士卷轴|Warrior Scroll
野兽虐杀者卷轴|Beast Slaughterer Scroll
生命创造之旅|Journey of Life's Creation
冰封雪山卷轴|Frozen Mountain Scroll
噬魂者卷轴|Soul Eater Scroll
沉水魔女卷轴|Drowned Witch Scroll
龙鳞卷轴|Dragon Scale Scroll
逃亡魔法师卷轴|Fugitive Mage Scroll
死灵术研究日记|Necromancy Research Diary
死灵书研究日记|Necromancy Research Diary
歌唱之鹰的头发|Singing Hawk's Hair
父亲的遗书|Father's Last Letter
染血的护卫军记录|Bloodstained Guard Record
嗜血狂徒卷轴|Bloodthirsty Fiend Scroll
梦殇之影卷轴|Nightmare Shadow Scroll
圣职者的记录|Cleric's Record
敢死队的决意|Suicide Squad's Resolve
第九十九只猫头鹰的遗书|Ninety-ninth Owl's Last Letter
埃拉梅因的笔记|Elamein's Notes
无尽悲剧卷轴|Endless Tragedy Scroll
艾芙琳的手记|Evelyn's Notes
尤利安妻子的信|Yulian's Wife's Letter
小丑的短剑|Clown's Dagger
雪怪攻击方式|Yeti attacks
精英怪攻击方式|Armored elite attacks
巨剑试炼|Greatsword trial
巨熊招式|Bear attacks
士兵的日记|Soldier's Diary
长枪试炼|Spear trial
刀斧试炼|Dual Wield trial
救援贝罗妮卡|Helping Veronika
开启首领门与助力之魂|Boss gate and spirit summons
首领前存档点|Resting before the boss
首领前存档|Resting before the boss
图书馆两翼与书柜密道|Library wings and bookshelf passage
进入皇宫|Entering the Imperial Palace
皇宫侧路|Palace side paths
打开皇宫捷径|Opening the palace shortcuts
最终存档点|Final Blade Nexus
结局收尾|Epilogue
边界裂缝与任务入口|The Crevice and mission portal
雪魈王|Yetuga
沃尔巴依诺-鹿头|Volbaino
阿拉特拉-蜘蛛|Aratra
凯斯塔|Keshta
贝里乌斯|Berius
亡灵士兵|Undead soldiers
蝰蛇|Viper
朗格斯|Rangkus
玛路卡|Maluka
沙克图卡|Shactuka
狂龙赫斯|Hismar`;
const dictionary=new Map(pairs.split('\n').map(s=>s.split('|')));
function title(text){
 if(dictionary.has(text))return dictionary.get(text);
 let output=text.replace(/（([一二三四])）/g,(_,n)=>' '+({一:'I',二:'II',三:'III',四:'IV'})[n]);
 for(const [zh,en] of [...dictionary].sort((a,b)=>b[0].length-a[0].length))output=output.replaceAll(zh,en);
 output=require('./khazan-names.cjs')(output,'en');
 return output.replaceAll('通缉令盗贼团账幕之刃','Wanted: Veiled Knives Bandits').replaceAll('首领战','Boss encounter').replaceAll('收集：','').replaceAll('罐子精灵','Jarling').replaceAll('罐子','Jarling').replaceAll('鬼石','Soulstone ').replaceAll('进入 ','Entering ').replaceAll('-回血+1',' upgrade').replaceAll('+1',' upgrade').replaceAll('：',': ').replaceAll('、',', ').replaceAll('，',', ');
}
const signature=crypto.createHash('sha256').update(JSON.stringify(archive.pages.map(p=>[p.page,p.blocks.map(b=>b.text||null)]))).digest('hex');
const expected=fs.readFileSync(path.join(base,'english-source-sha256.txt'),'utf8').trim();
if(signature!==expected)throw Error('Chinese source changed: review English paragraph alignment before rebuilding');
module.exports={paragraph,title,records};
