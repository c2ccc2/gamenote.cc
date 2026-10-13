const fs = require('node:fs');
const writeFile = require('./lib/write-file.cjs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://gamenote.cc';
const items = require('../content/news.json');
const games = require('../content/catalog/games.json');
const gameBySlug = new Map(games.map(game => [game.slug, game]));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const labels = {
  zh: { title: '动态', subtitle: '游戏随记与资讯', lead: '记录与本站收录游戏有关的短篇观察和消息。资讯会标明原始来源；网站自身的更新记录收在关于页面。', all: '全部', note: '随记', news: '资讯', count: '条动态', source: '原始来源', game: '关联游戏', back: '返回动态', empty: '第一篇动态正在整理中。', description: 'GAME NOTE 动态：游戏随记、资讯与原始来源。' },
  en: { title: 'News', subtitle: 'Game notes and news', lead: 'Short observations and news about games in the catalog. News links to its original source; site changes are recorded on the About page.', all: 'All', note: 'Notes', news: 'News', count: 'posts', source: 'Original source', game: 'Related game', back: 'Back to News', empty: 'The first post is being prepared.', description: 'GAME NOTE News: game notes, news and original sources.' }
};
if (!Array.isArray(items)) throw Error('content/news.json must be an array');
const seen = new Set();
for (const item of items) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || seen.has(item.slug)) throw Error('Invalid or duplicate news slug: ' + item.slug);
  seen.add(item.slug);
  if (!['note', 'news'].includes(item.type) || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date))) throw Error('Invalid news type or date: ' + item.slug);
  if (item.game && !gameBySlug.has(item.game)) throw Error('Unknown catalog game: ' + item.game);
  for (const language of ['zh', 'en']) if (!item[language]?.title || !item[language]?.summary || !Array.isArray(item[language]?.body) || !item[language].body.length || item[language].body.some(p => !p.trim())) throw Error('Missing localized news content: ' + item.slug + ' ' + language);
  if (item.type === 'news' && (!item.source?.label || !/^https:\/\//.test(item.source?.url || ''))) throw Error('News needs an HTTPS original source: ' + item.slug);
  for(const game of item.recommendations||[]){
    if(!gameBySlug.has(game.slug)||!/^https:\/\//.test(game.source)||!Number.isInteger(game.seconds)||!game.image?.startsWith('/assets/news/')||!fs.existsSync(path.join(root,game.image.slice(1))))throw Error('Invalid recommendation: '+game.name);
    for(const locale of ['zh','en'])if(['type','play','appeal','status'].some(key=>!game[locale]?.[key]))throw Error('Missing recommendation translation: '+game.name);
  }
}
items.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
function page(locale, title, description, route, body, article = false) {
  const en = locale === 'en', zhRoute = route.replace(/^\/en\//, '/'), enRoute = route.startsWith('/en/') ? route : '/en' + route;
  const crumbs = [{ name: 'GAME NOTE', item: origin + (en ? '/en/' : '/') }, { name: labels[locale].title, item: origin + (en ? '/en/news/' : '/news/') }, ...(article ? [{ name: title, item: origin + route }] : [])];
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })) });
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | GAME NOTE</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin + route}"><link rel="alternate" hreflang="zh-CN" href="${origin + zhRoute}"><link rel="alternate" hreflang="en" href="${origin + enRoute}"><link rel="alternate" hreflang="x-default" href="${origin + zhRoute}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin + route}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/news.css"><script type="application/ld+json" data-breadcrumb-schema>${schema}</script></head><body><div data-site-header data-pagefind-ignore="all"></div><main class="wrap news-shell" data-pagefind-body>${body}</main><div data-site-footer data-pagefind-ignore="all"></div><script src="/assets/routes.js"></script><script src="/assets/content.js"></script>${en ? '<script src="/assets/content.en.js"></script>' : ''}<script src="/assets/site.js"></script>${article ? '' : '<script src="/assets/news.js" defer></script>'}</body></html>\n`;
}
function write(route, html) {
  const file = path.join(root, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  writeFile(file, html);
}
function recommendationList(item,locale){
  if(!item.recommendations)return '';
  const en=locale==='en';
  return `<nav class="news-game-index" aria-label="${en?'Games in this article':'本文游戏目录'}"><ol>${item.recommendations.map((game,index)=>`<li><a href="#game-${index+1}">${esc(game[locale].name || game.name)}</a></li>`).join('')}</ol></nav>`+item.recommendations.map((game,index)=>{
    const text=game[locale];
    const name=text.name || game.name;
    return `<section class="news-game-section" id="game-${index+1}"><h2>${index+1}. ${esc(name)}</h2>${text.nameNote ? `<p>${esc(text.nameNote)}${!en && name!==game.name ? ` · ${esc(game.name)}` : ''}</p>` : ''}<p class="news-game-meta">${esc(text.type)} · ${esc(text.status)}</p><figure><img src="${esc(game.image)}" alt="${esc(name)} ${en?'video screenshot':'视频截图'}" width="640" height="360" loading="lazy"></figure><p><strong>${en?'How it plays':'核心玩法'}：</strong>${esc(text.play)}</p><p><strong>${en?'Who might enjoy it':'适合谁'}：</strong>${esc(text.appeal)}</p><p class="news-game-sources"><a href="${en?'/en':''}/catalog/${game.slug}/">${en?'Game catalog':'游戏图鉴'} →</a> · <a href="https://www.youtube.com/watch?v=CmGp9ZYn7qg&amp;t=${game.seconds}s" target="_blank" rel="noopener noreferrer">${en?'Original video':'原视频'} ${esc(game.time)}</a> · <a href="${esc(game.source)}" target="_blank" rel="noopener noreferrer">${en?'Official Steam page':'官方 Steam 页面'} ↗</a></p></section>`;
  }).join('');
}
const urls = [];
for (const locale of ['zh', 'en']) {
  const en = locale === 'en', prefix = en ? '/en' : '', t = labels[locale], listRoute = prefix + '/news/';
  const cards = items.map(item => {
    const game = item.game && gameBySlug.get(item.game), route = listRoute + item.slug + '/';
    return `<article class="news-card" data-news-type="${item.type}"><div class="news-card-meta"><span class="news-type">${t[item.type]}</span><time datetime="${item.date}">${item.date}</time>${game ? `<a href="${prefix}/catalog/${game.slug}/">${esc(en ? game.nameEn : game.name)}</a>` : ''}</div><h2><a href="${route}">${esc(item[locale].title)}</a></h2><p>${esc(item[locale].summary)}</p>${item.type === 'news' ? `<span class="news-source">${t.source}: ${esc(item.source.label)}</span>` : ''}</article>`;
  }).join('');
  const list = `<nav class="site-breadcrumb" aria-label="Breadcrumb"><a href="${en ? '/en/' : '/'}">GAME NOTE</a><span aria-hidden="true"> / </span><span aria-current="page">${t.title}</span></nav><header class="news-intro"><p class="eyebrow coral">GAME NOTE / ${en ? 'NEWS' : '动态'}</p><h1>${t.title}</h1><p class="lead">${t.lead}</p></header><div class="news-toolbar" role="group" aria-label="${en ? 'Filter news' : '筛选动态'}"><button type="button" data-news-filter="all" aria-pressed="true">${t.all} <span>${items.length}</span></button><button type="button" data-news-filter="note" aria-pressed="false">${t.note} <span>${items.filter(item => item.type === 'note').length}</span></button><button type="button" data-news-filter="news" aria-pressed="false">${t.news} <span>${items.filter(item => item.type === 'news').length}</span></button></div><p class="news-count" data-news-count role="status" aria-live="polite">${items.length} ${t.count}</p><div class="news-list" data-news>${cards}</div><p class="news-empty" data-news-empty${items.length ? ' hidden' : ''}>${t.empty}</p>`;
  write(listRoute, page(locale, t.title, t.description, listRoute, list));
  urls.push(listRoute);
  for (const item of items) {
    const route = listRoute + item.slug + '/', game = item.game && gameBySlug.get(item.game), copy = item[locale];
    const body = `<nav class="site-breadcrumb" aria-label="Breadcrumb"><a href="${en ? '/en/' : '/'}">GAME NOTE</a><span aria-hidden="true"> / </span><a href="${listRoute}">${t.title}</a><span aria-hidden="true"> / </span><span aria-current="page">${esc(copy.title)}</span></nav><article class="news-article"><header><div class="news-card-meta"><span class="news-type">${t[item.type]}</span><time datetime="${item.date}">${item.date}</time></div><h1>${esc(copy.title)}</h1><p class="lead">${esc(copy.summary)}</p></header><div class="news-prose">${copy.body.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}${recommendationList(item,locale)}${item.videoSource?`<p class="news-game-sources"><a href="${esc(item.videoSource)}" target="_blank" rel="noopener noreferrer">${en?'Bilibili dubbed version and screenshot source':'B 站中配版本与截图来源'} ↗</a></p>`:''}</div>${game ? `<aside class="news-related"><span>${t.game}</span><a href="${prefix}/catalog/${game.slug}/">${esc(en ? game.nameEn : game.name)} →</a></aside>` : ''}${item.type === 'news' ? `<aside class="news-related"><span>${t.source}</span><a href="${esc(item.source.url)}" target="_blank" rel="noopener noreferrer">${esc(item.source.label)} ↗</a></aside>` : ''}<p><a class="text-link" href="${listRoute}">← ${t.back}</a></p></article>`;
    write(route, page(locale, copy.title, copy.summary, route, body, true));
    urls.push(route);
  }
}
const sitemap = path.join(root, 'sitemap.xml');
let xml = fs.readFileSync(sitemap, 'utf8');
for (const route of urls) if (!xml.includes('<loc>' + origin + route + '</loc>')) xml = xml.replace('</urlset>', `<url><loc>${origin + route}</loc></url>\n</urlset>`);
writeFile(sitemap, xml);
console.log(`Built ${urls.length} bilingual news pages (${items.length} entries).`);
