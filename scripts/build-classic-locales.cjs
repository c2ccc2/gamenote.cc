// Static paired pages: human-authored text translations, not runtime machine translation.
const fs=require('node:fs'),path=require('node:path'),cheerio=require('cheerio');
const {loadClassicData,confirmed,approvedImage}=require('./lib/classic-data.cjs');
const root=path.resolve(__dirname,'..'),base='/games/an-jing-wei-guang/',origin='https://gamenote.cc',data=loadClassicData(root);
const labels=require('../content/games/an-jing-wei-guang/labels-zh.json'),ui=require('../content/games/an-jing-wei-guang/ui-en.json'),video=require('../content/games/an-jing-wei-guang/video-en.json');
const dictionary=new Map(Object.entries(ui)),untranslated=new Set();
dictionary.set('41 项成就','41 Achievements');
dictionary.set('收起栏目','Collapse section');
dictionary.set('查看区域结构示意','View the regional structure diagram');
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
const switcher=(route,en)=>`<nav class="classic-language-switch" aria-label="${en?'Language':'语言'}">${en?`<a href="${route}" lang="zh-CN" hreflang="zh-CN">中文</a><span aria-hidden="true"> / </span><span lang="en" aria-current="true">EN</span>`:`<span lang="zh-CN" aria-current="true">中文</span><span aria-hidden="true"> / </span><a href="/en${route}" lang="en" hreflang="en">EN</a>`}</nav>`;
const imageRecords=Object.values(data).filter(Array.isArray).flat().flatMap(record=>record.images||[]).concat(data.game.images);
for(const file of all){
 const route='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,''),zh=cheerio.load(fs.readFileSync(file,'utf8'));
 zh('[data-achievement-language],.classic-language-switch,link[hreflang]').remove();
 zh('head').append(`<link rel="alternate" hreflang="zh-CN" href="${origin+route}"><link rel="alternate" hreflang="en" href="${origin+'/en'+route}"><link rel="alternate" hreflang="x-default" href="${origin+route}"><link rel="stylesheet" href="/assets/classic-language.css">`);
 zh('.classic-main > header').prepend(switcher(route,false));fs.writeFileSync(file,zh.html()+'\n');
 const en=cheerio.load(zh.html());en('.classic-language-switch').remove();
 function walk(node){if(node.type==='text')node.data=translate(node.data);else if(!['script','style','figcaption'].includes(node.name))for(const child of node.children||[])walk(child)}walk(en('body')[0]);
 en('html').attr('lang','en');en('title').text('Well Dweller — '+translate(zh('h1').text())+' | GAME NOTE CLASSIC');
 en('link[rel=canonical],meta[property="og:url"]').each((_,node)=>en(node).attr(node.name==='link'?'href':'content',origin+'/en'+route));
 en('meta[name=description],meta[property="og:description"]').attr('content','Well Dweller — '+translate(zh('h1').text())+'. Reviewed guide notes and reference material.');en('meta[property="og:title"]').attr('content',en('title').text());
 en('[aria-label],img[alt]').each((_,node)=>{for(const attr of ['aria-label','alt'])if(en(node).attr(attr))en(node).attr(attr,translate(en(node).attr(attr)))});
 en('img[src],a[href]').each((_,node)=>{const attr=node.name==='img'?'src':'href',url=en(node).attr(attr);if(url?.startsWith(base+'images/maps/'))en(node).attr(attr,url.replace(/-zh\.svg$/,'-en.svg'))});
 en('a[href]').each((_,node)=>{const a=en(node),href=a.attr('href');if((href.startsWith(base)&&! /\.(webp|png|jpe?g|gif|avif|svg)(?:[?#]|$)/i.test(href))||/^\/(?:notes|updates)\/[^/]+\/$/.test(href)||['/','/games/','/notes/','/updates/','/about/','/search/'].includes(href))a.attr('href','/en'+href)});
 en('.classic-main > header').prepend(switcher(route,true));
 en('.classic-main > header > .classic-subtitle').first().text('Guide in progress · Updated '+data.updatedAt);en('.classic-main > header > .classic-subtitle').eq(1).text('GAME NOTE CLASSIC · Well Dweller');
 en('.classic-banner strong').text('Well Dweller');en('.classic-banner small').text('GAME NOTE CLASSIC · Illustrated guide');
 en('.classic-footer').html('<a href="/en/">Back to GAME NOTE</a> · Reviewed notes are published individually; the guide is still in progress.');
 en('figure').each((_,node)=>{const fig=en(node),img=fig.find('img'),record=imageRecords.find(i=>i.src===img.attr('src'));if(!record){fig.find('figcaption').each((_,caption)=>en(caption).text(translate(en(caption).text())));return;}const caption=translate(record.caption);img.attr('alt',caption);fig.find('figcaption').text(caption+(record.type==='video-frame'?' · Creator: 好吃的香草雪球':''))});
 const achievement=data.achievements.find(e=>route===base+'achievements/'+e.slug+'/');
 if(achievement){en('h1').text(achievement.nameEn);en('.classic-main > article').html(`<p>${escape(achievement.descriptionEn)}</p><p><a href="https://steamcommunity.com/stats/3699590/achievements/?l=english">Steam English achievement list</a></p><h2 class="classic-heading">Related guides</h2><ul class="classic-links"><li><a href="/en${base}achievements/">Achievement index</a></li></ul>`)}
 if(route===base+'achievements/')en('.classic-main > article').html('<p>Well Dweller has 41 Steam achievements. The names and descriptions below use the official English Steam text.</p><div class="classic-table-wrap" tabindex="0" role="region" aria-label="Achievements"><table class="classic-table"><caption>Steam achievements</caption><thead><tr><th scope="col">Achievement</th><th scope="col">Official description</th></tr></thead><tbody>'+data.achievements.map(e=>`<tr><td><a href="/en${base}achievements/${e.slug}/">${escape(e.nameEn)}</a></td><td>${escape(e.descriptionEn)}</td></tr>`).join('')+'</tbody></table></div>');
 const dest=path.join(root,'en',route,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,en.html()+'\n');
 if(!/noindex/.test(en('meta[name=robots]').attr('content')||''))urls.push('/en'+route);
}
function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const sitemap=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemap,'utf8').replace(/\s*<url><loc>https:\/\/gamenote.cc\/en\/games\/an-jing-wei-guang\/[^<]*<\/loc><\/url>/g,'');xml=xml.replace('</urlset>',urls.map(url=>`<url><loc>${origin+url}</loc></url>`).join('\n')+'\n</urlset>');fs.writeFileSync(sitemap,xml);
fs.writeFileSync(path.join(root,'_research/an-jing-wei-guang/english-pending.json'),JSON.stringify([...untranslated],null,2)+'\n');
console.log(`Generated ${all.length} paired Classic pages (${urls.length} English indexable); untranslated notes are explicitly labelled, never mixed into English prose.`);
