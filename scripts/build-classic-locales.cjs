// Static paired pages: human-authored text translations, not runtime machine translation.
const writeFile = require('./lib/write-file.cjs');
const fs=require('node:fs'),path=require('node:path'),cheerio=require('cheerio');
const {loadClassicData,confirmed,approvedImage}=require('./lib/classic-data.cjs');
const root=path.resolve(__dirname,'..'),base='/games/an-jing-wei-guang/',origin='https://gamenote.cc',data=loadClassicData(root);
const labels=require('../content/games/an-jing-wei-guang/labels-zh.json'),ui=require('../content/games/an-jing-wei-guang/ui-en.json'),video=require('../content/games/an-jing-wei-guang/video-en.json');
const dictionary=new Map(Object.entries(ui)),untranslated=new Set();
for(const item of require('../content/games/an-jing-wei-guang/reference-refresh.json').entries)for(const field of Object.values(item.fields))field.zh.forEach((text,index)=>dictionary.set(text,field.en[index]));
for(const area of require('../content/games/an-jing-wei-guang/late-walkthrough.json').areas){
 for(const key of ['goal','before'])dictionary.set(area.zh[key],area.en[key]);
 for(const key of ['nodes','check'])area.zh[key].forEach((text,index)=>dictionary.set(text,area.en[key][index]));
 area.zh.steps.forEach((step,index)=>{dictionary.set(step.title,area.en.steps[index].title);dictionary.set(step.text,area.en.steps[index].text)});
 for(const id of area.next){const record=data.areas.find(record=>record.id===id);dictionary.set('后续区域：'+(labels[record.nameEn]||record.nameEn),'Next area: '+record.nameEn)}
}
for(const [zh,en] of Object.entries({'按节点推进':'Follow the Checkpoints','本段目标':'Goal','入区准备':'Before Entering','路线节点示意':'Route checkpoints','GAME NOTE 原创节点示意 · 不代表实际房间地图':'Original GAME NOTE checkpoint diagram · not a room map','离开前检查':'Before Leaving','后续攻略':'Related guides','首领战要点':'Boss battle notes','护送任务':'Escort quest','兄弟姐妹任务':'Sibling quest'}))dictionary.set(zh,en);
for(const [zh,en] of Object.entries({'参考推进路线':'Reference Route','参考战斗要点':'Battle Notes','收集核对要点':'Collection Notes','参考区域定位':'Regional Orientation'}))dictionary.set(zh,en);
dictionary.set('攻略整理进度','Guide Progress');
dictionary.set('机关解法','Puzzle Solutions');
dictionary.set('通关后的探索','Postgame Exploration');
dictionary.set('击败女王后先到寝室拿金币。集齐 32 件饰物打开寝室西门，学会腾空，再拿神秘标记。找到五枚灵魂碎片后，回夜之庭园的灵魂鸟巢触发真结局。','After defeating the Queen, collect the coin in her chambers. Gather all 32 trinkets to open the western door, learn Soar and collect Mysterious Markings. Return to the Night Garden spirit nest with all five Spirit Fragments for the true ending.');
dictionary.set('女王金币','The Queen’s Coin');
dictionary.set('奖励收集攻略','Reward collection guide');
dictionary.set('查看对应收集清单','Open the related collection checklist');
dictionary.set('通关后五处腾空入口与辨认地标。','Five postgame Soar entrances and their landmarks.');
dictionary.set('通关后在女王寝室解锁腾空，再到能力蛋所在鸟巢的上方拿神秘标记。地图标出的五处入口可按下列地标查找。','After the ending, unlock Soar in the Queen’s chambers and collect Mysterious Markings above the Ability Egg nest. Use these landmarks to find the five entrances marked on the map.');
dictionary.set('腾空入口','Soar entrances');
dictionary.set('主线途中','During the main story');
dictionary.set('在存档帐篷的拾荒者商店可购买玻璃眼，标价 450。装备后可看见隐藏通道。寻找入口时可先装备它，再按各条路线准备攀爬或腾空等能力。','Buy the Glass Eye from Looter’s shop in the Save Tent for 450 at its listed price. Equip it to reveal hidden passages, then check each route for traversal abilities such as Climb or Soar.');
dictionary.set('玻璃眼获取与效果','Glass Eye acquisition and effect');
dictionary.set('隐藏入口','Hidden entrances');
dictionary.set('墓谷','Graven Valley');
dictionary.set('学会攀爬后，检查灵魂所在房间的左上角，沿隐藏通道进去拾取。','Once you have Climb, check the upper-left corner of the spirit’s room for the hidden passage.');
dictionary.set('击败森林之王后，进入放金羽毛的房间。找伊尔达右侧的隐藏通道，里面有一页故事。','After defeating the Forest King, enter the Golden Feather room. Take the hidden passage to Ilda’s right for a story page.');
dictionary.set('收集实机图文','Illustrated collectible walkthrough');
dictionary.set('埋葬墓穴：故事页地图','Burial Vault: story page map');
dictionary.set('埋葬墓穴：工坊代币地图','Burial Vault: Workshop Token map');
dictionary.set('玩偶师之家：工坊代币地图','Dollmaker’s House: Workshop Token map');
dictionary.set('埋葬墓穴','Burial Vault');
dictionary.set('玩偶师故事页的房间可对照下方图文的 Story Page 18/23 地图。另一处暗道对应 Workshop Token 25/27。带上悬停、无限攀爬和墙壁弹射，进暗道后打破挡路的障碍。','Use the Story Page 18/23 map in the linked walkthrough to locate the Dollmaker page. For the other passage, see Workshop Token 25/27. Bring Hover, Endless Climb and Wall Sling, then break the barrier inside.');
dictionary.set('对照下方图文的 Workshop Token 26/27 地图找到房间，带上弹弓与无限攀爬，爬入暗道取得代币。','Use the Workshop Token 26/27 map in the linked walkthrough to locate the room. Bring Slingshot and Endless Climb, then climb into the passage for the token.');
dictionary.set('入口地标','Entrance landmark');
dictionary.set('最高一层通道的中央房间。向上腾空进入隐藏区。','Soar from the middle room on the top corridor.');
dictionary.set('与沼泽相接的最西侧房间。腾空进入上方战斗房。','Soar from the far-west room connecting to the Bog to reach the combat room above.');
dictionary.set('计时挑战房西侧的房间。向上腾空进入平台跳跃路线。','Soar from the room west of the time trial to enter the platforming route.');
dictionary.set('低语者小屋旁的帐篷向东，到桥上腾空。','Head east from the tent near Whisper’s hut and Soar from the bridge.');
dictionary.set('东南角帐篷右侧的鸟巢。站在巢上腾空进入隐藏塔。','Soar from the nest to the right of the southeastern tent to enter the hidden tower.');
dictionary.set('五枚灵魂碎片路线','All five Spirit Fragment routes');
dictionary.set('通关后地图参考','Postgame route map');
dictionary.set('沼泽帐篷捷径、下水道机关门与女王寝室的开门方法。','How to open the Bog tent shortcut, the Drains switch door and the Queen’s chambers.');
dictionary.set('帐篷右侧的路被挡住时，先往左越过平台。进入有气泡的房间，借气泡升到顶层，向右经过飞虫，从右侧出口下落。到了路障另一边，打一下开关就能开通回帐篷的捷径。','When the path right of the tent is blocked, go left across the platforms. Ride the bubbles to the top, pass the fly on the right and drop from the right exit. Hit the switch on the far side of the blockade to open the shortcut.');
dictionary.set('升降机抵达底层后一路向右，找聚在开关下方的青蛙。用弹弓击中上方的开关，打开右边的门。','After the elevator reaches the bottom, go right until you see frogs gathered beneath a switch. Hit the switch with the Slingshot to open the door on the right.');
dictionary.set('通关后回女王战场上方，与锁门旁的拾荒者对话，再敲天花板拉杆进入寝室。寝室西门要集齐 32 件饰物才能打开。','After the ending, return above the Queen’s arena. Speak to Looter by the locked door and strike the ceiling lever to enter her chambers. The western door requires all 32 trinkets.');
dictionary.set('沼泽捷径参考','The Bog shortcut reference');
dictionary.set('下水道开门参考','The Drains door reference');
dictionary.set('沼泽的两处可破坏墙壁与通过方法。','Two breakable walls in the Bog and how to pass them.');
dictionary.set('沿下层通道向左走，清掉沿路敌人。打破房间左下角的墙，从低矮缺口滑进下一间，继续左行可遇见被飞虫围攻的伊尔达。','Follow the lower route left and clear the enemies. Break the wall in the lower-left corner, slide through the low gap and continue left to find Ilda under attack by flies.');
dictionary.set('从存档帐篷向左越过平台，看到前方的可破坏墙壁时，同时检查头顶。打破面前的墙和上方的表面，再继续向左。','Head left from the Save Tent across the platforms. At the breakable wall, check directly above you. Break both surfaces before continuing left.');
dictionary.set('沼泽流程','The Bog walkthrough');
dictionary.set('沼泽破墙实机路线','The Bog breakable wall reference');
dictionary.set('通关后参考','Postgame Reference');
dictionary.set(data.areas.filter(e=>e.publish).length+' 个区域已有路线或参考节点',data.areas.filter(e=>e.publish).length+' areas have routes or reference checkpoints');
dictionary.set(data.bosses.filter(e=>confirmed(e.fields.referenceStrategy)||confirmed(e.fields.attacks)).length+' 场遭遇已有战斗要点',data.bosses.filter(e=>confirmed(e.fields.referenceStrategy)||confirmed(e.fields.attacks)).length+' encounters have battle notes');
dictionary.set(data.quests.filter(e=>e.publish).length+' 条任务已有推进提示',data.quests.filter(e=>e.publish).length+' quests have progression notes');
dictionary.set('41 项成就','41 Achievements');
dictionary.set('收起栏目','Collapse section');
dictionary.set('全部收起','Collapse all');
dictionary.set('收起所有二级菜单','Collapse all submenu groups');
dictionary.set('查看区域结构示意','View the regional structure diagram');
dictionary.set('可查看的局部地图','Available Partial Maps');
for(const [zh,en] of Object.entries({'区域地图 · 局部裁切':'Regional Map — Cropped Detail','放大区域地图':'Enlarge the regional map','仅显示录像当时的已探索部分，不代表完整区域或全收集。原视频作者：好吃的香草雪球。':'Explored areas visible at this point in the footage, not a complete regional or collectible map. Video creator: 好吃的香草雪球.','查看完整原画面':'View the uncropped source frame','原视频作者':'Original video creator'}))dictionary.set(zh,en);
for(const crop of require('../content/games/an-jing-wei-guang/map-crops.json'))dictionary.set(crop.titleZh+'已探索局部地图',crop.titleEn+' explored map detail');
for(const [zh,en] of Object.entries({'局部地图参考':'Partial Map References','场景识别参考':'Scene Landmarks','地图定位与地标':'Map Orientation and Landmarks','区域定位资料':'Regional Orientation','地标 / 节点':'Landmark / Node','识别方式':'How to Identify It','地图阅读提示':'Map Reading Notes','该区域的地图位置资料尚待补充。':'Location references for this region have not yet been added.','地图章节提供局部地图与地标定位；完整路线步骤仍在流程攻略中阅读。':'Map pages provide partial maps and landmark orientation; detailed route steps remain in the walkthroughs.','已补充区域':'Regions with Reference Material','可用地图资料':'Available Map References','区域':'Region','现有内容':'Available Content','局部地图与地标定位':'Partial maps and landmarks','地标定位与区域结构视图':'Landmarks and regional structure views'}))dictionary.set(zh,en);
for(const notes of require('../content/games/an-jing-wei-guang/regional-map-notes.json')){if(notes.rows.length!==notes.rowsEn.length)throw Error('Missing regional map translations');notes.rows.forEach((row,index)=>row.forEach((text,column)=>dictionary.set(text,notes.rowsEn[index][column])))}
for(const [zh,en] of Object.entries({'世界地图 · 区域结构示意':'World Map — Regional Structure','区域结构视图':'Regional Structure View','世界结构示意图':'World Structure Diagram','区域地图入口':'Regional Map Index','区域结构示意：排布不代表真实方位，箭头仅表示已核对的流程衔接。本版不标注未经确认的房间轮廓与收集坐标。':'Regional schematic: placement is not geographic. Arrows show reviewed route sequence only; unverified room geometry and collectible coordinates are not plotted.','地图查看区域':'Map viewport','放大结构示意图':'Enlarge the structure diagram','GAME NOTE 原创绘制 · 点击图片放大；小屏可横向滚动。':'Original GAME NOTE diagram · Click to enlarge; scroll sideways on small screens.','区域资料参考：Gamer Guides':'Regional reference: Gamer Guides'}))dictionary.set(zh,en);
dictionary.set('Steam 成就共 41 项。','There are 41 Steam achievements.');
dictionary.set('参考资料','Reference');dictionary.set('相关目录','Related Directories');dictionary.set('能力与获取方式','Abilities and Acquisition');
for(const section of require('../content/games/an-jing-wei-guang/systems-reference.json')){dictionary.set(section.title,section.titleEn);dictionary.set(section.text,section.textEn);dictionary.set(section.relatedLabel,section.relatedLabelEn)}
dictionary.set('《黯井微光》攻略结构与阅读体验更新','Well Dweller: Guide Structure and Reading Improvements');
dictionary.set('区域图文流程、中英文页面与栏目导航完成一轮整理，系统说明独立补充，阅读体验同步优化。','Regional walkthroughs, bilingual pages and section navigation have been refined. System explanations are now separate from abilities, with improved reading tools.');
for(const item of require('./lib/classic-reader-copy.cjs').replacements)dictionary.set(item.zh,item.en);
for(const [zh,en] of Object.entries({'移动 / 核心能力':'Movement / Core Abilities','推进 / 功能解锁':'Progression / Utility Unlocks','作用':'Effect','获取方式 / 地点':'Acquisition / Location','资料状态':'Reference Status','参考来源':'Sources','网页资料已核对':'Guide reference checked','作用已核对 · 位置待确认':'Effect checked · location unconfirmed','参考作用':'Effect','参考获取方式':'Acquisition'}))dictionary.set(zh,en);
for(const item of require('../content/games/an-jing-wei-guang/ability-reference.json').entries){dictionary.set(item.effect,item.effectEn);dictionary.set(item.acquisition,item.acquisitionEn)}
for(const [zh,en] of Object.entries(require('../content/games/an-jing-wei-guang/details-en.json')))dictionary.set(zh,en);
const p1=require('../content/games/an-jing-wei-guang/p1-en.json');
for(const [id,texts] of Object.entries(p1)){const blocks=data.areas.find(a=>a.id===id).fields.guide.value;if(blocks.length!==texts.length)throw Error('P1 translation count mismatch');blocks.forEach((b,index)=>dictionary.set(b.text,texts[index]))}
for(const e of data.achievements)dictionary.set(e.description,e.descriptionEn);
for(const [english,chinese] of Object.entries(labels))dictionary.set(chinese,english);
for(const records of Object.values(data).filter(Array.isArray))for(const record of records){if(confirmed(record.fields.nameZh)&&record.nameEn)dictionary.set(record.fields.nameZh.value,record.nameEn)}
for(let part=2;part<=7;part++){
 const chapters=require('../_research/an-jing-wei-guang/p'+part+'-map-notes.json');const items=chapters.flatMap(c=>c.items);
 if(items.length!==video[part].length)throw Error('Translation count mismatch for P'+part);
 items.forEach((item,index)=>{dictionary.set(item.title,video[part][index][0]);dictionary.set(item.text,video[part][index][1])});
}
for(const area of data.areas){for(const field of ['guide','mapGuide'])for(const block of area.fields[field]?.value||[]){if(block.type==='heading'&&block.text.startsWith('★ ')){const label=block.text.replace(/^★ /,'').replace(/：区域图文记录$/,'');const enLabel=area.nameEn+(label.includes('回访')?' revisited':label.includes('补给')?' — preparations':'');dictionary.set(block.text,'★ '+enLabel+' — illustrated walkthrough')}}}
function translate(text){
 const space=text.match(/^\s*/)[0],end=text.match(/\s*$/)[0],value=text.trim();if(!value)return text;
 if(dictionary.has(value))return space+dictionary.get(value)+end;
 let result=value;for(const [zh,en] of [...dictionary].sort((a,b)=>b[0].length-a[0].length))if(zh.length>1)result=result.split(zh).join(en);
 result=result.replace(/ · 更新于 /,' · Updated ').replace(/已确认区域资料与流程记录。/,' — reviewed area walkthrough.').replace(/已确认区域节点；截图不等同于完整地图。/,' — reviewed map references, not a complete map.');
 if(/[\u3400-\u9fff]/.test(result)){untranslated.add(value);return space+'Translation in progress; please use the Chinese version for this note.'+end}
 return space+result+end;
}
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):entry.name==='index.html'?[path.join(dir,entry.name)]:[]);
const all=files(path.join(root,base)),urls=[];
const switcher=(route,en)=>`<nav class="classic-language-switch" aria-label="${en?'Language':'语言'}"><details class="language-menu"><summary aria-label="${en?'Choose language':'选择语言'}"><span aria-hidden="true">◎</span> ${en?'English':'简体中文'} <span class="language-chevron" aria-hidden="true"></span></summary><div class="language-menu-options" role="group" aria-label="${en?'Language':'语言'}"><a href="${route}" lang="zh-CN" hreflang="zh-CN"${en?'':' aria-current="page"'}>简体中文</a><a href="/en${route}" lang="en" hreflang="en"${en?' aria-current="page"':''}>English</a></div></details></nav>`;
const imageRecords=Object.values(data).filter(Array.isArray).flat().flatMap(record=>record.images||[]).concat(data.game.images);
for(const file of all){
 const route='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,''),zh=cheerio.load(fs.readFileSync(file,'utf8'));
 zh('[data-achievement-language],.classic-language-switch,link[hreflang]').remove();
 zh('head').append(`<link rel="alternate" hreflang="zh-CN" href="${origin+route}"><link rel="alternate" hreflang="en" href="${origin+'/en'+route}"><link rel="alternate" hreflang="x-default" href="${origin+route}"><link rel="stylesheet" href="/assets/classic-language.css">`);
 zh('.classic-main > header').prepend(switcher(route,false));writeFile(file,zh.html()+'\n');
 const en=cheerio.load(zh.html());en('.classic-language-switch').remove();
 function walk(node){if(node.type==='text')node.data=translate(node.data);else if(!['script','style','figcaption'].includes(node.name))for(const child of node.children||[])walk(child)}walk(en('body')[0]);
 en('html').attr('lang','en');en('title').text('Well Dweller — '+translate(zh('h1').text())+' | GAME NOTE CLASSIC');
 en('link[rel=canonical],meta[property="og:url"]').each((_,node)=>en(node).attr(node.name==='link'?'href':'content',origin+'/en'+route));
 en('meta[name=description],meta[property="og:description"]').attr('content','Well Dweller — '+translate(zh('h1').text())+'. Reviewed guide notes and reference material.');en('meta[property="og:title"]').attr('content',en('title').text());
 en('[aria-label],img[alt]').each((_,node)=>{for(const attr of ['aria-label','alt'])if(en(node).attr(attr))en(node).attr(attr,translate(en(node).attr(attr)))});
 en('img[src],a[href]').each((_,node)=>{const attr=node.name==='img'?'src':'href',url=en(node).attr(attr);if(url?.startsWith(base+'images/maps/')||url?.startsWith(base+'images/routes/'))en(node).attr(attr,url.replace(/-zh\.svg$/,'-en.svg'))});
 en('a[href]').each((_,node)=>{const a=en(node),href=a.attr('href');if((href.startsWith(base)&&! /\.(webp|png|jpe?g|gif|avif|svg)(?:[?#]|$)/i.test(href))||/^\/(?:notes|updates)\/[^/]+\/$/.test(href)||['/','/games/','/notes/','/updates/','/about/','/search/'].includes(href))a.attr('href','/en'+href)});
 en('.classic-main > header').prepend(switcher(route,true));
 en('.classic-main > header > .classic-subtitle').first().text('Guide in progress · Updated '+data.updatedAt);en('.classic-main > header > .classic-subtitle').eq(1).text('GAME NOTE CLASSIC · Well Dweller');
 en('.classic-banner strong').text('Well Dweller');en('.classic-banner small').text('GAME NOTE CLASSIC · Illustrated guide');
 en('.classic-footer').html('<a href="/en/">Back to GAME NOTE</a> · Reviewed notes are published individually; the guide is still in progress.');
 en('figure').each((_,node)=>{const fig=en(node),img=fig.find('img'),record=imageRecords.find(i=>i.src===img.attr('src'));if(!record){fig.find('figcaption').each((_,caption)=>en(caption).text(translate(en(caption).text())));return;}const caption=translate(record.caption);img.attr('alt',caption);fig.find('figcaption').text(caption+(record.type==='video-frame'?' · Creator: 好吃的香草雪球':''))});
 const achievement=data.achievements.find(e=>route===base+'achievements/'+e.slug+'/');
 if(achievement){en('h1').text(achievement.nameEn);en('.classic-main > article').html(`<p>${escape(achievement.descriptionEn)}</p><p><a href="https://steamcommunity.com/stats/3699590/achievements/?l=english">Steam English achievement list</a></p><h2 class="classic-heading">Related guides</h2><ul class="classic-links"><li><a href="/en${base}achievements/">Achievement index</a></li></ul>`)}
 if(route===base+'achievements/')en('.classic-main > article').html('<p>Well Dweller has 41 Steam achievements. The names and descriptions below use the official English Steam text.</p><div class="classic-table-wrap" tabindex="0" role="region" aria-label="Achievements"><table class="classic-table"><caption>Steam achievements</caption><thead><tr><th scope="col">Achievement</th><th scope="col">Official description</th></tr></thead><tbody>'+data.achievements.map(e=>`<tr><td><a href="/en${base}achievements/${e.slug}/">${escape(e.nameEn)}</a></td><td>${escape(e.descriptionEn)}</td></tr>`).join('')+'</tbody></table></div>');
 const dest=path.join(root,'en',route,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});writeFile(dest,en.html()+'\n');
 if(!/noindex/.test(en('meta[name=robots]').attr('content')||''))urls.push('/en'+route);
}
function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const sitemap=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8').replace(/\s*<url><loc>https:\/\/gamenote.cc\/en\/games\/an-jing-wei-guang\/[^<]*<\/loc><\/url>/g,'');xml=xml.replace('</urlset>',urls.map(url=>`<url><loc>${origin+url}</loc></url>`).join('\n')+'\n</urlset>');writeFile(sitemap,xml);
writeFile(path.join(root,'_research/an-jing-wei-guang/english-pending.json'),JSON.stringify([...untranslated],null,2)+'\n');
console.log(`Generated ${all.length} paired Classic pages (${urls.length} English indexable); untranslated notes are explicitly labelled, never mixed into English prose.`);
