const fs = require('node:fs');
const writeFile = require('./lib/write-file.cjs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const games = require('../content/catalog/games.json');
const origin = 'https://gamenote.cc';
const container = 'GTM-W5W5PT67';
const bootstrap = "(function(w,d,s,l,i){if(d.querySelector('script[src*=\"googletagmanager.com/gtm.js?id='+i+'\"]'))return;w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W5W5PT67');";
for (const slug of ['', ...games.map(game => game.slug)]) {
  const suffix = slug ? slug + '/' : '';
  const zh = '/catalog/' + suffix, en = '/en/catalog/' + suffix;
  const alternate = `<link rel="alternate" hreflang="zh-CN" href="${origin+zh}"><link rel="alternate" hreflang="en" href="${origin+en}"><link rel="alternate" hreflang="x-default" href="${origin+zh}">`;
  for (const route of [zh, en]) {
    const file = path.join(root, route.slice(1), 'index.html');
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<link rel="alternate" hreflang="(?:zh-CN|en|x-default)"[^>]*>/g, '');
    html = html.replace('</head>', alternate + `<script data-gamenote-gtm="${container}">${bootstrap}</script></head>`);
    html = html.replace('<body>', `<body><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${container}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`);
    writeFile(file, html);
  }
}
const sitemap = path.join(root, 'sitemap.xml');
if (fs.existsSync(sitemap)) {
  let xml = fs.readFileSync(sitemap, 'utf8');
  for (const prefix of ['/catalog/', '/en/catalog/']) for (const slug of ['', ...games.map(game => game.slug)]) {
    const loc = origin + prefix + (slug ? slug + '/' : '');
    if (!xml.includes('<loc>' + loc + '</loc>')) xml = xml.replace('</urlset>', '  <url><loc>' + loc + '</loc></url>\n</urlset>');
  }
  writeFile(sitemap, xml);
}
console.log(`Added reciprocal catalog languages and GTM to ${(games.length + 1) * 2} pages.`);
