// Descriptions and locations follow the local walkthrough; rewards are only recorded when explicit.
const rows=[
 ['雪山中的巨型雪怪，是卡赞旅途中遇到的第一个正式BOSS。','A giant yeti and the first major boss of Khazan’s journey.','哈因马赫','Heinmach'],
 ['来自冥界的幽魂，试图夺取卡赞的身体；战斗后双方缔结契约。','A Netherworld phantom seeking Khazan’s body; their battle leads to a pact.','斯顿雪域','Stormpass'],
 ['龙族首领，战斗包含两种形态，每种形态还会随血量变化进入新阶段。','A dragonkin leader with two forms, each gaining new attacks as health falls.','恩巴斯遗迹','Embars Ruins'],
 ['在村庄追杀居民的鹿首敌人，以重锤和火焰改变战斗场地。','A deer-headed foe who attacks villagers and changes the arena with hammer strikes and fire.','普拉乌村庄','Phraugh Village'],
 ['盘踞洞穴的巨型蜘蛛，使用毒液、蛛丝与高速突刺，巢穴中困着铁匠。','A giant cave spider using venom, webs and rapid thrusts; the blacksmith is trapped in its lair.','斯科帕洞穴','Skoffa Cave'],
 ['追杀帕维尔与特利斯坦的壮汉，使用锤击、火铳和大范围爆炸。','The attacker pursuing Pavel and Tristan, armed with hammer strikes, gunfire and wide explosions.','帕莱密恩城塞','Palemion Citadel'],
 ['埃拉梅因提到的敌人，以巨剑作战，进入第二阶段后攻势发生变化。','The enemy named by Elamein, wielding a greatsword and changing tactics in the second phase.','纳丁采石场','Nadin Quarry'],
 ['曾帮助卡赞追查帕维尔的女战士，此时已受到混沌侵蚀，使用剑盾和雷电攻击。','Khazan’s former guide in the pursuit of Pavel, now corrupted and fighting with sword, shield and lightning.','埃拉瓦卡村庄','El Ravaca Village'],
 ['埋伏者放出的合成兽，近身连击迅速，并带有瘟疫威胁。','A plague-bearing composite beast released from an ambush, with rapid close-range attacks.','里侬矿山','Linon Mine'],
 ['得到奥兹玛力量的法师，使用水球、水柱与雨幕攻击。','A mage empowered by Ozma, wielding water orbs, columns and rain.','阿尔戴比勒','Lake City Aldevir'],
 ['暗夜精灵死灵法师，误以为卡赞受奥兹玛控制而发动攻击，之后误会得到化解。','A dark elf necromancer who attacks Khazan after mistaking him for Ozma’s creation.','莱帕兰山脉','Rephalan Mountains'],
 ['背着棺材的大剑战士，受到混沌侵蚀；第一管血耗尽后仍会继续战斗。','A corrupted greatsword warrior carrying a coffin; the battle continues after the first health bar.','瓦尔萨勒关门','Vaisar Gate'],
 ['受到混沌侵蚀的帝国皇女，一阶段近战，半血后转为法师形态。','The corrupted imperial princess, shifting from melee combat to a caster form at half health.','罗维利恩中央大剧院','Rovelion Imperial Theatre'],
 ['曾被卡赞与奥兹玛共同讨伐的狂龙，尸体受到混沌影响后再度活动。','The dragon once defeated by Khazan and Ozma, whose corpse is reanimated by chaos.','维塔隆皇都','Capital City Vitalon'],
 ['与奥兹玛有着深厚羁绊的莉丝，在原定婚礼举行的大神殿化为血色新娘。','Ozma’s beloved, transformed into a bloodstained bride in the temple intended for their wedding.','大神殿','Great Temple'],
 ['卡赞昔日的挚友，也是调查混沌的最终目标；此前的结局选择会影响战斗阶段。','Khazan’s former companion and the final target of the chaos investigation; earlier choices affect the battle phases.','皇宫','Imperial Palace'],
];
const drops={0:['装备与道具','Equipment and items'],1:['装备','Equipment'],2:['装备与道具','Equipment and items'],3:['装备','Equipment'],4:['装备','Equipment'],5:['装备','Equipment'],6:['装备','Equipment'],8:['装备','Equipment'],13:['屠戮者卷轴','Slaughterer Scroll'],14:['褪色回忆卷轴','Faded Memories Scroll'],15:['混沌之主卷轴','Lord of Chaos Scroll']};
module.exports=rows.map(([zh,en,areaZh,areaEn],i)=>({intro:{zh,en},area:{zh:areaZh,en:areaEn},drops:drops[i]?{zh:[drops[i][0]],en:[drops[i][1]]}:null}));
