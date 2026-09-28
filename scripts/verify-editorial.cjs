const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),origin='https://gamenote.cc',base='games/an-jing-wei-guang/',today='2026-09-27';
const read=p=>cheerio.load(fs.readFileSync(path.join(root,p,'index.html'),'utf8'));
const sitemap=cheerio.load(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),{xmlMode:true}),urls=sitemap('loc').toArray().map(n=>sitemap(n).text());
assert.equal(urls.length,new Set(urls).size,'Sitemap must contain no duplicate URLs');
assert.equal(urls.filter(u=>u===origin+'/en/updates/').length,1);
for(const url of urls){const $=read(url.slice(origin.length));assert.doesNotMatch($('meta[name=robots]').attr('content')||'',/noindex/i);assert.equal($('link[rel=canonical]').attr('href'),url)}
const summaries=require('../content/games/an-jing-wei-guang/region-summaries.json');
for(const crop of require('../content/games/an-jing-wei-guang/map-crops.json'))for(const en of [false,true]){
 const $=read((en?'en/':'')+base+'maps/'+crop.id+'/'),svgPath='/'+base+'images/maps/crops/'+crop.id+'-'+(en?'en':'zh')+'.svg';
 assert.equal($('.classic-regional-crop').length,1);assert.equal($('.classic-regional-crop img').attr('src'),svgPath);
 assert.equal($('.classic-regional-crop a').first().attr('target'),'_blank');assert.ok($('.classic-regional-crop a[href="'+crop.source+'"]').length);
 const svg=fs.readFileSync(path.join(root,svgPath),'utf8');assert.ok(svg.includes('data-source-bounds="'+crop.bounds.join(' ')+'"'));assert.ok(svg.includes('data:image/webp;base64,'));assert.ok(svg.includes('好吃的香草雪球'));
 assert.equal((svg.match(/<svg\b/g)||[]).length,1,'Crop SVGs must not use nested SVG roots: live-server corrupts their responses');
 assert.equal((svg.match(/<\/svg>/g)||[]).length,1);assert.ok(svg.includes('clip-path="url(#map-crop)"'));
 assert.doesNotMatch($('.classic-regional-crop').text(),/Translation in progress/);
}
for(const prefix of ['', 'en/']){
 const en=!!prefix,queen=read(prefix+base+'bosses/the-queen/');
 const well=read(prefix+base+'walkthrough/the-well/'),garden=read(prefix+base+'walkthrough/night-garden/');
 assert.equal(garden('#garden-spirits').length,1);
 assert.equal(garden('.classic-spirit-route li').length,2);
 assert.ok(well('a[href="/'+prefix+base+'walkthrough/night-garden/#garden-spirits"]').length);
 for(const page of [well,garden]){
  const copy=page('.classic-main > article').text();
  assert.doesNotMatch(copy,en?/return (?:them|the spirit) to (?:the|a) nest/i:/找到之后还要归还|回到巢穴归还|仅找到鸟灵还不等于已经归还/);
 }
 assert.match(queen('meta[name=robots]').attr('content'),/noindex/);assert.ok(!urls.includes(origin+'/'+prefix+base+'bosses/the-queen/'));
 assert.ok(queen('.classic-main > article').text().length>150);assert.equal(queen('.article-references').length,1);
 assert.ok(queen('a[href="/'+prefix+base+'achievements/endgame/"]').length);
 for(const [id,summary] of Object.entries(summaries)){
  const $=read(prefix+base+'walkthrough/'+id+'/');
  assert.equal($('.classic-region-summary').length,1);assert.ok($('.classic-region-summary dt').length>=3);
  if(id==='the-bog'){
   const links=$('.classic-route-outline a').toArray();assert.equal(links.length,4);
   for(const node of links){const target=$(node).attr('href');assert.ok(target.startsWith('#'));assert.equal($('.classic-main > article > h2'+target).length,1,'Bog route anchor must resolve: '+target)}
  }
  assert.equal($('.classic-nav-home .classic-collapse-all').length,1);
  assert.equal($('.classic-collapse-all').text(),en?'Collapse all':'全部收起');
  assert.equal($('.classic-collapse-all').attr('aria-controls').split(' ').length,$('.classic-group-toggle').length);
  assert.equal($('.classic-main > article > h2').filter((_,n)=>['NPC','Boss','Boss / encounter'].includes($(n).text().trim())).length,0);
  assert.equal($('.classic-image-block:not(.center)').length,0);
  if(id==='hunters-cabin'||id==='the-bog')assert.ok($('.classic-region-summary').text().includes('NPC'));
  if(summary.bosses?.length)assert.ok($('.classic-region-summary dd a[href*="/bosses/"]').length);
  assert.equal($('meta[name=description]').attr('content'),summary[en?'en':'zh']);
  assert.equal($('.article-references').length,1);
  const schema=JSON.parse($('script[data-article-schema]').text());assert.equal(schema['@type'],'Article');assert.equal(schema.dateModified,today);assert.equal(schema.author.name,'GAME NOTE');assert.equal(schema.inLanguage,en?'en':'zh-CN');
  assert.equal($('.classic-main > header time[datetime="'+today+'"]').length,1);
  assert.equal($('.classic-main > header > p').length,1,'Classic headers must have one byline only');
  assert.equal($('.classic-main > header > h1').next().find('time').length,1);
  assert.doesNotMatch($('.classic-main > header > p').text(),/资料持续整理中|GAME NOTE CLASSIC|Guide in progress/);
  assert.doesNotMatch($('.classic-image-block p').text(),/本轮|核验记录|录像|未.*确认|the recording|the commentary|not been confirmed/i);
  $('.article-references a').each((_,n)=>{assert.equal($(n).attr('target'),'_blank');assert.ok($(n).attr('href').startsWith('https://'))});
 }
 const about=read(prefix+'about/');assert.equal(about('main > section[data-editorial]').length,1);assert.ok(about('main').text().includes(en?'guide editors':'攻略整理者'));assert.ok(about('a[href="/contact.html"]').length);
 for(const slug of ['why-organize-game-guides-again','why-an-jing-wei-guang-looks-like-an-old-guide-site']){const $=read(prefix+'notes/'+slug+'/');assert.equal($('script[data-article-schema]').length,1);const schema=JSON.parse($('script[data-article-schema]').text());assert.equal(schema['@type'],'BlogPosting');assert.equal(schema.dateModified,today);assert.equal($('.article-references').length,1)}
}
const copy=require('../content/games/an-jing-wei-guang/public-video-copy.json');let count=0;
for(let part=2;part<=7;part++){
 const chapters=require('../_research/an-jing-wei-guang/p'+part+'-map-notes.json');let i=0;
 for(const chapter of chapters)for(const item of chapter.items){
  const src='/'+base+'images/p'+part+'/frame-'+String(item.sec).padStart(4,'0')+'.webp';
  for(const prefix of ['', 'en/']){const $=read(prefix+base+'walkthrough/'+chapter.area+'/'),paragraph=$('img[src="'+src+'"]').closest('.classic-image-block').children('p');assert.equal(paragraph.length,1);assert.equal(paragraph.text(),copy[part][i][prefix?1:0]);assert.ok(paragraph.text().length>20)}
  i++;count++;
 }
}
assert.equal(count,63);
const llms=fs.readFileSync(path.join(root,'llms.txt'),'utf8');assert.ok(llms.startsWith('# GAME NOTE\n\n> '));const links=[...llms.matchAll(/\]\((https:\/\/[^)]+)\):/g)].map(m=>m[1]);assert.ok(links.length>=10&&links.length<=30);
for(const url of links)if(url.startsWith(origin+'/')){const target=path.join(root,url.slice(origin.length));assert.ok(fs.existsSync(path.extname(target)?target:path.join(target,'index.html')),'Broken llms entry: '+url)}
console.log(`Verified ${urls.length} unique sitemap entries, bilingual article metadata, 9 regional summaries, 63 retained illustrated passages and ${links.length} llms.txt links.`);
