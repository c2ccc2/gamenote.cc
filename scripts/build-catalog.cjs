const fs = require('node:fs');
const writeFile = require('./lib/write-file.cjs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const games = require('../content/catalog/games.json');
const renderCatalogDetail = require('./catalog-detail-template.cjs');
const origin = 'https://gamenote.cc';
const base = '/catalog/';
const groups = [
  { id: 'metroid', title: '银河战士类型', note: '以《银河战士》系列为线索：能力解锁、连通地图与路线回访。' },
  { id: 'castlevania', title: '恶魔城类型', note: '以探索式《恶魔城》作品为线索：城堡地图、装备或能力成长。' },
  { id: 'metroidvania', title: '银河恶魔城类型', note: '融合两条谱系的探索式作品；这是本站的编辑分类。' },
  { id: 'exploration-action', title: '探索动作类型', note: '收录以俯视角探索、地牢或知识解谜为主的相邻作品。' },
  { id: 'soulslike', title: '类魂动作类型', note: '收录以高压战斗、首领挑战与区域探索为主的相邻作品。' }
];
const series = {
  aggelos: { title: 'Aggelos 系列', note: '《Aggelos》与《Aggelos 2》按发行时间排列。' },
  metroid: { title: '银河战士系列', note: '从《超级银河战士》到《密特罗德：生存恐惧》。' },
  castlevania: { title: '恶魔城系列', note: '探索式恶魔城作品按发行时间排列。' },
  'kyle-thompson': { title: 'Kyle Thompson 作品', note: '《小岛》《冥界清理工》《黯井微光》出自同一位创作者。' },
  ori: { title: '奥日系列', note: '《奥日与黑暗森林》与《奥日与萤火意志》是同一系列的两部作品。' },
  'hollow-knight': { title: '空洞骑士系列', note: '《空洞骑士》与后续作品《空洞骑士：丝之歌》。' },
  ender: { title: '终焉系列', note: '《终焉之玛格诺利亚》的故事发生在《终焉之莉莉》事件数十年后。' },
  blasphemous: { title: '神之亵渎系列', note: '《神之亵渎》与续作《神之亵渎2》按发行时间排列。' }
};
const difficultyLabels = { accessible: '易上手', medium: '适中', challenging: '有挑战', pending: '待评估' };
const difficultyTag = game => `<span class="catalog-difficulty catalog-difficulty--${game.difficulty}" title="${game.difficulty === 'pending' ? '难度尚未评估，以后续实际体验为准' : '本站参考难度，按普通流程体验估计；实际感受因玩家和难度设置而异'}">难度：${difficultyLabels[game.difficulty]}</span>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const url = game => `${base}${game.slug}/`;
function shell(title, description, route, body) {
  const canonical = origin + route;
  const crumbs = [{ name: 'GAME NOTE', item: origin + '/' }, { name: '游戏图鉴', item: origin + base }, ...(route === base ? [] : [{ name: title, item: canonical }])];
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) });
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | GAME NOTE 游戏图鉴</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${esc(title)} | GAME NOTE 游戏图鉴"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/catalog.css"><script type="application/ld+json" data-breadcrumb-schema>${schema}</script></head><body><div data-site-header data-pagefind-ignore="all"></div><main class="wrap catalog-shell" data-pagefind-body>${body}</main><div data-site-footer data-pagefind-ignore="all"></div><script src="/assets/routes.js"></script><script src="/assets/content.js"></script><script src="/assets/site.js"></script><script src="/assets/catalog.js" defer></script></body></html>\n`;
}
function artwork(game, priority = false) {
  return game.cover ? `<img src="${esc(game.cover)}" alt="${esc(game.name)}官方游戏图像" loading="${priority ? 'eager' : 'lazy'}" referrerpolicy="no-referrer">` : `<div class="catalog-art-fallback" role="img" aria-label="${esc(game.name)}暂无可用封面"><span>GAME NOTE / ARCHIVE</span><strong>${esc(game.nameEn)}</strong><small>封面待补充</small></div>`;
}
function card(game) {
  return `<article class="catalog-card" data-category="${game.category}" data-year="${game.year}" data-status="${esc(game.status || 'released')}" data-release-date="${esc(game.expectedReleaseDate || '')}" data-name="${esc(game.nameEn)}" data-search="${esc((game.name + ' ' + game.nameEn + ' ' + game.features.join(' ') + ' ' + (game.aliases || []).join(' ') + ' ' + (game.series ? series[game.series].title : '')).toLowerCase())}"><a class="catalog-card-art" href="${url(game)}" target="_blank" rel="noopener noreferrer">${artwork(game)}${game.status === 'upcoming' ? '<span class="catalog-release-badge">未发售</span>' : ''}</a><div class="catalog-card-copy"><p class="catalog-card-kicker">${esc(groups.find(group => group.id === game.category).title)} · ${game.year}</p><h3><a href="${url(game)}" target="_blank" rel="noopener noreferrer">${esc(game.name)}</a></h3><p class="catalog-subtitle">${esc(game.nameEn)}</p><p>${esc(game.summary)}</p><div class="catalog-tags">${difficultyTag(game)}${game.series ? `<span>${esc(series[game.series].title)}</span>` : ''}${game.features.map(feature => `<span>${esc(feature)}</span>`).join('')}</div><div class="catalog-card-footer"><p class="catalog-platform"><span>平台</span> ${esc(game.platform)}</p><span class="catalog-resource-state">${game.guide ? '本站已有攻略' : '基础资料'}</span></div></div></article>`;
}
const compareUpcoming = (a, b) => (a.expectedReleaseDate || '9999-12-31').localeCompare(b.expectedReleaseDate || '9999-12-31') || a.nameEn.localeCompare(b.nameEn, 'en');
const compareCatalog = (a, b) => {
  if (a.status === 'upcoming' || b.status === 'upcoming') {
    if (a.status !== b.status) return a.status === 'upcoming' ? 1 : -1;
    return compareUpcoming(a, b);
  }
  return Number(a.year) - Number(b.year) || a.nameEn.localeCompare(b.nameEn, 'en');
};
function categoryShelves(group) {
  const allEntries = games.filter(game => game.category === group.id);
  const entries = allEntries.filter(game => game.status !== 'upcoming');
  const upcoming = allEntries.filter(game => game.status === 'upcoming').sort(compareUpcoming);
  const upcomingCards = upcoming.length ? `<div class="catalog-grid">${upcoming.map(card).join('')}</div>` : '';
  if (group.id === 'castlevania') {
    const items = allEntries.sort(compareCatalog);
    return `<section class="catalog-shelf" data-shelf="castlevania-type"><h3>恶魔城类型作品</h3><div class="catalog-grid">${items.map(card).join('')}</div></section>`;
  }
  const buckets = new Map();
  for (const game of entries) {
    const key = game.series || 'other';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(game);
  }
  const keys = [...buckets.keys()].sort((a, b) => {
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    const firstYear = key => Math.min(...buckets.get(key).map(game => Number(game.year)));
    return firstYear(a) - firstYear(b);
  });
  return keys.map(key => {
    const items = buckets.get(key).sort((a, b) => Number(a.year) - Number(b.year) || a.nameEn.localeCompare(b.nameEn));
    const title = key === 'other' ? (group.id === 'castlevania' ? '恶魔城系作品' : '其他作品') : series[key].title;
    return `<section class="catalog-shelf" data-shelf="${key}"><h3>${esc(title)}</h3><div class="catalog-grid">${items.map(card).join('')}</div></section>`;
  }).join('') + upcomingCards;
}


const listBody = `<nav class="site-breadcrumb" aria-label="Breadcrumb"><a href="/">GAME NOTE</a><span aria-hidden="true"> / </span><span aria-current="page">游戏图鉴</span></nav><header class="catalog-intro"><p class="eyebrow coral">GAME CATALOG</p><h1>游戏图鉴</h1><p class="lead">沿着银河战士、恶魔城、银河恶魔城、探索动作与类魂动作五条线索，认识值得探索的游戏。</p><p>这里收录游戏的基本资料与可用资源。分类用于浏览，不代表官方类型；难度是本站的参考分级，未发行作品暂不评估。本站攻略专题另有独立页面。</p></header><div class="catalog-toolbar"><label for="catalog-query">查找游戏</label><input id="catalog-query" type="search" placeholder="输入游戏名或玩法关键词" autocomplete="off"><div class="catalog-filters" role="group" aria-label="游戏分类"><button type="button" data-filter="all" aria-pressed="true">全部 <span>${games.length}</span></button>${groups.map(group => `<button type="button" data-filter="${group.id}" aria-pressed="false">${group.title} <span>${games.filter(game => game.category === group.id).length}</span></button>`).join('')}</div><div class="catalog-sort" role="group" aria-label="排列方式"><button type="button" data-sort="grouped" aria-pressed="true">按作品关系</button><button type="button" data-sort="newest" aria-pressed="false">最新优先</button></div></div><p class="catalog-count" id="catalog-count" role="status" aria-live="polite">共 ${games.length} 款游戏</p>${groups.map(group => `<section class="catalog-group" data-group="${group.id}" id="${group.id}"><div class="section-head"><div><p class="eyebrow coral">${group.id.toUpperCase()}</p><h2>${group.title}</h2></div><p>${group.note}</p></div><div class="catalog-grouped">${categoryShelves(group)}</div><div class="catalog-grid catalog-latest" hidden></div></section>`).join('')}<p class="catalog-empty" id="catalog-empty" hidden>没有找到符合条件的游戏。</p>`;
function detail(game) {
  const group = groups.find(item => item.id === game.category);
  const family = game.series ? games.filter(item => item.series === game.series && item.slug !== game.slug) : [];
  const file = path.join(root, 'catalog', game.slug, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const pageBody = game.slug === 'hollow-knight' ? fs.readFileSync(path.join(root, 'content', 'catalog', 'hollow-knight-feature.html'), 'utf8') : renderCatalogDetail(game, { group, family, series, url, esc, artwork, difficultyTag });
  writeFile(file, shell(game.name, game.summary, url(game), pageBody));
}
if (new Set(games.map(game => game.slug)).size !== games.length) throw Error('Duplicate catalog slug');
for (const game of games) {
  if (!groups.some(group => group.id === game.category) || !game.source || !difficultyLabels[game.difficulty]) throw Error('Incomplete catalog entry: ' + game.slug);
  if (!game.cover || !game.cover.startsWith('/') || !fs.existsSync(path.join(root, game.cover.slice(1)))) throw Error('Catalog cover must be local: ' + game.slug);
  detail(game);
}
fs.mkdirSync(path.join(root, 'catalog'), { recursive: true });
writeFile(path.join(root, 'catalog', 'index.html'), shell('游戏图鉴', '银河战士、恶魔城与银河恶魔城游戏名录，查看游戏资料、本站攻略与官方资源。', base, listBody));
console.log(`Built catalog index and ${games.length} game pages.`);
require('./build-catalog-en.cjs');
require('./finalize-catalog.cjs');






