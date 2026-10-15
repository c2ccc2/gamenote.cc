const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const writeFile=require('./lib/write-file.cjs');
const root=path.resolve(__dirname,'..');
const arg=process.argv.indexOf('--source');
if(arg<0||!process.argv[arg+1])throw Error('Usage: node scripts/import-khazan-local.cjs --source <local guide directory>');
const input=path.resolve(process.argv[arg+1]);
if(!fs.statSync(input).isDirectory())throw Error('Source must be a directory');
const output=path.join(root,'games/the-first-berserker-khazan/images/source');
if(!output.startsWith(root+path.sep))throw Error('Unsafe image output');
fs.mkdirSync(output,{recursive:true});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const imageFiles=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?imageFiles(path.join(dir,e.name)):/\.(?:jpe?g|png|gif|webp)$/i.test(e.name)?[path.join(dir,e.name)]:[]):[];
const known=new Map();
for(const file of [...imageFiles(path.join(root,'kazan/images')),...imageFiles(path.join(root,'games/the-first-berserker-khazan/images'))]){
 const key=hash(file);if(!known.has(key))known.set(key,'/'+path.relative(root,file).replaceAll('\\','/'));
}
const imported=new Map(),assets={};let copied=0,reused=0;
function dimensions(file){
 const b=fs.readFileSync(file);
 if(b.toString('ascii',0,3)==='GIF')return {width:b.readUInt16LE(6),height:b.readUInt16LE(8)};
 if(b.readUInt32BE(0)===0x89504e47)return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
 if(b[0]===0xff&&b[1]===0xd8){
  let i=2;
  while(i+8<b.length){
   while(b[i]===0xff)i++;
   const marker=b[i++];if(marker===0xd9||marker===0xda)break;
   const length=b.readUInt16BE(i);
   if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3)};
   if(length<2)break;i+=length;
  }
 }
 if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){
  const kind=b.toString('ascii',12,16);
  if(kind==='VP8X')return {width:b.readUIntLE(24,3)+1,height:b.readUIntLE(27,3)+1};
  if(kind==='VP8 ')return {width:b.readUInt16LE(26)&0x3fff,height:b.readUInt16LE(28)&0x3fff};
  if(kind==='VP8L'){const bits=b.readUInt32LE(21);return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};}
 }
 throw Error('Cannot read image dimensions: '+file);
}
function localImage(relative){
 if(imported.has(relative))return imported.get(relative);
 const file=path.resolve(input,relative);
 if(!file.startsWith(input+path.sep)||!fs.existsSync(file))throw Error('Missing or invalid source image: '+relative);
 const key=hash(file);let url=known.get(key);
 if(url)reused++;
 else{
  const destination=path.join(output,key.slice(0,20)+path.extname(file).toLowerCase());
  if(fs.existsSync(destination)&&hash(destination)!==key)throw Error('Image hash collision');
  if(!fs.existsSync(destination))fs.copyFileSync(file,destination);
  url='/'+path.relative(root,destination).replaceAll('\\','/');known.set(key,url);copied++;
 }
 assets[url]=dimensions(file);imported.set(relative,url);return url;
}
const plain=text=>text.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\*\*/g,'').trim();
function readerText(text,page){
 if(page===3&&text.includes('笔者选择'))return '拿到宝箱后跳到下方存档点，可在这里升级属性。按武器需求与精力使用习惯选择加点。';
 if(page===7&&text.includes('笔者在这里'))return '向右走会遇到两只猴子，中间的冰面踩踏后会塌陷，经过时注意落脚点。';
 if(page===11&&text.includes('笔者个人'))return '清理墓地里出现的亡魂即可完成巨剑试炼，战后获得古代巨剑；也可以换回自己习惯的武器。';
 if([26,38,219].includes(page)&&text.includes('笔者'))return '';
 if(page===70&&text.includes('不截图'))return '朗格斯不会转阶段，部分攻击可用重击打断；仍需留意连续挥锤。';
 if(page===134&&text.includes('笔者懒得'))return '前方人群中夹杂会主动攻击的混沌侵蚀者，经过时留意敌人。';
 if(page===170&&text.includes('笔者一次'))return '贝雷里安是死灵法师，会用护盾保护自己，部分法术可在施放时打断。';
 if(page===253&&text.includes('笔者'))return '前方地板会塌陷，下层有精英敌人，落下前先准备战斗。';
 if(page===279&&text.includes('三个选项'))return '与达芙罗娜对话会出现结局选项，左右两项对应不同分支，下方选项通往真结局路线；右侧分支会增加一场战斗。';
 if(page===279&&text.includes('15个日记本'))return '真结局路线需要集齐 15 份日记；其中《黑月升起之日（三）》在支线“超越者之剑”。满足条件后，在达芙罗娜对话中选择下方选项。';
 if(page===284&&text.includes('奥兹玛一共'))return '奥兹玛有两个主要阶段；如果此前选择右侧结局分支，还会追加第三阶段。';
 if(page===284&&text.includes('存档已经炸'))return '此前对话选择右侧结局分支时，还需要完成第三次决斗。';
 return text;
}
const pages=[];
for(let page=1;page<=285;page++){
 const file=path.join(input,'pages','page_'+String(page).padStart(3,'0')+'.md');
 const md=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 const header=md.match(/^## 第 \d+\/285 页 · (.+)$/m),source=md.match(/^> 来源: <(https:\/\/[^>]+)>/m);
 if(!header||!source||/【未能提取正文】/.test(md))throw Error('Incomplete local source page '+page);
 let chunks=md.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
 if(page===1){const start=chunks.findIndex(s=>/^\*\*第一章[：:]/.test(s));if(start<0)throw Error('Missing chapter opening');chunks=chunks.slice(start+1);}
 const blocks=[];
 for(const chunk of chunks){
  if(/^## 第|^> 来源:|本文由3DM/.test(chunk)||/^\*\*本文由3DM/.test(chunk))continue;
  const matches=[...chunk.matchAll(/!\[[^\]]*\]\((images\/[^)]+)\)/g)];
  if(matches.length){for(const image of matches)blocks.push({kind:'image',src:localImage(image[1])});continue;}
  const text=readerText(plain(chunk),page);
  if(!text||/^第[一二三四五六七八九十]+章[：:]/.test(text))continue;
  blocks.push({kind:/^\*\*[^*]+\*\*$/.test(chunk)?'heading':'text',text});
 }
 if(!blocks.some(b=>b.kind==='text')||!blocks.some(b=>b.kind==='image'))throw Error('Empty local body or images on page '+page);
 if(page===71&&!blocks.some(b=>b.text?.includes('食人蛛卷轴')))blocks.push({kind:'text',text:'继续往下走，右侧支路可取得食人蛛卷轴。'});
 pages.push({page,title:page===71?'第七章：刃指账幕（鬼石1、食人蛛卷轴）':header[1],source:source[1],blocks});
}
const imagePlacements=pages.reduce((n,p)=>n+p.blocks.filter(b=>b.kind==='image').length,0);
const data={schemaVersion:1,source:'3DM 攻略组 / 用户提供的本地归档',pages,imagePlacements,assets};
writeFile(path.join(root,'content/games/the-first-berserker-khazan/source-content.json'),JSON.stringify(data,null,2)+'\n');
writeFile(path.join(root,'content/games/the-first-berserker-khazan/source-index.json'),JSON.stringify(pages.map(p=>({page:p.page,title:p.title,url:p.source,images:p.blocks.filter(b=>b.kind==='image').map(b=>b.src)})),null,2)+'\n');
console.log(`Imported ${pages.length} full local pages and ${imagePlacements} image placements: ${reused} reused, ${copied} copied.`);
