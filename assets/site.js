(function () {
  const content = window.GAMENOTE_CONTENT;
  const en = document.documentElement.lang === 'en';
  const root = en ? '/en/' : '/';
  const tr = (zh, english) => en ? english : zh;
  const zhPath = location.pathname.replace(/^\/en\//, '/');
  const paired = zhPath === '/' || /^\/(games|notes|updates|about|search)\/$/.test(zhPath) || /^\/(notes|updates)\/[^/]+\/$/.test(zhPath);
  const languageUrl = (en ? zhPath : '/en' + (paired ? zhPath : '/')) + location.search + location.hash;
  const sectionNames = {Walkthrough:'图文流程',Maps:'地图',Bosses:'Boss 攻略',Abilities:'能力',Collectibles:'收集',Systems:'系统',Spirits:'灵魂',Relics:'遗物'};
  // GTM is injected once by build-analytics.cjs for both main-site and Classic pages.
  const gameById = id => content.games.find(game => game.id === id);
  const formatDate = value => {
    if (!en) return value.replaceAll('-', '/');
    const date = new Date(value + 'T00:00:00');
    return `${date.toLocaleString('en', { month: 'short' }).toUpperCase()} ${String(date.getDate()).padStart(2, '0')}`;
  };

  function languageSwitch() {
    const current = `<span lang="${en?'en':'zh-CN'}" aria-current="true" aria-label="${en?'Current language: English':'当前语言：中文'}">${en?'EN':'中文'}</span>`;
    const other = `<a href="${languageUrl}" lang="${en?'zh-CN':'en'}" hreflang="${en?'zh-CN':'en'}" aria-label="${en?'切换为中文':'Switch to English'}">${en?'中文':'EN'}</a>`;
    return `<div class="language-switch" role="group" aria-label="${tr('语言','Language')}">${en?other:current}<span aria-hidden="true">/</span>${en?current:other}</div>`;
  }
  function header() {
    return `<header class="site-header"><nav class="wrap"><a class="brand" href="${root}" aria-label="${tr('GAME NOTE 首页','GAME NOTE home')}"><i>✦</i>GAME<span>NOTE</span>.CC</a><div class="nav" id="site-menu" aria-label="${tr('主导航','Main navigation')}"><a href="${root}games/">${tr('游戏','Games')}</a><a href="${root}notes/">${tr('手记','Notes')}</a><a href="${root}updates/">${tr('更新','Updates')}</a><a href="${root}about/">${tr('关于','About')}</a><a href="${root}search/">${tr('搜索','Search')}</a></div>${languageSwitch()}<button class="menu-toggle" aria-controls="site-menu" aria-expanded="false" type="button">${tr('菜单','Menu')}</button></nav></header>`;
  }
  function footer() {
    return `<footer><div class="wrap footer"><div><b>GAME NOTE</b><p>${tr('从实际游玩出发，认真整理游戏攻略。','Guides made from actually playing the game.')}</p></div><div class="footer-links"><a href="${root}games/">${tr('游戏','Games')}</a><a href="${root}notes/">${tr('手记','Notes')}</a><a href="${root}updates/">${tr('更新','Updates')}</a><a href="${root}about/">${tr('关于','About')}</a><a href="/privacy.html">${tr('隐私','Privacy (Chinese)')}</a></div></div></footer>`;
  }
  function gameCard(game) {
    const title = en ? game.title : game.titleZh;
    const status = game.status === 'Complete' ? tr('已完成','Complete') : tr('整理中','In Progress');
    const cover = game.cover ? `<img src="${game.cover}" alt="${title} ${tr('游戏宣传图','game artwork')}" loading="lazy">` : `<div class="game-cover game-cover--type"><span>GAME NOTE${game.theme === 'classic' ? ' CLASSIC' : ''}</span><strong>${title}</strong><small>${tr('攻略整理中','GUIDE IN PROGRESS')}</small></div>`;
    return `<article class="game-card"><a class="game-cover-link" href="${game.guideUrl}">${cover}</a><div class="game-copy"><div class="card-topline"><span class="status ${game.status === 'Complete' ? 'status--complete' : ''}">${status}</span></div><h3><a href="${game.guideUrl}">${title}</a></h3><p>${game.description}</p><div class="section-tags">${game.sections.map(s => `<span>${en?s:sectionNames[s]||s}</span>`).join('')}</div><a class="text-link" href="${game.guideUrl}">${tr('打开攻略档案','Open guide')} <b>→</b></a></div></article>`;
  }
  function noteCard(note) {
    const game = note.game && gameById(note.game);
    const category = en ? note.categoryLabel : ({'behind-the-guide':'攻略幕后','map-making':'地图制作'}[note.category] || note.categoryLabel) + (note.categoryLabel.includes('Site Note') ? ' / 站点观察' : '');
    const url = (en ? '/en' : '') + note.url;
    return `<article class="note-card"><p class="eyebrow coral">${category}</p><h3><a href="${url}" target="_blank" rel="noopener noreferrer">${note.title}</a></h3><p>${note.description}</p><div class="note-meta"><time datetime="${note.date}">${formatDate(note.date)}</time>${game ? `<a href="${game.guideUrl}">${en?game.title:game.titleZh||game.title}</a>` : ''}</div><a class="text-link" href="${url}" target="_blank" rel="noopener noreferrer">${tr('阅读手记','Read note')} <b>→</b></a></article>`;
  }
  function updateItem(update) {
    const game = update.game && gameById(update.game);
    const type=en?update.type:({Site:'站点',Boss:'Boss',Map:'地图'}[update.type]||update.type);
    return `<article class="update-item"><time datetime="${update.date}">${formatDate(update.date)}</time><div><span class="update-project">${game ? (en?game.title:game.titleZh) : 'GAME NOTE'}</span><a href="${(en?'/en':'')+update.url}" target="_blank" rel="noopener noreferrer">${update.title}</a><p>${update.description}</p></div><span class="update-type">${type}</span></article>`;
  }

  document.querySelectorAll('[data-site-header]').forEach(node => node.outerHTML = header());
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  const closeMenu = () => { menu?.classList.remove('is-open'); menuButton?.setAttribute('aria-expanded', 'false'); };
  menuButton?.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.classList.contains('is-open')) { closeMenu(); menuButton?.focus(); } });
  matchMedia('(max-width:680px)').addEventListener('change', closeMenu);
  document.querySelectorAll('[data-site-footer]').forEach(node => node.outerHTML = footer());
  document.querySelectorAll('[data-games]').forEach(node => {
    const filter = node.dataset.games;
    const games = filter === 'featured' ? content.games.filter(game => game.featured) : content.games;
    node.innerHTML = games.sort((a, b) => a.order - b.order).map(gameCard).join('');
  });
  document.querySelectorAll('[data-notes]').forEach(node => {
    const limit = Number(node.dataset.notes) || content.notes.length;
    const category = location.pathname.endsWith('/notes/') && new URLSearchParams(location.search).get('category');
    node.innerHTML = [...content.notes].filter(note => note.listed !== false && (!category || note.category === category)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit).map(noteCard).join('');
  });
  document.querySelectorAll('[data-updates]').forEach(node => {
    const limit = Number(node.dataset.updates) || content.updates.length;
    node.innerHTML = content.updates.slice(0, limit).map(updateItem).join('');
  });
  document.querySelectorAll('[data-game-page]').forEach(node => {
    const game = content.games.find(item => item.slug === node.dataset.gamePage);
    if (!game) return;
    node.innerHTML = `<section class="game-page-hero"><div><p class="eyebrow coral">GAME GUIDE ARCHIVE</p><h1>${game.title}<span>${game.titleZh}</span></h1><p class="lead">${game.description}</p><div class="hero-actions"><a class="button" href="#start-here">从这里开始</a><a class="button button--quiet" href="#guide-sections">攻略目录</a></div></div><aside class="game-facts"><span class="status">${game.status}</span><dl><div><dt>平台</dt><dd>${game.platforms.join(' · ')}</dd></div><div><dt>类型</dt><dd>${game.genres.join(' · ')}</dd></div><div><dt>最后整理</dt><dd>${formatDate(game.lastUpdated)}</dd></div></dl></aside></section><section class="section guide-overview" id="start-here"><div class="section-head"><div><p class="eyebrow coral">START HERE</p><h2>从井底开始。</h2></div><p>这份新攻略仍在建立。先从最需要的入口开始，资料会在每次实际游玩与复核后补充。</p></div><div class="start-grid" id="guide-sections">${game.sections.map((section, index) => `<a href="#work-in-progress" class="start-card"><span>0${index + 1}</span><h3>${section}</h3><p>${section === 'Walkthrough' ? '按区域与推进节点跟读。' : section === 'Maps' ? '按区域确认出口、能力门槛与回访方向。' : section === 'Bosses' ? '记录招式、奖励与准备建议。' : '整理隐藏路线与不会重复的收集项目。'}</p><b>即将整理 →</b></a>`).join('')}</div></section><section class="work-note" id="work-in-progress"><p class="eyebrow coral">CURRENTLY WORKING ON</p><h2>正在建立《黯井微光》的图文流程资料。</h2><p>第一阶段会先完成区域目录、主线推进节点与地图关系；不以未验证的信息填充空栏目。</p></section>`;
  });
})();
