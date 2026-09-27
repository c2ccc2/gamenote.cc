const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),{loadClassicData,visible,confirmed,publicValue,approvedImage,canPublish,validateEntity}=require('./lib/classic-data.cjs'),data=loadClassicData(root);
assert.equal(data.areas.length,16);assert.equal(data.bosses.length,13);assert.equal(data.abilities.length,10);assert.equal(data.achievements.length,41);
const abilityReference=require('../content/games/an-jing-wei-guang/ability-reference.json');
const regionalMapNotes=require('../content/games/an-jing-wei-guang/regional-map-notes.json');
assert.equal(regionalMapNotes.length,9);
for(const locale of ['zh','en']){
 const world=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/images/maps/world-'+locale+'.svg'),'utf8'),{xmlMode:true});
 assert.equal(world('[data-region]').length,16);assert.equal(world('[data-route]').length,2,'Only reviewed route sequences are drawn');
 assert.ok(world('desc').text().includes(locale==='en'?'not verified physical corridors':'并非已确认的实际通道'));
 for(const area of data.areas){const crop=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/images/maps/regions/'+area.id+'-'+locale+'.svg'),'utf8'),{xmlMode:true});assert.equal(crop('[data-region="'+area.id+'"]').length,1)}
 const prefix=locale==='en'?'en/':'',page=cheerio.load(fs.readFileSync(path.join(root,prefix+'games/an-jing-wei-guang/maps/world/index.html'),'utf8'));
 assert.equal(page('[data-pagefind-body]').length,1);assert.ok(page('.classic-world-map img').attr('src').endsWith('-'+locale+'.svg'));
 if(locale==='en')assert.doesNotMatch(page('.classic-main > article').text(),/[\u3400-\u9fff]/);
 for(const notes of regionalMapNotes){const page=cheerio.load(fs.readFileSync(path.join(root,prefix+'games/an-jing-wei-guang/maps/'+notes.id+'/index.html'),'utf8'));assert.equal(page('.classic-main > article table tbody tr').length,notes.rows.length);if(locale==='en')assert.doesNotMatch(page('.classic-main > article').text().replaceAll('好吃的香草雪球',''),/[\u3400-\u9fff]|Translation in progress/)}
}
assert.equal(abilityReference.entries.filter(e=>e.group==='movement').length,7);
assert.equal(abilityReference.entries.filter(e=>e.group==='progression').length,5);
for(const prefix of ['', 'en/']){
 const page=cheerio.load(fs.readFileSync(path.join(root,prefix+'games/an-jing-wei-guang/abilities/index.html'),'utf8'));
 assert.equal(page('.classic-main > article table').length,2);
 assert.equal(page('.classic-main > article table').eq(0).find('tbody tr').length,7);
 assert.equal(page('.classic-main > article table').eq(1).find('tbody tr').length,5);
 assert.equal(page('.classic-main > article a[href="/'+prefix+'games/an-jing-wei-guang/collectibles/key-items/golden-gate-key/"]').length,1);
 if(prefix)assert.doesNotMatch(page('.classic-main > article').text(),/[\u3400-\u9fff]|Translation in progress/);
}
for(const item of abilityReference.entries){const record=[...data.abilities,...data.keyItems].find(e=>e.id===item.id);assert.ok(confirmed(record.fields.referenceEffect));if(!item.locationSources.length)assert.equal(record.fields.referenceAcquisition,undefined)}
for(const achievement of data.achievements){assert.ok(confirmed(achievement.fields.nameZh));assert.match(achievement.description,/[\u4e00-\u9fff]/);assert.ok(achievement.fields.description.screenshotEvidence)}
const englishAchievements=data.achievements.filter(e=>e.nameEn&&e.descriptionEn);
assert.equal(englishAchievements.length,41,'All official English achievement texts must be preserved');
for(const e of englishAchievements){assert.ok(confirmed(e.fields.descriptionEn));assert.ok(e.fields.nameEn.screenshotEvidence);assert.equal(e.fields.descriptionEn.value,e.descriptionEn)}
for(const e of englishAchievements){const en=cheerio.load(fs.readFileSync(path.join(root,'en/games/an-jing-wei-guang/achievements',e.slug,'index.html'),'utf8'));assert.equal(en('html').attr('lang'),'en');assert.equal(en('h1').text(),e.nameEn);assert.ok(en('.classic-main > article').text().includes(e.descriptionEn));assert.equal(en('link[hreflang="zh-CN"]').length,1);assert.equal(en('link[hreflang="en"]').length,1)}
assert.equal(visible({directoryVisible:false,publish:false,fields:{}}),false);
const source={name:'Fixture video',url:null,type:'video',accessedAt:'2026-09-27'},stamp={platform:'bilibili',url:null,videoId:null,timestampStart:'00:01:00',timestampEnd:'00:01:02',verifiedItems:['fixture']};
const fact={value:'Confirmed fixture',confidence:'C',verificationStatus:'video-confirmed',publish:true,sources:[source],videoSources:[stamp],notes:[],updatedAt:'2026-09-27'};
assert.equal(confirmed(fact),true,'Single clear video observation can publish');
assert.equal(confirmed({...fact,publish:false}),false);assert.equal(confirmed({...fact,confidence:'D'}),false);assert.equal(confirmed({...fact,value:null}),false);
assert.equal(publicValue({fields:{secret:{...fact,value:'HIDDEN',publish:false}}},'secret'),null);
assert.equal(approvedImage({publish:true,type:'video-frame',verificationStatus:'video-confirmed',source:'Fixture'}),false);
assert.equal(approvedImage({publish:true,type:'video-frame',verificationStatus:'video-confirmed',source:'Fixture',publicationApproved:true}),true);
const partial=structuredClone(data.bosses[0]);partial.confidence='C';partial.verificationStatus='unverified';partial.fields={observation:fact};partial.images=[];partial.publish=true;partial.contentStatus='partial';validateEntity(partial,'partial');
assert.equal(canPublish(partial),true,'Page-level name confidence does not veto independently verified facts');
const invalid=structuredClone(partial);invalid.fields.observation.verificationStatus='unverified';assert.throws(()=>validateEntity(invalid,'invalid'));
const nostamp=structuredClone(partial);nostamp.fields.observation.videoSources=[];assert.throws(()=>validateEntity(nostamp,'nostamp'));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),urls=[...sitemap.matchAll(/<loc>https:\/\/gamenote\.cc(\/games\/an-jing-wei-guang\/[^<]*)<\/loc>/g)].map(m=>m[1]);
assert.ok(urls.length>=45);let links=0;
for(const url of urls){
 const html=fs.readFileSync(path.join(root,url,'index.html'),'utf8'),$=cheerio.load(html);
 assert.equal($('h1').length,1);assert.equal($('link[rel=canonical]').length,1);
 assert.equal($('#related-notes').length,0,'Related notes section removed');
 assert.equal($('a[href*="#related-notes"]').length,0,'Related notes directory link removed');
 assert.doesNotMatch($('body').text(),/相关手记/);
 assert.doesNotMatch(html,/_research\/|confidence|verificationStatus|publishStatus|Boss 0[1-4]/);
 assert.equal($('.classic-banner').length,url==='/games/an-jing-wei-guang/'?1:0);
 assert.doesNotMatch($('.classic-main > article').text(),/待补充/);
 $('a[href^="/"]').each((_,node)=>{const u=new URL($(node).attr('href'),'https://gamenote.cc'),target=path.join(root,u.pathname),file=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;assert.ok(fs.existsSync(file),'Broken '+u.pathname);links++});
}
const bossHtml=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/bosses/the-groundskeeper/index.html'),'utf8'));
const chapter=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/walkthrough/chapter-01/index.html'),'utf8'));
const flowIndex=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/walkthrough/index.html'),'utf8'));
const systems=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/systems/index.html'),'utf8'));
assert.doesNotMatch(systems('.classic-main > article').text(),/基本操作|具体键位以自己的游戏设置为准|P1 已核对教学/);
assert.equal(systems('a[href="/games/an-jing-wei-guang/systems/#controls"]').length,0);
assert.ok(systems('.classic-main > article').text().includes('系统目录'));
assert.equal(systems('.classic-main > article table').length,1,'Systems must not reuse the ability table');
for(const section of require('../content/games/an-jing-wei-guang/systems-reference.json'))assert.equal(systems('#'+section.id).length,1);
const enSystems=cheerio.load(fs.readFileSync(path.join(root,'en/games/an-jing-wei-guang/systems/index.html'),'utf8'));
assert.doesNotMatch(enSystems('.classic-main > article').text(),/[\u3400-\u9fff]|Translation in progress/);
for(const prefix of ['', 'en/']){
 const update=cheerio.load(fs.readFileSync(path.join(root,prefix+'updates/well-dweller-guide-reading-update/index.html'),'utf8'));
 assert.equal(update('.article section h2').length,4);
 update('.article section a').each((_,node)=>{assert.equal(update(node).attr('target'),'_blank');assert.ok(update(node).attr('href').startsWith('/'+prefix+'games/an-jing-wei-guang/'))});
 if(prefix)assert.doesNotMatch(update('.article').text(),/[\u3400-\u9fff]/);
}
assert.doesNotMatch(flowIndex('.classic-main > article').text(),/P1 图文流程|P1 早期推进关系|The Well：起点与末段下行|夜之庭园：探索、园丁与后续小屋段落/);
assert.equal(chapter('.classic-main > article img').length,0,'Legacy P1 is only a reading entry');
assert.equal(chapter('[data-pagefind-body]').length,0,'Do not index duplicate P1 entry');
const well=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/walkthrough/the-well/index.html'),'utf8'));
const garden=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/walkthrough/night-garden/index.html'),'utf8'));
assert.equal(well('.classic-main > article img').length,1);
assert.equal(garden('.classic-main > article img').length,5);
assert.ok(garden('.classic-main > article').text().length>600,'Readable route details remain after removing research commentary');
for(const prefix of ['', 'en/'])for(const dir of ['walkthrough','bosses','maps','achievements']){
 const scan=folder=>{for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())scan(file);else if(entry.name==='index.html'){const $=cheerio.load(fs.readFileSync(file,'utf8'));assert.doesNotMatch($('.classic-main > article').text(),/\d{1,2}[:：]\d{2}|已按用户提供|详细解锁路线继续整理/,'Public guide must not read like a video timeline: '+file)}}};
 scan(path.join(root,prefix+'games/an-jing-wei-guang',dir));
}
for(const text of ['拾荒者','猎人的吊坠','园丁','局部地图'])assert.ok(garden('.classic-main > article').text().includes(text),'Lost P1 content: '+text);
assert.ok(well('.classic-main > article').text().includes('继续下行'));
for(const section of ['walkthrough','maps']){
 const html=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang',section,'night-garden/index.html'),'utf8'));
 assert.equal(html('.classic-main > article > :last-child').attr('class'),'classic-area-nav','Region connections belong after the article');
 assert.equal(html('.classic-main > article > h2').filter((_,n)=>['前一区域','后续区域'].includes(html(n).text())).length,0,'No scattered region headings');
 assert.equal(html('.classic-area-nav-group').length,2);
 html('.classic-area-nav a').each((_,n)=>assert.ok(html(n).attr('href').startsWith('/games/an-jing-wei-guang/'+section+'/'),'Keep map/flow navigation context'));
}
let regionalImages=0;
for(const id of ['the-bog','the-drains','graven-valley','desiccated-castle','the-docks','the-deep']){
 const area=data.areas.find(a=>a.id===id);assert.ok(confirmed(area.fields.mapGuide),'Missing regional video guide: '+id);
 const map=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/maps',area.slug,'index.html'),'utf8'));
 const flow=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang/walkthrough',area.slug,'index.html'),'utf8'));
 const images=area.fields.mapGuide.value.filter(b=>b.type==='image');regionalImages+=images.length;
 for(const block of images){assert.ok(confirmed({...block,value:block.src}));assert.ok(flow('.classic-main > article img').toArray().some(n=>flow(n).attr('src')===block.src),'All reviewed route images retained in walkthrough');const original=area.images.find(i=>i.src===block.src);if(!/地图|区域图/.test(original.caption)&&!regionalMapNotes.some(n=>n.id===area.id&&n.image===block.src))assert.ok(!map('.classic-main > article img').toArray().some(n=>map(n).attr('src')===block.src),'Non-map route images must not remain in maps');assert.ok(fs.existsSync(path.join(root,block.src)))}
 assert.equal(map('.classic-main > article .classic-image-block:not(.center)').length,0,'Map does not duplicate step-by-step layout');
 const enFlow=cheerio.load(fs.readFileSync(path.join(root,'en/games/an-jing-wei-guang/walkthrough',area.slug,'index.html'),'utf8'));
 assert.equal(enFlow('html').attr('lang'),'en');assert.equal(enFlow('.classic-main > article img').length,images.length);
 assert.doesNotMatch(enFlow('.classic-main > article').text().replaceAll('好吃的香草雪球',''),/[\u3400-\u9fff]/,'English route prose must not contain Chinese paragraphs');
 assert.doesNotMatch(enFlow('.classic-main > article').text(),/Translation in progress/,'Reviewed route translations must be complete');
 assert.equal(flow('.classic-language-switch a[hreflang="en"]').attr('href'),'/en/games/an-jing-wei-guang/walkthrough/'+area.slug+'/');
 assert.ok(flow('.classic-main > article a').toArray().some(n=>flow(n).attr('href')==='/games/an-jing-wei-guang/maps/'+area.slug+'/'));
}
assert.equal(regionalImages,63,'Preserve all 63 reviewed P2–P7 regional screenshots');
const invalidMap=structuredClone(data.areas.find(a=>a.id==='the-bog'));invalidMap.fields.mapGuide.value[0].verificationStatus='unverified';assert.throws(()=>validateEntity(invalidMap,'invalid-map'),'Map blocks require independent evidence');
for(let part=2;part<=7;part++)assert.ok(!fs.existsSync(path.join(root,'games/an-jing-wei-guang/maps','p'+part)),'Do not create episode pages');
assert.equal(garden('.classic-main > article .classic-heading').filter((_,node)=>/^[一二三四五六]、/.test(garden(node).text())).length,6);
assert.match(bossHtml('.classic-main > article').text(),/粉色花瓣形弹幕/);assert.equal(bossHtml('.classic-main > article img').length,2);assert.doesNotMatch(bossHtml('.classic-main > article').text(),/推荐打法|独立掉落|奖励/);
for(const category of ['abilities','collectibles']){const $=cheerio.load(fs.readFileSync(path.join(root,'games/an-jing-wei-guang',category,'index.html'),'utf8'));const url='/games/an-jing-wei-guang/'+category+'/'+(category==='abilities'?'slingshot':'trinkets')+'/';assert.equal($('.classic-main > article a').toArray().filter(node=>$(node).attr('href')===url).length,1,'No duplicate catalog links')}
for(const [file,expected] of Object.entries({'assets/classic.css':'9E86AC282A48BBC86C35D1C9A074B655E255E0E770FA3A4ADE68F54C89A0458D','styles.css':'8B55FE0BACBA2DC7B2D418C79A2F89A39B7E2C9D2A6EB0CB5B209891C11D8509'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex').toUpperCase(),expected);
assert.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/_research/);assert.ok(!fs.existsSync(path.join(root,'.nojekyll')));
console.log('Verified '+urls.length+' indexable Classic pages, '+links+' links, field-level publication, video evidence, screenshots, conditional sections and unchanged styles.');
