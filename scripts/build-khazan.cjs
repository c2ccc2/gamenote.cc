const fs = require('node:fs');
const writeFile = require('./lib/write-file.cjs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://gamenote.cc';
const slug = 'the-first-berserker-khazan';
const cover = '/assets/catalog/the-first-berserker-khazan.jpg';
const reference = 'https://www.3dmgame.com/gl/3964895.html';
const store = 'https://store.steampowered.com/app/2680010/The_First_Berserker_Khazan/';
const updateContext = {window:{GAMENOTE_ROUTES:require('../assets/routes.js')}};
require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/content.js'),'utf8'),updateContext);
const guideUpdates = updateContext.window.GAMENOTE_CONTENT.updates.filter(update=>update.game===slug).sort((a,b)=>b.date.localeCompare(a.date));
const missions = require('../content/games/the-first-berserker-khazan/missions.json');
const library = require('../content/games/the-first-berserker-khazan/library.json');
const entries = require('../content/games/the-first-berserker-khazan/entries.json');
const entryDetails = require('../content/games/the-first-berserker-khazan/entry-details.json');
const renderDirectory = require('./lib/khazan-directory.cjs');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
if (!Array.isArray(missions) || !missions.length || new Set(missions.map(m => m.slug)).size !== missions.length) throw Error('Invalid Khazan mission list');
if (!Array.isArray(library) || new Set(library.map(section => section.id)).size !== library.length || library.some(section => !['available', 'planned'].includes(section.status) || !section.zh?.title || !section.en?.title || (section.status === 'available' && !section.href))) throw Error('Invalid Khazan library sections');
if (!Array.isArray(entries) || entries.some(entry => !library.some(section => section.id === entry.category && section.status === 'available') || !entry.zh?.title || !entry.en?.title || !entry.zh?.description || !entry.en?.description || !entry.source?.startsWith('https://'))) throw Error('Invalid Khazan library entries');
if (entries.some(entry => !Array.isArray(entryDetails[entry.id]?.zh) || !entryDetails[entry.id].zh.length || !Array.isArray(entryDetails[entry.id]?.en) || !entryDetails[entry.id].en.length)) throw Error('Missing bilingual Khazan entry details');
for (const mission of missions) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(mission.slug) || !['published', 'planned'].includes(mission.status) || mission.kind !== 'main') throw Error('Invalid Khazan mission: ' + mission.slug);
  for (const locale of ['zh', 'en']) {
    const item = mission[locale];
    if (!item?.title) throw Error('Missing Khazan mission title: ' + mission.slug + ' ' + locale);
    if (mission.status === 'published' && (!item.summary || !item.lead || !Array.isArray(item.sections) || !item.sections.length)) throw Error('Incomplete Khazan mission: ' + mission.slug + ' ' + locale);
    if (mission.status === 'published' && (!Array.isArray(item.atGlance) || item.atGlance.length < 3 || item.atGlance.some(row => !row.label?.trim() || !row.value?.trim()))) throw Error('Missing Khazan chapter overview: ' + mission.slug + ' ' + locale);
    for (const section of item.sections || []) {
      if (!['steps', 'bullets', 'paragraphs', 'image'].includes(section.type) || !section.heading) throw Error('Invalid Khazan section: ' + mission.slug);
      if (section.type === 'image') {
        if (!section.src?.startsWith('/games/' + slug + '/images/') || !fs.existsSync(path.join(root, section.src.slice(1))) || !section.alt) throw Error('Khazan guide image must be local and have alt text: ' + mission.slug);
      } else if (!Array.isArray(section.items) || !section.items.length || section.items.some(item => !item.trim())) throw Error('Empty Khazan section: ' + mission.slug);
    }
  }
}
const copy = {
  zh: {
    name: '第一狂战士：卡赞', eyebrow: '游戏攻略 / 类魂动作', status: '攻略整理中',
    lead: '从雪地开场、基础防御到首领战，按任务逐步整理《卡赞》的路线与关键节点。',
    start: '阅读开场路线', index: '任务目录',
    now: '当前可读', first: '第一章：被流放的英雄', firstDescription: '雪地开场、刀斧与防御教学、首领雪魈王的战斗要点。',
    next: '后续任务', nextDescription: '后续任务、支线、收集与首领将逐步补充；未核验的位置不会当作完整收集路线发布。',
    scopeTitle: '如何阅读这份攻略', scope: '先使用本站已整理的路线摘要和首领提示。它不是全收集清单；详细图文步骤仍需实机核验。原始参考文章可通过下方来源访问。',
    referenceTitle: '参考与署名', referenceText: '开场任务顺序参考 3DM 攻略组的《第一狂战士：卡赞》流程攻略。本站正文为重新编写的摘要；部分章节配有来自 3DM 攻略组的参考截图，保留原图水印与来源链接。', referenceLink: '查看 3DM 原文',
    officialLink: '查看游戏商店页',
    routeLead: '已整理的任务入口与后续计划。', routeTitle: '任务流程', routeStatus: '路线摘要已发布', routePending: '详细图文与后续章节待整理',
    atGlanceTitle: '本章速览', onThisPage: '跳转到', back: '返回攻略首页'
  },
  en: {
    name: 'The First Berserker: Khazan', eyebrow: 'Game guide / Action RPG', status: 'Guide in progress',
    lead: 'A mission-by-mission guide, beginning with the snowy opening, defense basics and the first boss.',
    start: 'Read the opening route', index: 'Mission index',
    now: 'Available now', first: 'Chapter 1: The Banished Hero', firstDescription: 'The opening snowfield, weapon and defense tutorials, and the Snow Yeti King fight.',
    next: 'Later missions', nextDescription: 'More missions, side quests, collectibles and bosses will follow. Unverified locations will not be presented as a complete collectible route.',
    scopeTitle: 'How to use this guide', scope: 'Start with the route summary and boss notes available here. This is not a full collectible checklist; detailed illustrated steps still need hands-on verification. The original reference article is linked below.',
    referenceTitle: 'Reference and credit', referenceText: 'The opening mission sequence was checked against 3DM Guide Team’s Khazan walkthrough. This site uses newly written summaries. Some chapters include reference screenshots from 3DM Guide Team, with original marks and source links retained.', referenceLink: 'Read the 3DM original',
    officialLink: 'View the store page',
    routeLead: 'Available mission notes and the next sections planned.', routeTitle: 'Mission walkthrough', routeStatus: 'Route summary available', routePending: 'Detailed illustrations and later chapters in progress',
    atGlanceTitle: 'Chapter at a glance', onThisPage: 'Jump to', back: 'Back to the guide home'
  }
};
function page(en, route, title, description, body, classic = false) {
  const zhRoute = route.replace(/^\/en\//, '/'), enRoute = route.startsWith('/en/') ? route : '/en' + route;
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | GAME NOTE</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin + route}"><link rel="alternate" hreflang="zh-CN" href="${origin + zhRoute}"><link rel="alternate" hreflang="en" href="${origin + enRoute}"><link rel="alternate" hreflang="x-default" href="${origin + zhRoute}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin + route}"><link rel="stylesheet" href="/styles.css">${classic ? '<link rel="stylesheet" href="/assets/classic.css"><link rel="stylesheet" href="/assets/classic-menu.css"><link rel="stylesheet" href="/assets/classic-language.css"><script src="/assets/classic.js" defer></script><script src="/assets/khazan-directory.js" defer></script>' : ''}<link rel="stylesheet" href="/assets/khazan.css"></head><body${classic ? ' class="khazan-classic" data-theme="classic"' : ''}>${classic ? '<a class="classic-skip" href="#main">' + (en ? 'Skip to content' : '跳到正文') + '</a>' : '<div data-site-header data-pagefind-ignore="all"></div>'}${classic ? body : `<main class="wrap khazan-shell" data-pagefind-body>${body}</main>`}${classic ? '' : '<div data-site-footer data-pagefind-ignore="all"></div><script src="/assets/routes.js"></script><script src="/assets/content.js"></script>' + (en ? '<script src="/assets/content.en.js"></script>' : '') + '<script src="/assets/site.js"></script>'}</body></html>\n`;
}
function write(route, html) {
  const file = path.join(root, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  writeFile(file, html);
}
function renderSection(section, index) {
  if (section.type === 'image') return `<section id="${esc(section.id || 'section-' + (index + 1))}" class="khazan-chapter-section"><h2 class="classic-heading">${esc(section.heading)}</h2><div class="classic-image-block center"><figure><img src="${esc(section.src)}" alt="${esc(section.alt)}" loading="lazy">${section.caption || section.source ? `<figcaption>${esc(section.caption || '')}${section.source ? ` · <a href="${esc(section.source)}" target="_blank" rel="noopener noreferrer">${esc(section.sourceLabel || '3DM')}</a>` : ''}</figcaption>` : ''}</figure></div></section>`;
  const tag = section.type === 'bullets' ? 'ul' : null;
  const body = tag ? `<${tag}>${section.items.map(item => `<li>${esc(item)}</li>`).join('')}</${tag}>` : section.items.map(item => `<p>${esc(item)}</p>`).join('');
  return `<section id="${esc(section.id || 'section-' + (index + 1))}" class="khazan-chapter-section"><h2 class="classic-heading">${esc(section.heading)}</h2>${body}</section>`;
}
const published = missions.filter(mission => mission.status === 'published');
if (!published.length) throw Error('Khazan needs at least one published mission');
function renderHome({en, t, locale, base, route, chapter, credit, language}) {
  const hrefFor = value => value.startsWith('#') ? value : base + value;
  const sectionNav = library.map(section => section.status === 'available'
    ? `<a href="${hrefFor(section.href)}">${esc(section[locale].title)}</a>`
    : `<span class="khazan-nav-pending">${esc(section[locale].title)} · ${en ? 'In progress' : '待整理'}</span>`).join('');
  const sectionCards = library.map(section => `<${section.status === 'available' ? 'a href="' + hrefFor(section.href) + '"' : 'div'} class="khazan-library-card${section.status === 'planned' ? ' khazan-library-card--planned' : ''}"><small>${section.status === 'available' ? en ? 'Available' : '已有内容' : en ? 'In progress' : '待整理'}</small><strong>${esc(section[locale].title)}</strong><span>${esc(section[locale].description)}</span></${section.status === 'available' ? 'a' : 'div'}>`).join('');
  const detailSections = library.filter(section => section.status === 'available' && section.id !== 'walkthrough').map(section => {
    const cards = entries.filter(entry => entry.category === section.id).map(entry => `<article class="khazan-entry"><h3>${entry.href ? `<a href="${base + entry.href}">${esc(entry[locale].title)} →</a>` : esc(entry[locale].title)}</h3><p>${esc(entry[locale].description)}</p><a class="khazan-entry-source" href="${esc(entry.source)}" target="_blank" rel="noopener noreferrer">${en ? 'Reference' : '资料来源'} ↗</a></article>`).join('');
    return `<section class="khazan-library-section" id="${section.id}"><h2 class="classic-heading">${esc(section[locale].title)}</h2><p>${esc(section[locale].description)}</p><div class="khazan-entry-grid">${cards}</div></section>`;
  }).join('');
  return `<div class="classic-shell khazan-classic-shell">${renderDirectory({en, locale, base, current: base, library, entries, missions, esc})}<main class="classic-main" id="main"><header><nav class="classic-language-switch" aria-label="${en ? 'Language' : '语言'}">${language}</nav><h1>${t.name}</h1><p class="classic-subtitle">${en ? 'Guide editor: GAME NOTE' : '攻略整理：GAME NOTE'}</p><div class="classic-banner" data-pagefind-ignore="all"><div><small>GAME NOTE CLASSIC · ${en ? 'GUIDE LIBRARY' : '游戏攻略资料库'}</small><strong>${t.name}</strong></div><span>${t.status}</span></div></header><article data-pagefind-body><p>${en ? 'This library brings together missions, bosses, gear, characters and collectibles. Published entries appear below; sections still under review are marked clearly.' : '这里按主线、首领、装备、人物、系统与收集整理《卡赞》资料。已有内容可直接阅读，尚待核验的栏目会标明整理状态。'}</p><div class="classic-table-wrap" id="game-info" tabindex="0" role="region" aria-label="${en ? 'Game information' : '游戏基础资料'}"><table class="classic-table"><caption>${en ? 'Game information' : '游戏基础资料'}</caption><tbody><tr><th scope="row">${en ? 'Game' : '游戏名称'}</th><td>${t.name}</td></tr><tr><th scope="row">${en ? 'Genre' : '游戏类型'}</th><td>${en ? 'Action RPG' : '动作角色扮演'}</td></tr><tr><th scope="row">${en ? 'Guide status' : '攻略状态'}</th><td>${t.status}</td></tr><tr><th scope="row">${en ? 'Main missions' : '主线章节'}</th><td>${published.length} / ${missions.length} ${en ? 'with route notes' : '章已有路线摘要'}</td></tr></tbody></table></div><div class="classic-image-block center"><figure><img src="${cover}" alt="${t.name}" width="460" height="215" loading="lazy"><figcaption>${en ? 'Official Steam promotional image, stored locally' : 'Steam 官方宣传图，已存储于本站'}</figcaption></figure></div><p><a href="${store}" target="_blank" rel="noopener noreferrer">${t.officialLink} ↗</a></p><section id="library"><h2 class="classic-heading">${en ? 'Guide library' : '攻略资料库'}</h2><div class="khazan-library-grid">${sectionCards}</div></section><section class="khazan-library-section" id="featured-route"><h2 class="classic-heading">${en ? 'Start with Chapter 1' : '从第一章开始'}</h2><p><a href="${chapter}">${esc(published[0][locale].title)} →</a> · ${esc(published[0][locale].summary)}</p><p><a href="${route}">${t.index} →</a></p></section>${detailSections}<section id="guide-status"><h2 class="classic-heading">${t.scopeTitle}</h2><p class="classic-notice">${en ? 'Basic reference cards are a starting point, not complete item, NPC or collectible indexes. Detailed routes and values will be added after review.' : '基础资料卡只是起点，并非完整装备、人物或收集图鉴。详细位置、数值和路线会在核验后补充。'}</p></section><section id="references" class="khazan-classic-reference">${credit}</section></article><footer class="classic-footer">GAME NOTE · ${t.status}</footer></main></div>`;
}
function renderClassicInner({en, t, locale, base, route, current, title, lead, body}) {
  const alternate = current.startsWith('/en/') ? current.replace(/^\/en\//, '/') : '/en' + current;
  const language = `<details class="language-menu"><summary aria-label="${en ? 'Choose language' : '选择语言'}"><span aria-hidden="true">◎</span> ${en ? 'English' : '简体中文'} <span class="language-chevron" aria-hidden="true"></span></summary><div class="language-menu-options" role="group" aria-label="${en ? 'Language' : '语言'}"><a href="${en ? alternate : current}" lang="zh-CN" hreflang="zh-CN"${en ? '' : ' aria-current="page"'}>简体中文</a><a href="${en ? current : alternate}" lang="en" hreflang="en"${en ? ' aria-current="page"' : ''}>English</a></div></details>`;
  const sectionNav = library.map(section => section.status === 'available'
    ? `<a href="${base + section.href}"${current === base + section.href ? ' aria-current="page"' : ''}>${esc(section[locale].title)}</a>`
    : `<span class="khazan-nav-pending">${esc(section[locale].title)} · ${en ? 'In progress' : '待整理'}</span>`).join('');
  const chapterLinks = published.map(mission => `<a href="${route + mission.slug}/"${current === route + mission.slug + '/' ? ' aria-current="page"' : ''}>${esc(mission[locale].title)}</a>`).join('');
  return `<div class="classic-shell khazan-classic-shell">${renderDirectory({en, locale, base, current: current, library, entries, missions, esc})}<main class="classic-main" id="main"><header><nav class="classic-language-switch" aria-label="${en ? 'Language' : '语言'}">${language}</nav><h1>${esc(title)}</h1><p class="classic-subtitle">${en ? 'Guide editor: GAME NOTE' : '攻略整理：GAME NOTE'}</p><div class="classic-banner" data-pagefind-ignore="all"><div><small>GAME NOTE CLASSIC · ${en ? 'GUIDE LIBRARY' : '游戏攻略资料库'}</small><strong>${t.name}</strong></div><span>${t.status}</span></div></header><article class="khazan-classic-content" data-pagefind-body><p class="khazan-classic-lead">${esc(lead)}</p>${body}</article><footer class="classic-footer"><a href="${base}">${en ? 'Back to guide home' : '返回攻略首页'}</a> · GAME NOTE</footer></main></div>`;
}
for (const locale of ['zh', 'en']) {
  const en = locale === 'en', t = copy[locale], prefix = en ? '/en' : '', base = prefix + '/games/' + slug + '/', route = base + 'walkthrough/', chapter = route + published[0].slug + '/';
  const credit = `<aside class="khazan-reference"><h2>${t.referenceTitle}</h2><p>${t.referenceText} <a class="text-link" href="${reference}" target="_blank" rel="noopener noreferrer">${t.referenceLink} ↗</a></p></aside>`;
  const language = `<details class="language-menu"><summary aria-label="${en ? 'Choose language' : '选择语言'}"><span aria-hidden="true">◎</span> ${en ? 'English' : '简体中文'} <span class="language-chevron" aria-hidden="true"></span></summary><div class="language-menu-options" role="group" aria-label="${en ? 'Language' : '语言'}"><a href="/games/${slug}/" lang="zh-CN" hreflang="zh-CN"${en ? '' : ' aria-current="page"'}>简体中文</a><a href="/en/games/${slug}/" lang="en" hreflang="en"${en ? ' aria-current="page"' : ''}>English</a></div></details>`;
  const home = renderHome({en, t, locale, base, route, chapter, credit, language});
  const missionCards = missions.map((mission, index) => {
    const item = mission[locale], title = `${String(index + 1).padStart(2, '0')} · ${esc(item.title)}`;
    return mission.status === 'published' ? `<a class="khazan-card" href="${route + mission.slug}/"><p class="eyebrow coral">${t.routeStatus}</p><h3>${title} →</h3><p>${esc(item.summary)}</p></a>` : `<div class="khazan-card khazan-card--planned"><p class="eyebrow coral">${t.routePending}</p><h3>${title}</h3></div>`;
  }).join('');
  const index = `<section class="khazan-section"><h2 class="classic-heading">${t.index}</h2><div class="khazan-grid">${missionCards}</div></section>${credit}`;
  write(base, page(en, base, t.name + (en ? ' Guide' : '攻略'), t.lead, home, true));
  write(route, page(en, route, t.routeTitle + ' | ' + t.name, t.routeLead, renderClassicInner({en, t, locale, base, route, current: route, title: t.routeTitle, lead: t.routeLead, body: index}), true));
  for (const section of library.filter(section => section.status === 'available' && section.id !== 'walkthrough')) {
    const sectionRoute = base + section.href;
    const cards = entries.filter(entry => entry.category === section.id).map(entry => `<section class="khazan-reference-entry" id="${esc(entry.id)}"><h2>${esc(entry[locale].title)}</h2><p>${esc(entry[locale].description)}</p><ul>${entryDetails[entry.id][locale].map(point => `<li>${esc(point)}</li>`).join('')}</ul>${entry.href ? `<p><a href="${base + entry.href}">${en ? 'Read related walkthrough' : '阅读关联流程'} →</a></p>` : ''}<p class="khazan-reference-entry-source"><a href="${esc(entry.source)}" target="_blank" rel="noopener noreferrer">${en ? 'Source' : '资料来源'} ↗</a></p></section>`).join('');
    const sectionBody = `<p class="khazan-section-status">${en ? 'Reference cards · details still being checked' : '基础资料卡 · 细节持续核验中'}</p><div class="khazan-reference-list">${cards}</div><p class="classic-notice">${en ? 'This is a growing index, not a complete list of every item or character in the game.' : '本页为持续补充的资料目录，目前不代表游戏内的完整图鉴。'}</p><p><a href="${base}">← ${t.back}</a></p>`;
    write(sectionRoute, page(en, sectionRoute, section[locale].title + ' | ' + t.name, section[locale].intro, renderClassicInner({en, t, locale, base, route, current: sectionRoute, title: section[locale].title, lead: section[locale].intro, body: sectionBody}), true));
  }
  const updatesRoute = base + 'updates/';
  const updatesTitle = en ? 'Guide updates' : '攻略动态';
  const updatesBody = guideUpdates.map(update => {
    const text = en ? update.en || update : update;
    return `<section><h2 class="classic-heading">${esc(text.title)}</h2><p><time datetime="${esc(update.date)}">${esc(update.date)}</time>${update.version ? ' · '+esc(update.version) : ''}</p><p>${esc(text.description)}</p>${(text.details || []).map(detail=>`<h3>${esc(detail.title)}</h3><p>${esc(detail.text)}</p>${detail.url ? `<p><a href="${en && detail.url.startsWith('/') ? '/en' : ''}${esc(detail.url)}">${en?'Read related section':'查看相关栏目'} →</a></p>` : ''}`).join('')}</section>`;
  }).join('');
  write(updatesRoute, page(en, updatesRoute, updatesTitle + ' | ' + t.name, en?'Site guide version history.':'本站攻略版本与修改记录。',renderClassicInner({en,t,locale,base,route,current:updatesRoute,title:updatesTitle,lead:en?'Guide versions and content changes.':'记录本站攻略版本与内容变更。',body:updatesBody}),true));
  for (const mission of published) {
    const item = mission[locale], missionRoute = route + mission.slug + '/';
    const missionCredit=mission.sources?.length ? `<aside class="khazan-reference"><h2>${t.referenceTitle}</h2><ul>${mission.sources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a></li>`).join('')}</ul></aside>` : credit;
    const position=published.indexOf(mission),previous=published[position-1],next=published[position+1];
    const pager=`<nav class="classic-pager" aria-label="${en?'Mission navigation':'章节导航'}">${previous?`<a href="${route+previous.slug}/">← ${esc(previous[locale].title)}</a>`:'<span></span>'}<a href="${route}">${t.index}</a>${next?`<a href="${route+next.slug}/">${esc(next[locale].title)} →</a>`:'<span></span>'}</nav>`;
    const facts = item.atGlance.map(row => `<div><dt>${esc(row.label)}</dt><dd>${esc(row.value)}</dd></div>`).join('');
    const toc = item.sections.map((section, index) => `<a href="#${esc(section.id || 'section-' + (index + 1))}"><span>${String(index + 1).padStart(2, '0')}</span>${esc(section.heading)}</a>`).join('');
    const detail = `<div class="khazan-article"><section class="khazan-at-glance" aria-labelledby="chapter-overview"><h2 id="chapter-overview">${t.atGlanceTitle}</h2><dl>${facts}</dl></section><nav class="khazan-toc" aria-label="${t.onThisPage}"><strong>${t.onThisPage}</strong><div>${toc}</div></nav>${item.sections.map(renderSection).join('')}<p class="khazan-note">${esc(item.note || '')}</p>${missionCredit}${pager}</div>`;
    write(missionRoute, page(en, missionRoute, item.title + ' | ' + t.name, item.lead, renderClassicInner({en, t, locale, base, route, current: missionRoute, title: item.title, lead: item.lead, body: detail}), true));
  }
}
console.log(`Built ${2 * (3 + published.length + library.filter(section => section.status === 'available' && section.id !== 'walkthrough').length)} Khazan pages in two languages; ${missions.length} missions listed.`);
