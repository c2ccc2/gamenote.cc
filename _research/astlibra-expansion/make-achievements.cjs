const fs=require('fs'),g=require('../../scripts/lib/astlibra-guide.cjs');
const src=require('./steam-records.json').slice(0,84);
const official='https://steamcommunity.com/achievements/1718570?l=schinese',wiki='https://w.atwiki.jp/astlibra/pages/71.html';
const overrides={
1:['收集与成长','收集 20 枚小徽章，并在嗼啾商店兑换。','沿主线收集，兑换顺序固定；不要只持有徽章而未兑换。','systems/medals/'],
2:['收集与成长','集齐并兑换本体与新章的 37 枚小徽章。','按区域核对徽章位置，再查看兑换奖励末项；达标未弹出时可保存后重启游戏。','systems/medals/'],
3:['收集与成长','填满自制道具图鉴，取得本体的全部道具。','按图鉴空位逐项补齐；注意十种封印奥义卷轴、装水的三种瓶、佩可奇拉滴露，以及最终武器精通的电池。','equipment/database/'],
20:['收集与成长','习得全部嘉隆能力。','先检查所有武器、盾牌、防具的精通奖励，再核对成长盘与特殊奖励；习得和装备是两回事。','skills/'],
21:['收集与成长','新章中强化至少一个天平挂盘。','再次取得天平后，在天平菜单选择挂盘强化。一次需要 50000 金币；先强化一侧，检查两侧效果是否抵消。','systems/libra/#upgrade'],
22:['难度与挑战','以“困难”或更高难度完成新章。','第二章出发前确认难度。之后可以调低，但不能随意调高；以全成就为目标时保留困难存档，不采用修改存档的方式补条件。','systems/beginners/#difficulty'],
43:['难度与挑战','打完斗技场全部杯赛后，击败追加的会长挑战。','先按杯赛列表清掉各项挑战，再进行会长战；保留补给与整备存档。','systems/arena/'],
46:['伙伴与结局','看完泊灵的两次同行事件。','新章开放同行后，带泊灵战斗提高好感；领取第一份爱情后再次同行，领取第二份并完成事件。','postgame/gaia/#companions'],
47:['伙伴与结局','看完盖乌的两次同行事件。','新章带盖乌同行战斗，分两轮领取爱情；不要在取得第一份爱情后就停止。','postgame/gaia/#companions'],
48:['伙伴与结局','看完白的两次同行事件。','带白同行，完成两轮好感与爱情事件；此前章节的选择不替代新章同行事件。','postgame/gaia/#companions'],
49:['伙伴与结局','看完黑的两次同行事件。','带黑同行战斗，分别领取两份爱情并读完事件对话。','postgame/gaia/#companions'],
50:['伙伴与结局','看完凯的两次同行事件。','带凯同行战斗并完成两次好感事件；累计获得两份爱情。','postgame/gaia/#companions'],
70:['隐藏首领','击败斗神杰拉丁。','入口位于王城外区域的石像线索：先读石像旁文字，再按其提示穿过石像后方的墙；战前另存档。','achievements/#hidden-route'],
79:['新章流程','完成新章的最终战与结尾剧情。','进入最终战前留存档，逐场完成连战并看完结尾；本条与“通关正传”分别计算。','postgame/gaia/#final-boss'],
80:['伙伴与结局','向阿努莉斯交付 13 份爱情，出现结局变化提示。','13 份触发“解放”；若爱情用于合成蛋糕，可先分解取回。后续第 14 份用于酒馆事件与最终武器。','postgame/love/'],
81:['伙伴与结局','交付第 14 份爱情后，在酒馆紧贴阿努莉斯使用“面包？”。','先完成结局变化与后续入会事件。触发失败时，暂时卸下金蝉脱壳、超级护甲等受击触发的嘉隆能力，再站到她身边使用。','postgame/love/'],
82:['主线流程','击败提线木偶。','第五章不带小百入城，并在与盖乌会合后回入口对话；主线错过时，新章魔王城再战也可补成就。','side-quests/ciro/'],
84:['总完成','取得本体其余 83 项成就。','含新章、六名隐藏首领、全道具、全嘉隆与困难通关；不要求外传的 15 项。','achievements/#roadmap']};
const bossRoutes={34:'walkthrough/chapter-1/#torch',35:'walkthrough/chapter-2/#bosses',36:'walkthrough/chapter-3/#boots',37:'walkthrough/chapter-4/#shrine',38:'walkthrough/chapter-5/#well',39:'walkthrough/chapter-6/#snow-boss',40:'walkthrough/chapter-7/#mountain',41:'walkthrough/chapter-8/#missiles',42:'walkthrough/chapter-8/#card',44:'walkthrough/final-chapter/',45:'postgame/awakening/',51:'walkthrough/chapter-1/#golden-dragon',52:'walkthrough/chapter-2/#bosses',53:'walkthrough/chapter-3/#agni',54:'walkthrough/chapter-4/#serpent',55:'walkthrough/chapter-5/#demon-king',56:'walkthrough/chapter-6/#ruins',57:'walkthrough/chapter-7/#karon',58:'walkthrough/chapter-8/#final-fights',59:'walkthrough/final-chapter/#final-fights',60:'postgame/awakening/#dream',61:'postgame/awakening/#libra',62:'postgame/wetland/#bosses',63:'postgame/volcano/#tower',64:'postgame/coast/#serpent',65:'postgame/castle/',66:'postgame/snow-ruins/',67:'postgame/future/#bosses',68:'postgame/gaia/#gauntlet',69:'postgame/gaia/#gauntlet',71:'bosses/loretta/',72:'bosses/adolphus/',73:'bosses/beatrice/',74:'bosses/unknown-creature/',75:'bosses/al-khamis/',76:'postgame/gaia/#final-boss',77:'postgame/gaia/',78:'postgame/gaia/#maze',83:'walkthrough/final-chapter/#trials'};
const arts={25:['成长盘解锁飞剑。','成长盘中先沿奥义节点推进。'],26:['取得并使用反击的奥义卷轴。','在贝尔克多火山回收相应卷轴。'],27:['取得并使用闪避的奥义卷轴。','按第一章宝箱图回收后跳卷轴。'],28:['成长盘解锁升剑。','沿成长盘推进，获得后试用操作。'],29:['取得并使用盾冲的奥义卷轴。','第四章海蛇洞窟取得相应卷轴。'],30:['取得并使用空剑的奥义卷轴。','魔王城阶段核对卷轴图表与宝箱位置。'],31:['取得并使用空步的奥义卷轴。','雪山与遗迹阶段核对卷轴图表。'],32:['取得并使用龙卷的奥义卷轴。','查询宝箱图与书籍图表，不把持有卷轴等同于已经学习。'],33:['在研究所用门卡取得并使用失重卷轴。','取得后能显著拓展跳跃与探索。']};
const stats={4:['凭依技使用次数','多在正常战斗中使用低消耗凭依技；次数到达阈值后检查战历。'],5:['凭依技使用次数','与杀敌、伙伴同行一起积累，先补最接近的累计目标。'],6:['累计金币收入','按累计收入核对，花钱不会等于清空累计收入。'],7:['累计金币收入','先做收集和新章路线，不必为保留现金而停止购买装备。'],8:['累计步数','跳跃和空步多的玩家注意实际步行统计。'],9:['累计步数','最后核对战历步数，缺少时用普通步行探索或回收地图。'],10:['角色等级','通过战斗积累经验，兼顾装备精通。'],11:['角色等级','通常留到新章与深渊探索补足。'],12:['累计力量晶体','通过战斗、探索积累，区别于嘉隆配置用的魔导水晶。'],13:['累计力量晶体','与成长盘及新章强化一起推进，按战历统计核对。'],14:['单次最大连击','选择敌人密集且能持续攻击的场景，先保持连段再补输出；累计打击数不能替代本条。'],15:['累计杀敌','与伙伴好感、精通和其他战历目标合并完成。'],16:['累计杀敌','先完成路线与收集，再补累计数量。'],17:['累计打击','连续命中与杀敌是两个计数，耐久较高的敌人也能贡献命中数。'],18:['累计打击','装备自动连击等操作辅助，在正常战斗中累计。'],19:['嘉隆习得数量','精通装备、成长盘解锁能力后核对嘉隆列表。'],23:['魔导水晶持有规模','通过装备精通与宝箱扩充配置容量，不要与彩色力量晶体混淆。'],24:['魔导水晶持有规模','继续核对精通奖励和地图宝箱，容量不够时先回收遗漏。']};
const records=src.map(r=>{let n=+r.id.slice(-3),group=n>=60&&n<=69||[45,76,77,78,79].includes(n)?'新章流程':n>=70&&n<=75?'隐藏首领':n>=25&&n<=33?'奥义学习':n<=24?'收集与成长':'主线流程';let condition=r.description,tip='跟随对应流程完成该场战斗，并看完战后剧情。',route=bossRoutes[n]||'systems/beginners/';
if(stats[n]){tip=stats[n][1];route=[19].includes(n)?'skills/':[23,24].includes(n)?'collectibles/':'achievements/#statistics';group=n<=18?'战历累计':'收集与成长'}
if(arts[n]){[condition,tip]=arts[n];route='equipment/books-cards/';if(n===33)route='walkthrough/chapter-8/#zero-gravity'}
if(overrides[n])[group,condition,tip,route]=overrides[n];
return {id:r.id,name:r.name,officialDescription:r.description,group,condition,tip,route,sources:[official,...(overrides[n]||arts[n]?[wiki]:[])]};});
fs.writeFileSync('content/games/astlibra-revision/achievements.json',JSON.stringify({checkedAt:'2026-10-21',scope:'Revision 本体及新章',baseCount:84,dlcCount:15,sources:[{title:'Steam 官方成就清单',url:official},{title:'ASTLIBRA Wiki：Revision 成就条件核对',url:wiki},{title:'Arioth：实玩基础指南与难度说明',url:'https://steamcommunity.com/sharedfiles/filedetails/?id=3310300881'}],records},null,2)+'\n');
