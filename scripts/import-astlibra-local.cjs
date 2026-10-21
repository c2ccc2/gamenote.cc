const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const writeFile=require('./lib/write-file.cjs');
const root=path.resolve(__dirname,'..');
const arg=process.argv.indexOf('--source');
if(arg<0||!process.argv[arg+1])throw Error('Usage: node scripts/import-astlibra-local.cjs --source <local guide directory>');
const input=path.resolve(process.argv[arg+1]);
const output=path.join(root,'games/astlibra-revision/images/source');
fs.mkdirSync(output,{recursive:true});
const docs=[
 ['flow-upper','《神之天平》全流程图文攻略（上）.md',/^## 第一章 天平传说$/],
 ['flow-lower','《神之天平》全流程图文攻略（下）.md',/^## 第六章 乐园$/],
 ['equipment','《神之天平》装备、道具图鉴.md',/^## 一、武器图鉴$/],
 ['systems','《神之天平》系统介绍.md',/^## 一、天平系统$/],
 ['collect-upper','《神之天平》全地图收集攻略（上）.md',/^## 第一章$/],
 ['collect-lower','《神之天平》全地图收集攻略（下）.md',/^## 第六章$/]
];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function dimensions(b){
 if(b.toString('ascii',0,3)==='GIF')return {width:b.readUInt16LE(6),height:b.readUInt16LE(8)};
 if(b.readUInt32BE(0)===0x89504e47)return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
 if(b[0]===0xff&&b[1]===0xd8){let i=2;while(i+8<b.length){while(b[i]===0xff)i++;const marker=b[i++];if(marker===0xd9||marker===0xda)break;const length=b.readUInt16BE(i);if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3)};if(length<2)break;i+=length;}}
 if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){const kind=b.toString('ascii',12,16);if(kind==='VP8X')return {width:b.readUIntLE(24,3)+1,height:b.readUIntLE(27,3)+1};if(kind==='VP8 ')return {width:b.readUInt16LE(26)&0x3fff,height:b.readUInt16LE(28)&0x3fff};if(kind==='VP8L'){const bits=b.readUInt32LE(21);return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};}}
 throw Error('Unsupported source image');
}
const assets={},imported=new Map();
function image(relative){
 if(imported.has(relative))return imported.get(relative);
 const file=path.resolve(input,relative);
 if(!file.startsWith(input+path.sep)||!fs.existsSync(file))throw Error('Missing source image: '+relative);
 const bytes=fs.readFileSync(file),hash=digest(bytes),name=hash.slice(0,20)+path.extname(file).toLowerCase();
 const dest=path.join(output,name);
 if(fs.existsSync(dest)){if(digest(fs.readFileSync(dest))!==hash)throw Error('Image collision: '+name);}else fs.copyFileSync(file,dest);
 const src='/games/astlibra-revision/images/source/'+name;
 assets[src]={...dimensions(bytes),sha256:hash}; imported.set(relative,src);return src;
}
function plain(text){return text.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\*\*/g,'').replace(/[\u200b\ufeff]/g,'').trim();}
const documents=[];
for(const [id,name,start]of docs){
 const bytes=fs.readFileSync(path.join(input,name)),md=bytes.toString('utf8').replace(/\r\n/g,'\n');
 const source=md.match(/^> 来源: <(https:\/\/[^>]+)>/m)?.[1];if(!source)throw Error('Missing source URL: '+name);
 const lines=md.split('\n'),offset=lines.findIndex(line=>start.test(line));if(offset<0)throw Error('Missing content start: '+name);
 const blocks=[];
 for(let lineIndex=offset;lineIndex<lines.length;lineIndex++){
  const line=lines[lineIndex].trim();if(!line||/^---+$/.test(line))continue;
  const images=[...line.matchAll(/!\[[^\]]*\]\((images\/[^)]+)\)/g)];
  if(images.length){for(const match of images)blocks.push({kind:'image',src:image(match[1]),line:lineIndex+1});continue;}
  const heading=line.match(/^(#{2,4})\s+(.+)$/);
  const text=plain(heading?heading[2]:line);
  if(!text)continue;
  if(!heading&&/^(?:图\d+(?:[AB])?|宝箱\s*\d+[AB]?|火山地图|.*BOSS\d*)$/.test(text)&&blocks.at(-1)?.kind==='image'){blocks.at(-1).caption=text;continue;}
  blocks.push({kind:heading?'heading':'text',...(heading?{level:heading[1].length}:{}),text,line:lineIndex+1});
 }
 if(!blocks.some(b=>b.kind==='text')||!blocks.some(b=>b.kind==='image'))throw Error('Incomplete document: '+id);
 const hints={};let chapter='';
 if(id.startsWith('collect'))for(const line of lines.slice(0,offset)){
  const group=line.match(/➡(第[一二三四五六七八九十]+章|最终章|新章)宝箱/);if(group)chapter=group[1];
  const range=line.match(/^- 宝箱(\d+)~宝箱(\d+)-(.+)$/);if(range&&chapter)for(let n=Number(range[1]);n<=Number(range[2]);n++)hints[chapter+':'+n]=range[3].replace(/（共追加\d+个）/,'');
  const item=line.match(/^- 宝箱(\d+)(?:-|(?=[^\d~]))(.+)$/);if(item&&chapter)hints[chapter+':'+Number(item[1])]=item[2];
 }
 // The systems document has one real UI screenshot before its first section.
 const leadImages=id==='systems'?[{kind:'image',src:image('images/ef2f88c4dad8.jpg'),caption:'天平配置界面'}]:[];
 documents.push({id,file:name,source,author:'faili0802',sha256:digest(bytes),blocks,...(leadImages.length?{leadImages}:{}),...(Object.keys(hints).length?{hints}:{})});
}
const data={schemaVersion:1,author:'faili0802',documents,assets};
writeFile(path.join(root,'content/games/astlibra-revision/source-content.json'),JSON.stringify(data,null,2)+'\n');
writeFile(path.join(root,'content/games/astlibra-revision/source-index.json'),JSON.stringify(documents.map(d=>({id:d.id,file:d.file,url:d.source,sha256:d.sha256,blocks:d.blocks.length,images:d.blocks.filter(b=>b.kind==='image').length+(d.leadImages?.length||0)})),null,2)+'\n');
console.log(`Imported ${documents.length} documents, ${documents.reduce((n,d)=>n+d.blocks.length,0)} blocks and ${Object.keys(assets).length} local images.`);
