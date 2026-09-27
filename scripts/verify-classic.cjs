const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const {loadClassicData,visible,publicValue,approvedImage,validateEntity}=require('./lib/classic-data.cjs');
const data=loadClassicData(root);
assert.equal(data.areas.length,16);assert.equal(data.bosses.length,13);assert.equal(data.abilities.length,10);assert.equal(data.achievements.length,22);
assert.equal(visible({publishStatus:'research'}),false);
assert.equal(publicValue({fields:{secret:{value:'HIDDEN',publishStatus:'research',confidence:'A',verificationStatus:'source-confirmed'}}},'secret'),null);
assert.equal(approvedImage({verified:true,publishStatus:'draft',type:'official'}),false);
assert.equal(approvedImage({verified:true,publishStatus:'published',type:'video-frame'}),false);
const bad=structuredClone(data.game);bad.verificationStatus='unverified';assert.throws(()=>validateEntity(bad,'fixture'));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>https:\/\/gamenote\.cc(\/games\/an-jing-wei-guang\/[^<]*)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,109);let links=0;
for(const url of urls){
 const html=fs.readFileSync(path.join(root,url,'index.html'),'utf8');
 assert.match(html,/<h1\b/);assert.match(html,/rel="canonical"/);
 assert.doesNotMatch(html,/images\/p1\/|confidence|verificationStatus|publishStatus|Boss 0[1-4]/);
 for(const match of html.matchAll(/href="(\/[^"?#]*)(?:\?[^"#]*)?(?:#([^"]*))?"/g)){
  const target=path.join(root,match[1]);
  const resolved=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
  assert.ok(fs.existsSync(resolved),'Broken link '+url+' -> '+match[1]);links++;
  if(match[2]&&/\.html$/.test(resolved))assert.ok(fs.readFileSync(resolved,'utf8').includes('id="'+match[2]+'"'),'Missing anchor '+match[0]);
 }
}
for(const [file,expected] of Object.entries({'assets/classic.css':'9E86AC282A48BBC86C35D1C9A074B655E255E0E770FA3A4ADE68F54C89A0458D','styles.css':'8B55FE0BACBA2DC7B2D418C79A2F89A39B7E2C9D2A6EB0CB5B209891C11D8509'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').toUpperCase(),expected,'Visual styles changed');
assert.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/_research/);assert.ok(!fs.existsSync(path.join(root,'.nojekyll')));
console.log(`Verified ${urls.length} public pages, ${links} local links, publication guards, and unchanged styles.`);
