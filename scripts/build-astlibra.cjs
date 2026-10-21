const fs=require('node:fs'),path=require('node:path');
const writeFile=require('./lib/write-file.cjs');
const g=require('./lib/astlibra-guide.cjs');
const edits=require('../content/games/astlibra-revision/reader-copy.cjs');
const root=path.resolve(__dirname,'..'),base=g.base,origin='https://gamenote.cc',updated='2026-10-21';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=v=>JSON.stringify(v).replaceAll('<','\\u003c');
const link=(title,url,current)=>`<a href="${esc(url)}"${url===current?' aria-current="page"':''}>${esc(title)}</a>`;
const links=items=>`<ul class="classic-links">${items.map(p=>`<li>${link(p.label||p.title,p.href)}</li>`).join('')}</ul>`;
const group=id=>g.categories.find(c=>c.id===id);
const cards=pages=>`<div class="khazan-library-grid">${pages.map(p=>`<a class="khazan-library-card" href="${p.href||base+p.id+'/'}"><strong>${esc(p.label||p.title)}</strong><span>${esc(p.description)}</span></a>`).join('')}</div>`;
function directory(current){
 const controls=g.categories.map(c=>'astlibra-menu-'+c.id).join(' ');
 return `<aside class="classic-sidebar" data-pagefind-ignore="all"><a class="classic-brand" href="/">GAME NOTE CLASSIC</a><details open><summary>攻略目录</summary><nav class="classic-nav" aria-label="攻略目录"><div class="classic-nav-home">${link('专题首页',base,current)}<button class="classic-collapse-all" type="button" aria-expanded="true" aria-controls="${controls}">全部收起</button></div>${g.categories.map(c=>`<section class="classic-nav-group"><div class="classic-nav-group-heading"><h2>${link(c.title,base+c.id+'/',current)}</h2><button class="classic-group-toggle" type="button" aria-expanded="true" aria-controls="astlibra-menu-${c.id}" aria-label="收起${esc(c.title)}">−</button></div><div class="classic-nav-group-items" id="astlibra-menu-${c.id}">${c.id==='postgame'?link('新章路线总览',base+'walkthrough/postscript/',current):''}${c.pages.map(p=>link(p.label||p.title,p.href,current)).join('')}${c.id==='achievements'?link('新手与卡点排查',base+'achievements/#questions',current):''}</div></section>`).join('')}</nav></details></aside>`;
}
function references(ids){
 const records=[...new Set(ids)].map(id=>g.docs[id]).filter(Boolean);
 return records.length?`<details class="khazan-references" data-pagefind-ignore="all"><summary>资料来源：faili0802</summary><p>GAME NOTE 根据用户提供的本地攻略资料重新组织流程与查询目录，配图保留原图署名。</p><ul>${records.map(d=>`<li><a href="${esc(d.source)}" target="_blank" rel="noopener noreferrer">${esc(d.file.replace(/\.md$/,''))} ↗</a></li>`).join('')}</ul></details>`:'';
}
let count=0;const routes=[];
function emit(route,title,description,body,category,options={}){
 const crumbs=[{name:'GAME NOTE',url:'/'},{name:'神之天平',url:base},...(category?[{name:group(category).title,url:base+category+'/'}]:[])];
 if(route!==base&&!crumbs.some(c=>c.url===route))crumbs.push({name:title,url:route});
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:origin+c.url}))};
 const schema={'@context':'https://schema.org','@type':'Article',headline:title,description,inLanguage:'zh-CN',dateModified:updated,author:{'@type':'Organization',name:'GAME NOTE'},mainEntityOfPage:origin+route};
 const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | 神之天平 | GAME NOTE</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin+route}"><meta property="og:title" content="${esc(title)} | 神之天平"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin+route}"><meta data-search-meta data-pagefind-meta="title[content]" content="${esc(title)}"><meta data-search-meta data-pagefind-meta="game[content]" content="神之天平 / ASTLIBRA Revision"><meta data-search-meta data-pagefind-meta="type[content]" content="${esc(category?group(category).title:'游戏攻略')}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/classic.css"><link rel="stylesheet" href="/assets/classic-menu.css"><link rel="stylesheet" href="/assets/khazan.css"><link rel="stylesheet" href="/assets/astlibra.css"><link rel="stylesheet" href="/assets/image-viewer.css"><script type="application/ld+json" data-breadcrumb-schema>${json(breadcrumb)}</script><script type="application/ld+json" data-astlibra-article-schema>${json(schema)}</script><script src="/assets/classic.js" defer></script><script src="/assets/khazan-directory.js" defer></script><script src="/assets/astlibra.js" defer></script><script src="/assets/image-viewer.js" defer></script></head><body class="khazan-classic astlibra-classic${route===base?' astlibra-home':''}" data-theme="classic"><a class="classic-skip" href="#main">跳到正文</a><div class="classic-shell khazan-classic-shell">${directory(route)}<main class="classic-main" id="main"><nav class="classic-crumb" aria-label="面包屑">${crumbs.map((c,i)=>i===crumbs.length-1?`<span aria-current="page">${esc(c.name)}</span>`:link(c.name,c.url)).join(' / ')}</nav>${route===base?'':`<header><h1>${esc(title)}</h1><p class="classic-subtitle">攻略整理：GAME NOTE · 更新于 <time datetime="${updated}">${updated}</time></p><div class="classic-banner" data-pagefind-ignore="all"><div><small>GAME NOTE CLASSIC · GUIDE LIBRARY</small><strong>神之天平</strong></div><span>ASTLIBRA<br>Revision</span></div></header>`}<article class="khazan-classic-content" data-pagefind-body><p class="khazan-classic-lead">${esc(description)}</p>${options.spoiler?'<p class="classic-notice">本页涉及后续剧情与结局分支，建议到达相应进度后再阅读。</p>':''}${body}</article><footer class="classic-footer"><a href="${base}">返回攻略首页</a> · <a href="/catalog/astlibra-revision/">游戏图鉴</a> · GAME NOTE</footer></main></div></body></html>\n`;
 const file=path.join(root,route.slice(1),'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});writeFile(file,html);routes.push(route);count++;
}
function readerText(b){
 let text=edits[b.doc+':'+b.index]??b.text;
 return text.replace(/（这颜色没谁了，没办法道具都这个颜色）|（没光头大叔啥事）/g,'').replace(/前半部结束。/g,'').replace(/这里说一下/g,'注意').replace(/下一个场景特别的鬼畜/g,'下一个场景会出现连续滚石').replace(/，笔者没去这里就不做介绍了/g,'').replace(/具体必胜法我也不知道我就介绍一下我的打法/g,'可参考下面的应对思路').replace(/基本上我就是这个套路。/g,'可据此调整配置。').replace(/有好方法的小伙伴可以写在评论区帮助大家胜利。/g,'').replace(/（因为战斗过于不适总结一下战斗区域就3个，大家顶住）/g,'（这段共有三个战斗区域）').replace(/据说每个装备都有装备盘/g,'可通过装备盘继续强化装备').replace(/，感觉穿不过去浓雾/g,'，无法穿过浓雾').replace(/本人[^。]*。/g,'').replace(/我也没找到太好的100%能过的方法。/g,'').replace(/参考.{0,30}评论区[^。]*。/g,'');
}
const headingText=text=>text.replace(/^[一二三四五六七八九十]+、|^\d+[、.]|^⭐/g,'').replace(/^(?:第[一二三四五六七八九十]+章[、\s]*)/,'').replace(/地图$/,'区域图').replace(/~/g,' · ');
function imageBlock(b,title,table=false){
 const asset=g.data.assets[b.src];if(!asset)throw Error('Unknown image '+b.src);
 const caption=b.caption?`${title} · ${b.caption}`:title;
 return `<figure class="khazan-instruction-image${table?' astlibra-data-image':''}" id="source-${b.doc}-${b.index}" data-source-doc="${b.doc}" data-source-block="${b.index}"><a href="${b.src}" target="_blank" rel="noopener noreferrer"><img src="${b.src}" width="${asset.width}" height="${asset.height}" alt="${esc(caption)}" loading="lazy"></a><figcaption>${esc(caption)} · 点击放大</figcaption></figure>`;
}
function block(b,title,table=false){
 if(b.kind==='image')return imageBlock(b,title,table);
 const text=readerText(b);if(!text)return '';
 const trace=`id="source-${b.doc}-${b.index}" data-source-doc="${b.doc}" data-source-block="${b.index}"`;
 if(b.kind==='heading')return `<h3 ${trace}>${esc(headingText(text))}</h3>`;
 if(/^女神.*\d?$|^暴君.*\d$|^龙王阿尔哈米斯$|^未知生物$/.test(text))return '';
 if(text.length>200){const paragraphs=[];let current='';for(const sentence of text.split(/(?<=。)/)){if(current.length+sentence.length>200&&current){paragraphs.push(current);current='';}current+=sentence;}if(current)paragraphs.push(current);return `<div ${trace}>${paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`;}
 return `<p ${trace}>${esc(text)}</p>`;
}
function table(headers,rows){return `<div class="classic-table-wrap"><table class="classic-table"><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>i?`<td>${v}</td>`:`<th scope="row">${v}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function sectionBody(s,page){
 if(s.table==='gem-effects')return block(s.blocks[0],s.title)+table(['元件宝石','强化效果'],s.blocks.slice(2).map(b=>b.text.split('➡').map(esc)));
 if(s.table==='transforms')return block(s.blocks[0],s.title)+table(['强化等级与原技能','变化后技能'],s.blocks.slice(1).map(b=>b.text.split('➡').map(esc)));
 if(s.table==='medals')return table(['兑换次序','奖励'],s.blocks.map(b=>{const m=b.text.match(/^(\d+)、(.+)$/);if(!m)throw Error('Invalid medal reward');return [m[1],esc(m[2])];}));
 if(s.table==='arrows')return table(s.headers,s.blocks.map(b=>b.text.split('➡').map(esc)));
 if(s.table==='recipes'){
  let html='',rows=[];const flush=()=>{if(rows.length){html+=table(['材料组合','合成结果'],rows);rows=[];}};
  for(const b of s.blocks){const text=readerText(b);if(text.includes('=')){const [materials,result]=text.split('=');const uncertain=/铁矿石\+冶炼套件=银锭|冶炼套件\+铁定=炸弹/.test(text);rows.push([esc(materials),esc(result)+(uncertain?'<small class="astlibra-source-note">原资料此行存在名称疑点，请以游戏内配方为准。</small>':'')]);}else{flush();html+=`<h3>${esc(headingText(text))}</h3>`;}}flush();return html;
 }
 return s.blocks.map((b,i)=>block(b,s.title+(page.imageTable?` · 图表 ${i+1}`:''),page.imageTable)).join('');
}
function toc(sections){return `<nav class="khazan-flow-nav" aria-label="本页目录"><ol>${sections.map(s=>`<li>${link(s.title,'#'+s.id)}</li>`).join('')}</ol></nav>`;}
function detailBody(page){
 const aliases=g.aliases[page.id]||{};
 const body=page.sections.map((s,i)=>{
  const cost=s.cost===undefined?'':`<span class="astlibra-cost">魔导水晶 ${s.cost}</span>`;
  const content=sectionBody(s,page);
  const alias=Object.entries(aliases).filter(([a,target])=>target===s.id&&a!==s.id).map(([a])=>`<span id="${a}" class="khazan-legacy-anchor"></span>`).join('');
  return `<section class="khazan-route-section" id="${s.id}">${alias}<h2 class="classic-heading"><span class="khazan-step-number">${String(i+1).padStart(2,'0')}</span>${esc(page.imageTable?'资料图表':s.title)}${cost}</h2>${s.spoiler?`<details class="astlibra-spoiler"><summary>展开剧情选择提示</summary>${content}</details>`:content}</section>`;
 }).join('');
 const collection=g.collections.find(c=>c.id===page.id),isRoute=['walkthrough','postgame'].includes(page.category);
 const related=isRoute?`<section><h2 class="classic-heading">相关查询</h2>${links([{title:'对应区域地图与宝箱',href:collection?.href||base+'collectibles/postscript/'},{title:'补给与合成配方',href:base+'systems/crafting/'},{title:'嘉隆技能查询',href:base+'skills/'}])}</section>`:'';
 const siblings=group(page.category).pages.filter(p=>!p.redirect&&!p.indexType),index=siblings.indexOf(page),previous=siblings[index-1],next=siblings[index+1];
 const systemLinks=page.category==='systems'?`<h2 class="classic-heading">相关查询</h2>${links([{title:'地图宝箱与小徽章位置',href:base+'collectibles/'},{title:'装备与道具资料',href:base+'equipment/'},{title:'新章流程',href:base+'postgame/'}])}`:'';
 return `${page.sections.length>1?toc(page.sections):''}${body}${related}${systemLinks}${references(page.sources)}<nav class="classic-pager" aria-label="前后篇">${previous?link('← '+(previous.label||previous.title),previous.href):''}${link('返回目录',base+page.category+'/')}${next?link((next.label||next.title)+' →',next.href):''}</nav>`;
}
function chestRows(records,detail=false){
 return `<div class="classic-table-wrap"><table class="classic-table astlibra-chests"><thead><tr><th scope="col">编号</th><th scope="col">宝箱与条件</th><th scope="col">位置图</th></tr></thead><tbody>${records.map(p=>{
 const collection=g.collections.find(c=>c.id===p.chapter),first=p.blocks.find(b=>b.kind==='image');
 return `<tr data-astlibra-row data-kind="${p.category}" data-search="${esc(collection.title+' '+p.title+' '+p.description)}"><td>${esc(p.number)}</td><th scope="row">${esc(p.title)}<p>${esc(p.description)}</p><small>${esc(collection.title)}</small></th><td><a href="${collection.href}#${p.id}">${first?`<img src="${first.src}" width="${g.data.assets[first.src].width}" height="${g.data.assets[first.src].height}" alt="${esc(p.title)}的位置预览" loading="lazy">`:''}${detail?'查看下方图文':'查看图文'} →</a></td></tr>`;
 }).join('')}</tbody></table></div>`;
}
function filter(){return `<form class="khazan-collection-filter" data-astlibra-filter role="search"><label>搜索区域、奖励或开启条件<input type="search" name="q" data-astlibra-search placeholder="例如：天平挂盘、靶心、石板"></label><label>收集分类<select name="kind" data-astlibra-kind><option value="all">全部</option><option value="medal">小徽章</option><option value="libra">天平挂盘</option><option value="technique">奥义卷轴</option><option value="other">其他宝箱</option></select></label><button type="reset">清除筛选</button></form><p data-astlibra-filter-status role="status" aria-live="polite"></p>`;}
function lookupForm(placeholder,phases=false){return `<form class="khazan-collection-filter" data-astlibra-lookup role="search"><label>搜索名称、区域或提示<input type="search" data-lookup-search placeholder="${esc(placeholder)}"></label>${phases?'<label>游玩阶段<select data-lookup-phase><option value="all">全部阶段</option><option value="main">主线</option><option value="postgame">新章</option><option value="hidden">隐藏区域</option></select></label>':''}<button type="reset">清除筛选</button></form><p data-lookup-status role="status" aria-live="polite"></p>`;}
function gemIndexBody(){
 const rows=g.gems.map(r=>{
  const asset=g.data.assets[r.imageSrc];
  return `<tr id="gem-${r.id}" data-lookup-row data-lookup-text="${esc([r.name,r.region,r.location,r.condition].join(' '))}"><th scope="row">${esc(r.name)}</th><td><strong>${esc(r.region)}</strong><p>${esc(r.location)}</p><p class="astlibra-source-note">${esc(r.condition)}</p></td><td><a href="${r.imageSrc}" target="_blank" rel="noopener noreferrer"><img class="astlibra-index-preview" src="${r.imageSrc}" width="${asset.width}" height="${asset.height}" alt="${esc(r.name+'元件宝石位置')}" loading="lazy">放大位置图</a><p>${link('对应流程 →',r.href)}</p></td></tr>`;
 }).join('');
 return `<p>元件宝石以地面闪光点为主，与宝箱列表分开查询。火山区域编号对应流程页中的地图。</p><section data-astlibra-lookup-scope>${lookupForm('例如：嘉隆蜕变、火山、伊利西昂')}<div class="classic-table-wrap"><table class="classic-table astlibra-reference-table"><thead><tr><th scope="col">元件宝石</th><th scope="col">区域、位置与条件</th><th scope="col">截图与流程</th></tr></thead><tbody>${rows}</tbody></table></div></section><h2 class="classic-heading">元件强化与变化</h2>${links([g.systems.find(p=>p.id==='equipment-upgrades'),{title:'新章图文流程',href:base+'postgame/'}])}${references(['flow-lower'])}`;
}
function remindersBody(){
 const stages=[...new Set(g.reminders.map(r=>r.stage))];
 return `<p>“出发准备”和“顺路收集”是查漏建议，不表示永久无法补回。剧情分支的实际选项默认折叠，查看前可先另存档。</p>${toc(stages.map((stage,i)=>({id:'progress-'+i,title:stage})))}${stages.map((stage,i)=>`<section id="progress-${i}" class="khazan-route-section"><h2 class="classic-heading">${esc(stage)}</h2>${g.reminders.filter(r=>r.stage===stage).map(r=>`<section id="reminder-${r.id}" class="astlibra-reminder"><h3>${esc(r.title)}</h3><small class="astlibra-tip-kind">${esc(r.kind)}</small><p>${esc(r.action)}</p>${r.choice?`<details class="astlibra-spoiler"><summary>展开具体选项与影响（剧透）</summary><p>${esc(r.choice)}</p></details>`:''}<p>${link('查看对应图文步骤 →',r.href)}</p></section>`).join('')}</section>`).join('')}${links([g.gemIndex,{title:'人物事件与分支',href:base+'side-quests/'}])}${references(['flow-upper','flow-lower'])}`;
}
function encounterIndex(){
 const rows=[...g.encounters.map(r=>({...r,stage:r.stage})),...g.bosses.map(p=>({id:p.id,name:p.title.split('：')[0],stage:'隐藏区域',tip:p.description,href:p.href,phase:'hidden'}))];
 return `<section id="encounter-index" data-astlibra-lookup-scope><h2 class="classic-heading">按名称与遭遇地点查找</h2><p>优先使用资料中已有的名称；未注明正式名称的战斗，以地点、外形或招式作查找标签。主线与新章分别列出，点击直达该场战斗的正文。</p>${lookupForm('例如：金龙、火之魔神、大佐、石化',true)}<div class="classic-table-wrap"><table class="classic-table astlibra-reference-table"><thead><tr><th scope="col">首领／遭遇</th><th scope="col">阶段与地点</th><th scope="col">战斗提示</th></tr></thead><tbody>${rows.map(r=>`<tr id="boss-${r.id}" data-lookup-row data-lookup-phase="${r.phase}" data-lookup-text="${esc([r.name,r.stage,r.tip].join(' '))}"><th scope="row">${link(r.name,r.href)}</th><td>${esc(r.stage)}</td><td>${esc(r.tip)}</td></tr>`).join('')}</tbody></table></div></section>${references(['flow-upper','flow-lower','systems'])}`;
}
for(const page of g.pages){
 if(page.indexType){emit(page.href,page.title,page.description,page.indexType==='gems'?gemIndexBody():remindersBody(),page.category,{spoiler:page.indexType==='gems'});continue;}
 if(page.redirect){emit(page.href,page.title,page.description,`<p>${link('阅读爱情与记忆事件 →',page.redirect)}</p>`,page.category,{spoiler:true});continue;}
 if(page.category==='collectibles'){
  const anchorByBlock=new Map(page.records.map(r=>[r.blocks[0].index,r.id]));
  const body=page.all.map(b=>`${anchorByBlock.has(b.index)?`<span class="khazan-pickup-anchor" id="${anchorByBlock.get(b.index)}"></span>`:''}${block(b,page.title)}`).join('');
  const chapter=page.id==='postscript'?base+'postgame/':base+'walkthrough/'+page.id+'/';
  emit(page.href,page.title+' · 地图与宝箱',page.description,`<p>${link('查看对应流程 →',chapter)} · 本区域收录 ${page.records.length} 条宝箱记录。</p>${filter()}${chestRows(page.records,true)}<h2 class="classic-heading">位置图与开启方法</h2>${body}${references(page.sources)}`,page.category,{spoiler:page.id==='postscript'});continue;
 }
 emit(page.href,page.title,page.description,detailBody(page),page.category,{spoiler:page.spoiler||page.category==='postgame'});
}
for(const category of g.categories){
 let body=cards(category.pages);
 if(category.id==='walkthrough')body=`<p>每段流程同时保留路线说明和相邻截图；沿途宝箱可从对应区域的收集页查找。</p>${body}`;
 if(category.id==='postgame')body=`<p class="classic-notice">以下为终章之后的追加内容，涉及新章剧情与结局。</p>${body}`;
 if(category.id==='skills')body=`<span id="systems"></span><span id="abilities"></span><span id="builds"></span><p>技能先通过装备精通等方式习得，再用魔导水晶配置。按探索、防御和攻击需求选择分类；各页列出配置消耗与取得来源。</p>${body}${references(['systems'])}`;
 if(category.id==='equipment')body=`<span id="weapons"></span><span id="armor"></span><span id="items"></span><p>装备与道具资料以原图表呈现，保留属性、材料和精通奖励。手机上可点击图片放大。</p>${body}${links([g.systems.find(p=>p.id==='equipment-upgrades'),g.systems.find(p=>p.id==='crafting')])}`;
 if(category.id==='collectibles')body=`<span id="locations"></span><span id="secrets"></span><span id="checklist"></span><p>按来源图中的宝箱位置整理，共 ${g.pickups.length} 条位置记录；这不是物品总数。剧情贵重品与新章元件仍可结合流程页查询。</p>${body}${filter()}${chestRows(g.pickups)}<h2 class="classic-heading">剧情道具与机关</h2>${require('../content/games/astlibra-revision/pickups.cjs').map(p=>`<p id="pickup-${p.id}">${link(p.name,base+'walkthrough/'+p.chapter+'/#'+p.step)}</p>`).join('')}${references(['collect-upper','collect-lower'])}`;
 if(category.id==='bosses')body=`${encounterIndex()}<h2 class="classic-heading" id="hidden-areas">隐藏区域入口</h2>${body}<p class="classic-notice">战神杰拉丁在这批资料中只有文章跳转，没有具体路线，暂不提供推测走法。</p>`;
 if(category.id==='side-quests')body=`<span id="quests"></span><span id="events"></span><span id="missables"></span><p>这里集中放置人物选择和分支条件。制作火把、湿地采药等主线委托仍按推进顺序放在流程中。</p>${body}`;
 if(category.id==='achievements')body=`<section id="achievements"><h2 class="classic-heading">结局与收集相关事件</h2>${links([g.postgame.find(p=>p.id==='love'),g.events.find(p=>p.id==='time-branches'),{title:'地图宝箱与小徽章位置',href:base+'collectibles/'},g.systems.find(p=>p.id==='arena')])}<p>本批资料没有独立的全成就清单，先从实际事件和收集路线查询。</p></section><section id="questions"><h2 class="classic-heading">常见卡点</h2>${links([{title:'找不到火把材料',href:base+'walkthrough/chapter-1/#torch'},{title:'宝珠拿走后通路被堵',href:base+'walkthrough/chapter-1/#red-orb'},{title:'雪山重量要求',href:base+'walkthrough/chapter-6/#snow'},{title:'四色符文机关',href:base+'walkthrough/chapter-6/#green-rune'},g.systems.find(p=>p.id==='libra'),g.systems.find(p=>p.id==='crafting')])}</section><section id="starter"><h2 class="classic-heading">初次游玩</h2><p>从天平洞窟开始按顺序阅读。确认任务出发前保留一份能返回补给的存档，进入新区域时检查装备、嘉隆和消耗品。</p></section>`;
 emit(base+category.id+'/',category.title,category.description,body);
}
function homepage(){
 const imageSize=src=>`width="${g.data.assets[src].width}" height="${g.data.assets[src].height}"`;
 const firstImage=p=>p.id==='chapter-3'?base+'images/source/29aa7c1fce3fdd927fae.jpg':p.sections.flatMap(s=>s.blocks).find(b=>b.kind==='image').src;
 const quick=[['15','元件宝石','位置、前置条件与配图','postgame/gems/'],['!','易错过提醒','按进度检查选择与准备','side-quests/progress-reminders/'],['53','首领索引','按名称和章节查找战斗','bosses/'],['96','嘉隆技能','消耗、来源与技能效果','karon/']];
 // Resolve the skill category from the guide data rather than duplicate its route.
 quick[3][3]=g.categories.find(c=>c.pages.includes(g.skills[0])).id+'/';
 return `<section class="astlibra-hero" aria-labelledby="adventure-title"><img class="astlibra-hero-scene" src="${firstImage(g.main[3])}" alt="海边城镇与停泊的帆船" fetchpriority="high" ${imageSize(firstImage(g.main[3]))}><div class="astlibra-hero-copy"><span class="astlibra-eyebrow">GAME NOTE · ADVENTURE ARCHIVE</span><p class="astlibra-hero-edition">ASTLIBRA Revision</p><h1 id="adventure-title">神之天平<span class="astlibra-title-note">攻略</span></h1><p class="astlibra-hero-tagline">循着天平，走过时间的彼端。</p><p class="astlibra-hero-description">从天平洞窟到终章决战，<br>让每一次探索，都有迹可循。</p><div class="astlibra-hero-actions"><a href="${g.main[0].href}">开始主线 <span>↗</span></a><a href="${base}walkthrough/postscript/">继续新章 <span>→</span></a><a href="${base}collectibles/">查找收集 <span>→</span></a></div></div><span class="astlibra-hero-seal" aria-hidden="true">⚖</span><span class="astlibra-hero-credit">游戏配图 · faili0802</span></section><nav class="astlibra-quick" aria-label="常用速查">${quick.map(([n,t,d,u])=>`<a href="${base+u}"><span class="astlibra-quick-number">${n}</span><span><strong>${t}</strong><small>${d}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</nav><section class="astlibra-journey"><div class="astlibra-section-heading"><div><span class="astlibra-eyebrow">THE JOURNEY</span><h2>沿着旅程，找到下一步</h2></div><a href="${base}walkthrough/">全部主线 →</a></div><div class="astlibra-chapter-grid">${g.main.map((p,i)=>`<a class="astlibra-chapter" href="${p.href}"><img src="${firstImage(p)}" alt="${esc(p.label)}场景" loading="lazy" ${imageSize(firstImage(p))}><span class="astlibra-chapter-number">${i===8?'FINALE':String(i+1).padStart(2,'0')}</span><span class="astlibra-chapter-name">${esc(p.label.split(' · ')[1])}<small>${esc(p.description)}</small></span><span class="astlibra-chapter-arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section><section class="astlibra-library"><div class="astlibra-section-heading"><div><span class="astlibra-eyebrow">FIELD NOTES</span><h2>冒险者的随身手册</h2></div><span>探索 · 战斗 · 收集</span></div>${cards(g.categories.map(c=>({...c,href:base+c.id+'/'})))}</section>${references(Object.keys(g.docs))}`;
}
emit(base,'神之天平攻略','主线图文流程、新章、地图宝箱、装备道具、嘉隆技能与系统查询。',homepage());
emit(base+'walkthrough/postscript/','新章攻略入口','终章之后的新章按重访区域拆分阅读。',`<span id="scope"></span><span id="systems"></span>${cards(g.postgame)}${links([g.systems.find(p=>p.id==='equipment-upgrades')])}`,'postgame',{spoiler:true});
// Standalone builds keep the site's sitemap in sync, without modifying other entries.
const sitemap=path.join(root,'sitemap.xml');if(fs.existsSync(sitemap)){
 let xml=fs.readFileSync(sitemap,'utf8').replace(/\s*<url><loc>https:\/\/gamenote\.cc\/games\/astlibra-revision\/[^<]*<\/loc><\/url>/g,'');
 xml=xml.replace('</urlset>',routes.sort().map(route=>`  <url><loc>${origin+route}</loc></url>`).join('\n')+'\n</urlset>');writeFile(sitemap,xml);
}
writeFile(path.join(root,'content/games/astlibra-revision/published-routes.json'),JSON.stringify(routes,null,2)+'\n');
console.log(`Built ${count} Astlibra pages, ${g.pickups.length} chest locations, ${g.skills.reduce((n,p)=>n+p.sections.length,0)} KARON skills and ${Object.keys(g.data.assets).length} local images.`);
