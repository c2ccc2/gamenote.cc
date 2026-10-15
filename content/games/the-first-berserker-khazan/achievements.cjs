const rows=[
['combat','某人的痕迹','Traces of a Stranger','取得任意收集品。','Pick up a collection item.','collectibles/records/'],
['combat','战场必备之物','Combat Essentials','使用一次消耗品。','Use a consumable.','systems/'],
['combat','战力提升','Upgrade Stats','在存档点消耗拉克里玛提升属性。','Spend Lacrima on a stat at a Blade Nexus.','systems/'],
['combat','灵魂之泪','Tears of the Soul','返回死亡地点取回拉克里玛。','Recover the Lacrima left at your death location.','systems/#lacrima'],
['combat','致命一击','Finishing Strike','对可处决的敌人发动致命攻击。','Perform a Brutal Attack on a vulnerable enemy.','walkthrough/banished-hero/'],
['combat','偷袭','Ambush','从高处发动落斩并击杀敌人。','Kill an enemy with a drop attack.','walkthrough/banished-hero/'],
['combat','强者之技','Skilled Combatant','花费技能点学习战斗技能。','Spend a Skill Point on a combat ability.','systems/#skills'],
['combat','穿透之力','Piercing Power','发动一次标枪攻击。','Throw a Javelin.','walkthrough/snow-mountain-trial/'],
['combat','万全的准备','Fully Equipped','填满武器、防具与饰品装备栏。','Fill every weapon, armor and accessory slot.','equipment/'],
['combat','解放鬼石','Soulstone Unleashed','向达芙罗娜交付鬼石完成强化。','Purchase a Soulstone upgrade from Daphrona.','characters/daphrona/'],
['combat','苏醒的鬼神','Awakened Ghost','完成斯顿雪域的斗鬼后装备鬼神能力。','Equip a phantom after Stormpass’ Phantom of Combat.','side-quests/ston-snowfield-spirit/'],
['combat','特殊卷轴','Special Scroll','拾取一份特殊卷轴。','Acquire a special crafting scroll.','collectibles/scrolls/'],
['combat','灵魂的残余之力','Remnants of the Soul','让奥克萨娜从装备提取拉克里玛。','Extract Lacrima from gear through Oksana.','characters/oksana/'],
['combat','仿徨的灵魂','Wandering Soul','召唤裂隙之魂；无助力通关路线可选择红色敌对怨魂。','Summon a rift soul; use a red hostile revenant if pursuing the no-assistance ending.','walkthrough/forgotten-temple/'],
['collect','土罐的罐子',"Danjin's Jars",'找到一只罐子精灵。','Find a Jarling.','collectibles/jarlings/'],
['combat','铁匠的决心',"Blacksmith's Resolve",'让科兹玛卡分解一次装备。','Dismantle gear through Qazumaka.','characters/qazumaka/'],
['combat','精明能干的商人','Resourceful Merchant','向杜伊穆克购买物品。','Buy an item from Duimuk.','characters/duimuk/'],
['combat','契约','Pact','推进剧情，与幽魂之布雷德缔结契约。','Progress the story to the pact with Blade Phantom.','walkthrough/snow-mountain-trial/'],
['combat','匠人之手','Artisanship','获得配方后制作特殊物品。','Craft a special item from an acquired recipe.','characters/qazumaka/'],
['combat','巧手铁匠','Skilled Blacksmith','让科兹玛卡制作一件装备。','Craft gear through Qazumaka.','side-quests/blacksmith-heirloom/'],
['combat','商人的智慧',"Merchant's Wisdom",'向杜伊穆克出售物品。','Sell an item to Duimuk.','characters/duimuk/'],
['combat','卡莱多','Kaleido','完成寂静神庙后，通过奥克萨娜更改装备特性。','Alter a gear trait through Oksana after Silent Temple.','side-quests/silent-temple/'],
['combat','不屈的意志','Indomitable','通过奥克萨娜完成装备继承。','Use Oksana’s gear inheritance service.','characters/oksana/'],
['collect','吟诵复仇之人',"The Bard's Lamentations",'完成迪戈尔沿途五处会面：神庙、洞穴、山脉、剧院、皇都。','Meet Digor at the temple, cave, mountains, theatre and capital.','characters/bard/'],
['collect','罐子爱好者','Jar Enthusiast','找齐全部44只罐子精灵。','Locate all 44 Jarlings.','collectibles/jarlings/'],
['collect','冥界助力者','Agent of the Netherworld','破坏全部100块鬼石。','Destroy all 100 Soulstones.','collectibles/soulstones/'],
['collect','奥兹玛的过去',"Ozma's Past",'收齐15份金色剧情收集品，了解奥兹玛的真相。','Gather the 15 golden story records revealing Ozma’s past.','collectibles/records/'],
['ending','无尽的故事','Countless Tales','完成全部支线任务。','Finish every bonus mission.','side-quests/'],
['ending','挑战者之旅',"The Challenger's Journey",'通关并迎来结局。','Finish the campaign.','walkthrough/lord-of-chaos/'],
['ending','熟练者之旅',"The Expert's Journey",'以专家难度完成旅程；通关前不要降低难度。','Complete an Expert journey without lowering difficulty.','walkthrough/lord-of-chaos/'],
['ending','新的篇章','A New Path','通关后开启第二次旅程（新游戏＋）。','Begin New Game+ after the ending.','systems/#new-game-plus'],
['ending','独当一面','Standing Alone','在从未召唤助力之魂的情况下通关；红色敌对怨魂不属于助力之魂。','Reach the ending without using a Spirit of Advocacy; hostile red revenants are separate.','walkthrough/lord-of-chaos/'],
['ending','THE FIRST BERSERKER','THE FIRST BERSERKER','达成同名结局；提前完成金色剧情收集，并在皇宫达芙罗娜处选择追查真相的分支。','Reach the namesake ending; finish the golden story collection and choose the truth branch with Daphrona in the palace.','walkthrough/lord-of-chaos/#route-279'],
];
const bosses=[
['雪山统治者','Ruler of the Frozen Mountain'],['冥界斗鬼',"Netherworld's Phantom of Combat"],['狂龙之将',"Berserk Dragon's General"],['堕落的守护神','Fallen Guardian'],['变异之源','Origin of the Mutation'],['城中暴虐者','Slayer in the Citadel'],['混沌侵染者','Consumed by Chaos'],['无法挽回的……','No Turning Back'],['里侬的野兽',"Linon's Beast"],['归来的魔女','Return of the Witch'],['隐逸者','Hermit'],['嗜血狂徒','Bloodthirsty Fiend'],['佩鲁斯的悲剧','Tragedy of Pell Los'],['狂龙赫斯','Hismar the Berserk Dragon'],['褪色的记忆','Faded Memories']
];
const side=[
['两人的痕迹','Traces of Two','birth-of-evil'],['敢死队','The Order','suicide-squad'],['隐藏的实验室','The Hidden Laboratory','residual-chaos'],['绝命逃亡','Desperate Escape','last-command'],['莉丝的过去',"Reese's Past",'the-vow'],['冥界巫具','Tool of the Netherworld','charons-chains'],['剑的试炼','Trial of the Sword','transcendental-sword'],['人类塞伦斯','Human Xilence','final-subjugation'],['赤胆忠心','Undying Loyalty','unrequited-love','disobedience']
];
module.exports=guide=>{
 const bossPages=require('../../../scripts/lib/khazan-bosses.cjs')(guide);
 const items=rows.map(([group,zh,en,cz,ce,href])=>({group,zh:{name:zh,condition:cz},en:{name:en,condition:ce},href}));
 bosses.forEach(([zh,en],i)=>{const b=bossPages[i];items.push({group:'boss',zh:{name:zh,condition:'击败'+b.title.zh+'。'},en:{name:en,condition:'Defeat '+b.title.en+'.'},href:'bosses/'+b.id+'/'});});
 side.forEach(([zh,en,id,also])=>{const task=guide.side.find(t=>t.id===id),other=also&&guide.side.find(t=>t.id===also);items.push({group:'side',zh:{name:zh,condition:'完成“'+task.zh.title+'”'+(other?'及“'+other.zh.title+'”':'')+'相关剧情。'},en:{name:en,condition:'Complete '+task.en.title+(other?' and '+other.en.title:'')+'.'},href:'side-quests/'+id+'/',also:also?'side-quests/'+also+'/':null});});
 if(items.length!==57)throw Error('Expected 57 achievements, got '+items.length);
 return items.map((a,i)=>({...a,id:'achievement-'+(i+1)}));
};
