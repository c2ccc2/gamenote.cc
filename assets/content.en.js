/* English metadata overlays the shared records, preserving IDs and associations. */
(()=>{
 const c=window.GAMENOTE_CONTENT;
 const games={
  islets:['Islets','Travel between broken islands, find magnetic cores and reconnect the world.'],
  'ender-lilies':['ENDER LILIES','Explore a kingdom beneath the rain of death and purify blighted spirits.'],
  'an-jing-wei-guang':['Well Dweller','Area, boss, ability, collectible, quest and achievement directories are ready. Detailed guides remain under verification.']
 };
 c.games=c.games.map(g=>games[g.id]?({...g,titleZh:games[g.id][0],description:games[g.id][1],...(g.id==='an-jing-wei-guang'?{guideUrl:'/en/games/an-jing-wei-guang/'}:{})}):g);
 const notes={
  'why-organize-game-guides-again':['Why Organize Game Guides Again?','Finding an answer and finding the answer needed right now are two different things.'],
  'why-an-jing-wei-guang-looks-like-an-old-guide-site':['Why Does the Well Dweller Guide Look Like a Website from Twenty Years Ago?','Traditional guide-site reading, built on a modern website.'],
  'mapping-a-metroidvania':['How a Metroidvania Map Is Organized','Start with recognizable landmarks, ability requirements and return routes, rather than a map that merely looks good.'],
  'after-islets':['After Islets: The Hardest Part of a Guide Is Not the Bosses','The challenge is turning “Where should I go now?” into a clear route at every stage of play.']
 };
 c.notes=c.notes.filter(n=>notes[n.slug]).map(n=>({...n,title:notes[n.slug][0],description:notes[n.slug][1]}));
 const updates=[
  ['Well Dweller V1 reference database established','Area, boss, ability, collectible, quest and achievement frameworks are ready. Detailed guides will be verified against video and gameplay evidence.'],
  ['Chapter, boss and map page scaffolding established','Five chapters, four boss templates and map detail pages are ready; gameplay content awaits verification.'],
  ['Classic content data and static generation established','Shared navigation, pagination and illustrated content components retain the classic reading layout.'],
  ['GAME NOTE CLASSIC framework established','The topic directory and walkthrough sections are ready; game content will follow verified playthroughs.'],
  ['Boss explanations and main-site links added','Added battle pacing notes and links to the main site.'],
  ['Main-site links and Pages deployment completed','Cross-site links and deployment checks are complete.'],
  ['GAME NOTE information architecture expanded','Established the Game Archive, Notes and update records.']
 ];
 updates.push(['Well Dweller: Guide Structure and Reading Improvements','Regional walkthroughs, bilingual pages and section navigation have been refined. System explanations are now separate from abilities, with improved reading tools.']);
 const updateKeys=['《黯井微光》第一版资料库建立','章节、Boss 与地图页面骨架建立','Classic 内容数据与静态生成机制建立','GAME NOTE CLASSIC 专题框架建立','补充 Boss 战斗说明与主站入口','主站链接与 Pages 部署完成','GAME NOTE 信息架构开始升级','《黯井微光》攻略结构与阅读体验更新'];
 c.updates=c.updates.filter(u=>updateKeys.includes(u.title)).map(u=>{const i=updateKeys.indexOf(u.title);return {...u,title:updates[i][0],description:updates[i][1]}});
 const readingUpdate=c.updates.find(u=>u.slug==='well-dweller-guide-reading-update');
 if(readingUpdate){const sections=[
  ['Regional Walkthroughs and Maps','Exploration steps, pickups and combat notes now live in the corresponding regional walkthroughs. Maps retain reference images and walkthrough links; existing text and screenshots are preserved.'],
  ['Bilingual Pages and Navigation','Switch between Chinese and English versions of the same chapter. Section names open their indexes, separate buttons collapse subsections, and desktop readers can collapse the entire directory.'],
  ['Illustrated Reading','Video timestamps and editorial process notes have been removed from the prose. Screenshots open in a preview dialog, with new-tab access and creator attribution retained.'],
  ['Abilities and Systems','The ability directory separates movement and core abilities from progression and utility unlocks. Systems now explain saves, oil bottles, trinket upgrades, map markers and shops instead of repeating the ability list.']
 ];readingUpdate.details=readingUpdate.details.map((section,index)=>({...section,title:sections[index][0],text:sections[index][1]}))}
})();
