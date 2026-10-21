const fs = require('node:fs');
const writeFile = require('./lib/write-file.cjs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const games = require('../content/catalog/games.json');
const copy = require('../content/catalog/editorial.en.json');
const zhEditorial = require('../content/catalog/editorial.json');
const origin = 'https://gamenote.cc';
const groups = [
  { id: 'metroid', title: 'Metroid', note: 'Ability upgrades, connected maps and routes worth revisiting.' },
  { id: 'castlevania', title: 'Castlevania', note: 'Exploratory castles, equipment and character growth.' },
  { id: 'metroidvania', title: 'Metroidvania', note: 'Exploration-focused games in the broader tradition.' },
  { id: 'exploration-action', title: 'Exploration Action', note: 'Neighboring games built around dungeons, puzzles and discovery.' },
  { id: 'soulslike', title: 'Soulslike Action', note: 'Demanding combat and interconnected areas.' }
];
const series = { aggelos:'Aggelos series', metroid:'Metroid series', castlevania:'Castlevania series', 'hollow-knight':'Hollow Knight series', ori:'Ori series', 'kyle-thompson':'Kyle Thompson games', ender:'Ender series', blasphemous:'Blasphemous series' };
const difficulties = { accessible:'Approachable', medium:'Moderate', challenging:'Challenging', pending:'To be assessed' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const url = game => '/en/catalog/' + game.slug + '/';
const picture = (game, eager=false) => `<img src="${esc(game.cover)}" alt="${esc(game.nameEn)} game artwork" loading="${eager?'eager':'lazy'}">`;
const difficulty = game => `<span class="catalog-difficulty catalog-difficulty--${game.difficulty}">Difficulty: ${difficulties[game.difficulty]}</span>`;
function shell(title, description, route, body) {
  const chinese = route.replace(/^\/en\//, '/');
  const canonical = origin + route;
  const crumbs = [{name:'GAME NOTE',item:origin+'/'} ,{name:'Game Catalog',item:origin+'/en/catalog/'}, ...(route === '/en/catalog/' ? [] : [{name:title,item:canonical}])];
  const schema = JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))});
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | GAME NOTE Catalog</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="zh-CN" href="${origin+chinese}"><link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${origin+chinese}"><meta property="og:title" content="${esc(title)} | GAME NOTE Catalog"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/catalog.css"><script type="application/ld+json" data-breadcrumb-schema>${schema}</script></head><body><div data-site-header data-pagefind-ignore="all"></div><main class="wrap catalog-shell" data-pagefind-body>${body}</main><div data-site-footer data-pagefind-ignore="all"></div><script src="/assets/routes.js"></script><script src="/assets/content.js"></script><script src="/assets/content.en.js"></script><script src="/assets/site.js"></script><script src="/assets/catalog.js" defer></script></body></html>
`;
}
function card(game) {
  const c = copy[game.slug], group = groups.find(x=>x.id===game.category);
  const terms = [game.name,game.nameEn,...(game.aliases||[]),...game.features,group.title,series[game.series]||''].join(' ').toLowerCase();
  return `<article class="catalog-card" data-category="${game.category}" data-year="${game.year}" data-status="${esc(game.status || 'released')}" data-release-date="${esc(game.expectedReleaseDate || '')}" data-name="${esc(game.nameEn)}" data-search="${esc(terms)}"><a class="catalog-card-art" href="${url(game)}" target="_blank" rel="noopener noreferrer">${picture(game)}${game.status==='upcoming'?'<span class="catalog-release-badge">Upcoming</span>':''}</a><div class="catalog-card-copy"><p class="catalog-card-kicker">${group.title} · ${game.year}</p><h3><a href="${url(game)}" target="_blank" rel="noopener noreferrer">${esc(game.nameEn)}</a></h3><p>${esc(c.summary)}</p><div class="catalog-tags">${difficulty(game)}${game.series?`<span>${esc(series[game.series])}</span>`:''}</div><div class="catalog-card-footer"><p class="catalog-platform"><span>Platform</span> ${esc((game.platformEn || game.platform).replace(/（/g, ' (').replace(/）/g, ')'))}</p><span class="catalog-resource-state">${game.guide?'Guide available':'Game profile'}</span></div></div></article>`;
}
const compareUpcoming = (a, b) => (a.expectedReleaseDate || '9999-12-31').localeCompare(b.expectedReleaseDate || '9999-12-31') || a.nameEn.localeCompare(b.nameEn, 'en');
const compareCatalog = (a, b) => {
  if (a.status === 'upcoming' || b.status === 'upcoming') {
    if (a.status !== b.status) return a.status === 'upcoming' ? 1 : -1;
    return compareUpcoming(a, b);
  }
  return Number(a.year) - Number(b.year) || a.nameEn.localeCompare(b.nameEn, 'en');
};
function shelves(group) {
  const upcoming = games.filter(g=>g.category===group.id && g.status==='upcoming').sort(compareUpcoming);
  const upcomingCards = upcoming.length ? `<div class="catalog-grid">${upcoming.map(card).join('')}</div>` : '';
  if (group.id === 'castlevania') {
    const items = games.filter(g=>g.category===group.id).sort(compareCatalog);
    return `<section class="catalog-shelf" data-shelf="castlevania-type"><h3>Castlevania-style games</h3><div class="catalog-grid">${items.map(card).join('')}</div></section>`;
  }
  const buckets = new Map();
  for(const game of games.filter(g=>g.category===group.id && g.status!=='upcoming')){const key=game.series||'other';if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(game)}
  const keys=[...buckets.keys()].sort((a,b)=>a==='other'?1:b==='other'?-1:Math.min(...buckets.get(a).map(g=>+g.year))-Math.min(...buckets.get(b).map(g=>+g.year)));
  return keys.map(key=>`<section class="catalog-shelf" data-shelf="${key}"><h3>${esc(series[key]||(group.id==='castlevania'?'Castlevania-inspired games':'Other games'))}</h3><div class="catalog-grid">${buckets.get(key).sort((a,b)=>+a.year- +b.year||a.nameEn.localeCompare(b.nameEn)).map(card).join('')}</div></section>`).join('') + upcomingCards;
}


function detail(game) {
  const c=copy[game.slug], group=groups.find(g=>g.id===game.category);
  const family=game.series?games.filter(g=>g.series===game.series&&g.slug!==game.slug):[];
  const upcoming=game.status==='upcoming';
  const resource=(label,title,href,external=true)=>`<a class="catalog-resource" href="${esc(href)}"${external?' target="_blank" rel="noopener noreferrer"':''}><span>${label}</span><strong>${title} ↗</strong></a>`;
  const guide=game.guideEn||(game.guide&&game.guide.startsWith('/')?'/en'+game.guide:game.guide);
  const resources=[game.news&&resource('Further reading',esc(game.newsTitleEn || '2026 game watchlist'),'/en'+game.news,false),guide&&resource('Site guide','Open guide',guide,false),game.video&&resource('Walkthrough video','Watch video',game.video),game.store&&resource('Store','View store page',game.store),resource('Source','View game information',game.source)].filter(Boolean).join('');
  const related=family.length?`<section class="catalog-featured-section catalog-featured-related"><p class="eyebrow coral">CONNECTED GAMES</p><h2>${esc(series[game.series])}</h2><div class="catalog-featured-siblings">${family.map(g=>`<a href="${url(g)}" target="_blank" rel="noopener noreferrer"><strong>${esc(g.nameEn)}</strong><span>${g.year} · View profile ↗</span></a>`).join('')}</div></section>`:'';
  const body=`<nav class="site-breadcrumb" aria-label="Breadcrumb"><a href="/en/">GAME NOTE</a><span aria-hidden="true"> / </span><a href="/en/catalog/">Game Catalog</a><span aria-hidden="true"> / </span><span aria-current="page">${esc(game.nameEn)}</span></nav><article class="catalog-detail catalog-featured-detail"><header class="catalog-featured-hero"><div class="catalog-featured-image">${picture(game,true)}</div><div class="catalog-featured-intro"><p class="eyebrow coral">GAME CATALOG / ${group.title}</p><h1>${esc(game.nameEn)}</h1><p class="catalog-featured-original">${game.year} · ${esc(game.creator)}</p><p class="catalog-featured-verdict">${esc(c.summary)}</p><div class="catalog-featured-chips"><span>${group.title}</span>${difficulty(game)}<span>First playthrough: ${esc(c.hours)}</span></div><a class="catalog-featured-jump" href="#game-review">Read our take ↓</a></div></header><nav class="catalog-featured-nav" aria-label="On this page"><a href="#game-review">Our take</a><a href="#game-time">Time & replay</a><a href="#game-fit">Who it suits</a><a href="#game-resources">Resources</a></nav><div class="catalog-featured-layout"><div class="catalog-featured-main"><section id="game-review" class="catalog-featured-section"><p class="eyebrow coral">EDITORIAL VIEW</p><h2>Our take</h2><p>${esc(c.review)}</p>${c.reviewClosing?`<p class="catalog-review-closing">${esc(c.reviewClosing)}</p>`:''}<p class="catalog-featured-note">An editorial impression to help choose a game, not a community score.</p></section><section id="game-time" class="catalog-featured-section"><p class="eyebrow coral">TIME & REPLAY</p><h2>Time & replay</h2><div class="catalog-time-grid"><div><small>First playthrough</small><strong>${esc(c.hours)}</strong><p>${upcoming?'To be verified after release.':'A broad first-clear estimate; exploration and difficulty change the actual time.'}</p></div><div><small>Replay design</small><strong>${esc(c.replayStatus)}</strong><p>${esc(c.replay)}</p></div></div></section><section id="game-fit" class="catalog-featured-section"><p class="eyebrow coral">BEFORE YOU START</p><h2>Who it suits</h2><div class="catalog-fit-grid"><div><h3>You may enjoy it if</h3><p>${esc(c.fit)}</p></div><div><h3>Keep in mind</h3><p>${esc(c.caution)}</p></div></div></section>${related}</div><aside class="catalog-featured-aside"><section class="catalog-panel"><h2>Game facts</h2><dl><div><dt>Status</dt><dd>${game.releaseStatusEn?esc(game.releaseStatusEn):game.steamRelease?esc(game.steamRelease.en):upcoming?'Upcoming':'Released'}</dd></div>${game.steamRelease?`<div><dt>Steam checked</dt><dd>${esc(game.steamRelease.checked)}</dd></div><div><dt>Name note</dt><dd>${esc(game.steamRelease.nameNoteEn)}</dd></div>`:''}${game.releaseDateEn?`<div><dt>Release date</dt><dd>${esc(game.releaseDateEn)}</dd></div><div><dt>Checked</dt><dd>${esc(game.releaseChecked)}</dd></div>`:''}<div><dt>Year</dt><dd>${game.year}</dd></div><div><dt>Creator</dt><dd>${esc(game.creator)}</dd></div><div><dt>Listed platform</dt><dd>${esc(game.platform)}</dd></div><div><dt>Catalog type</dt><dd><a href="/en/catalog/#${group.id}">${group.title}</a></dd></div></dl></section><section id="game-resources" class="catalog-panel catalog-resources"><h2>Resources</h2>${!game.guide||!game.video?`<p class="catalog-featured-resource-status">${[!game.guide&&'Site guide',!game.video&&'walkthrough video'].filter(Boolean).join(' and ')} pending.</p>`:''}${resources}</section></aside></div><footer class="catalog-featured-footer"><a href="/en/catalog/#${group.id}">← Back to ${group.title}</a></footer></article>`;
  const file=path.join(root,'en','catalog',game.slug,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});writeFile(file,shell(game.nameEn,c.summary,url(game),body));
}
const selectedGame=process.argv.includes('--game')?process.argv[process.argv.indexOf('--game')+1]:null;
for(const game of games.filter(game=>!selectedGame||game.slug===selectedGame)){if(!copy[game.slug])throw Error('Missing English catalog copy: '+game.slug);detail(game)}
const list=`<nav class="site-breadcrumb" aria-label="Breadcrumb"><a href="/en/">GAME NOTE</a><span aria-hidden="true"> / </span><span aria-current="page">Game Catalog</span></nav><header class="catalog-intro"><p class="eyebrow coral">GAME CATALOG</p><h1>Game Catalog</h1><p class="lead">Explore Metroid, Castlevania, metroidvanias and neighboring action adventures.</p><p>Each profile brings together a short introduction, an editorial take, play-time guidance and useful links. Categories and difficulty labels are GAME NOTE editorial guides.</p></header><div class="catalog-toolbar"><label for="catalog-query">Find a game</label><input id="catalog-query" type="search" placeholder="Name or gameplay keyword" autocomplete="off"><div class="catalog-filters" role="group" aria-label="Game categories"><button type="button" data-filter="all" aria-pressed="true">All <span>${games.length}</span></button>${groups.map(g=>`<button type="button" data-filter="${g.id}" aria-pressed="false">${g.title} <span>${games.filter(x=>x.category===g.id).length}</span></button>`).join('')}</div><div class="catalog-sort" role="group" aria-label="Sort order"><button type="button" data-sort="grouped" aria-pressed="true">By series</button><button type="button" data-sort="newest" aria-pressed="false">Newest first</button></div></div><p class="catalog-count" id="catalog-count" role="status" aria-live="polite">${games.length} games</p>${groups.map(g=>`<section class="catalog-group" data-group="${g.id}" id="${g.id}"><div class="section-head"><div><p class="eyebrow coral">${g.id.toUpperCase()}</p><h2>${g.title}</h2></div><p>${g.note}</p></div><div class="catalog-grouped">${shelves(g)}</div><div class="catalog-grid catalog-latest" hidden></div></section>`).join('')}<p class="catalog-empty" id="catalog-empty" hidden>No games match your search.</p>`;
fs.mkdirSync(path.join(root,'en','catalog'),{recursive:true});
writeFile(path.join(root,'en','catalog','index.html'),shell('Game Catalog','Explore 27 games with introductions, editorial notes, play-time guidance and useful links.','/en/catalog/',list));
console.log('Built English catalog index and '+games.length+' game pages.');
