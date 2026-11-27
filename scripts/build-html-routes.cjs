const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const writeFile = require('./lib/write-file.cjs');
const root = path.resolve(__dirname, '..');
const origin = 'https://gamenote.cc';

function indexFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return indexFiles(file);
    return entry.name === 'index.html' ? [file] : [];
  });
}

const pages = ['catalog','news','games','notes','updates','about','search','en']
  .flatMap(dir => indexFiles(path.join(root, dir)))
  .map(file => {
    const route = '/' + path.relative(root, file).split(path.sep).join('/').replace(/index\.html$/, '');
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    return {file, route, $};
  });
const routes = new Map(pages.map(({route, $}) => {
  const canonical = $('link[rel=canonical]').attr('href');
  if ($('meta[http-equiv=refresh]').length && canonical?.startsWith(origin + '/')) {
    return [route, new URL(canonical).pathname];
  }
  return [route, route.slice(0, -1) + '.html'];
}));
const rewrite = (value, route) => {
  if (!value || /^(?:#|\?|\/\/|data:)/.test(value)) return value;
  const url = new URL(value, origin + route);
  if (url.origin !== origin) return value;
  const key = url.pathname.replace(/\/index\.html$/, '/');
  const first = routes.get(key);
  const target = routes.get(first) || first;
  if (!target) return value;
  return (/^https?:/i.test(value) ? origin : '') + target + url.search + url.hash;
};

function renderChrome($, route) {
  if (!$('[data-site-header],[data-site-footer]').length) return;
  const en = $('html').attr('lang') === 'en';
  const prefix = en ? '/en' : '';
  const label = (zh, english) => en ? english : zh;
  const home = prefix + '/';
  const nav = [['news','动态','News'],['catalog','图鉴','Catalog'],['games','攻略','Guides'],['about','关于','About'],['search','搜索','Search']]
    .map(([slug, zh, english]) => `<a href="${home}${slug}/">${label(zh, english)}</a>`);
  const other = $('link[hreflang="' + label('en', 'zh-CN') + '"]').attr('href') || label('/en/', '/');
  const language = $('<details class="language-menu"><summary><span aria-hidden="true">◎</span> <span class="language-label"></span> <span class="language-chevron" aria-hidden="true"></span></summary><div class="language-menu-options"><a lang="zh-CN" hreflang="zh-CN">简体中文</a><a lang="en" hreflang="en">English</a></div></details>');
  language.find('summary').attr('aria-label',label('选择语言','Choose language'));
  language.find('.language-label').text(label('简体中文','English'));
  language.find('[lang=zh-CN]').attr('href',en ? other : route);
  language.find('[lang=en]').attr('href',en ? route : other);
  language.find(en ? '[lang=en]' : '[lang=zh-CN]').attr('aria-current','page');
  $('[data-site-header]').html(`<header class="site-header"><nav class="wrap"><a class="brand" href="${home}"><i>✦</i>GAME<span>NOTE</span>.CC</a><div class="nav" id="site-menu" aria-label="${label('主导航','Main navigation')}">${nav.join('')}</div>${$.html(language)}<button class="menu-toggle" aria-controls="site-menu" aria-expanded="false" type="button">${label('菜单','Menu')}</button></nav></header>`);
  $('[data-site-footer]').html(`<footer><div class="wrap footer"><div><b>GAME NOTE</b><p>${label('从实际游玩出发，认真整理游戏攻略。','Guides made from actually playing the game.')}</p></div><div class="footer-links">${nav.slice(0,4).join('')}<a href="/privacy.html">${label('隐私','Privacy (Chinese)')}</a></div></div></footer>`);
}

function publish({file, route, $}) {
  const target = routes.get(route) || route;
  const redirect = $('meta[http-equiv=refresh]').length > 0;
  renderChrome($, route);
  $('body').attr('data-static-page', '');
  if (!redirect) {
    for (const selector of ['[data-games]','[data-notes]','[data-updates]','[data-game-page]']) {
      $(selector).each((_, node) => assert.ok($(node).text().trim(), `Missing static content in ${route} (${selector})`));
    }
  }
  $('script[src="/assets/routes.js"],script[src="/assets/content.js"],script[src="/assets/content.en.js"]').remove();
  $('a[href],form[action],link[rel=canonical],link[hreflang],meta[property="og:url"]').each((_, node) => {
    const el = $(node);
    const attr = node.name === 'form' ? 'action' : node.name === 'meta' ? 'content' : 'href';
    el.attr(attr, rewrite(el.attr(attr), route));
  });
  $('script[type="application/ld+json"]').each((_, node) => {
    const el = $(node);
    const data = JSON.parse(el.text());
    const updated = JSON.stringify(data, (_, value) => typeof value === 'string' && value.startsWith(origin + '/') ? rewrite(value, route) : value);
    el.text(updated.replaceAll('<','\\u003c'));
  });
  if (redirect) {
    $('meta[http-equiv=refresh]').each((_, node) => {
      const meta = $(node);
      meta.attr('content', meta.attr('content').replace(/(url=)(.*)$/i, (_, key, url) => key + rewrite(url, route)));
    });
    return writeFile(file, $.html() + '\n');
  }
  if (route === '/') return writeFile(file, $.html() + '\n');
  if (!$('link[rel=canonical]').length) $('head').append('<link rel="canonical">');
  $('link[rel=canonical]').attr('href', origin + target);
  writeFile(path.join(root, target.slice(1)), $.html() + '\n');

  // Keep the old pages usable for existing bookmarks, with the new URL as canonical.
  const legacy = cheerio.load(fs.readFileSync(file, 'utf8'));
  renderChrome(legacy, route);
  if (!legacy('link[rel=canonical]').length) legacy('head').append('<link rel="canonical">');
  legacy('link[rel=canonical]').attr('href', origin + target);
  writeFile(file, legacy.html() + '\n');
}

for (const page of pages) publish(page);
const homepage = path.join(root, 'index.html');
publish({file: homepage, route: '/', $: cheerio.load(fs.readFileSync(homepage, 'utf8'))});

const sitemap = path.join(root, 'sitemap.xml');
const xml = cheerio.load(fs.readFileSync(sitemap, 'utf8'), {xmlMode: true});
const indexed = new Set();
xml('url').each((_, node) => {
  const loc = xml(node).children('loc');
  const url = rewrite(loc.text(), '/');
  if (indexed.has(url)) return xml(node).remove();
  indexed.add(url);
  loc.text(url);
  const pathname = new URL(url).pathname;
  assert.ok(pathname === '/' || pathname.endsWith('.html'), `Non-HTML sitemap URL: ${url}`);
  const page = cheerio.load(fs.readFileSync(path.join(root, pathname === '/' ? 'index.html' : pathname.slice(1)), 'utf8'));
  assert.equal(page('link[rel=canonical]').attr('href'), url);
  page('script,style,noscript,nav,.classic-sidebar,.site-breadcrumb,.classic-crumb').remove();
  assert.ok(page('main,article').text().trim(), `Missing readable sitemap content: ${url}`);
});
writeFile(sitemap, xml.xml());
const llms = path.join(root, 'llms.txt');
writeFile(llms, fs.readFileSync(llms, 'utf8').replace(/https:\/\/gamenote\.cc\/[^\s)]+/g, url => rewrite(url, '/')));
console.log(`Published explicit HTML URLs from ${pages.length} directory pages.`);
