// Append reviewed video observations; never replace an existing guide or fact.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),file=path.join(root,'content/games/an-jing-wei-guang/areas.json');
const notes=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),areas=JSON.parse(fs.readFileSync(file,'utf8'));
const before=structuredClone(areas);
const stamp=n=>new Date(n*1000).toISOString().slice(11,19);
for(const chapter of notes){
 const area=areas.find(a=>a.id===chapter.area);if(!area)throw Error('Unknown area');
 const source={name:`好吃的香草雪球 · 用户提供的 ${chapter.file}`,url:'https://space.bilibili.com/3804625/',type:'video',accessedAt:'2026-09-27'};
 const evidence=sec=>({publish:true,confidence:'C',verificationStatus:'video-confirmed',sources:[source],updatedAt:'2026-09-27',videoSources:[{platform:'bilibili',url:null,videoId:null,localFile:chapter.file,timestampStart:stamp(sec),timestampEnd:stamp(sec),verifiedItems:[area.id+'.mapGuide']} ]});
 const blocks=[];
 for(const item of chapter.items){
  blocks.push({type:'heading',text:item.title,...evidence(item.sec)});
  const src=`/games/an-jing-wei-guang/images/p${chapter.part}/frame-${String(item.sec).padStart(4,'0')}.webp`;
  blocks.push({type:'image',src,text:item.text,align:blocks.length%4===1?'left':'right',...evidence(item.sec)});
  if(!area.images.some(i=>i.src===src))area.images.push({src,type:'video-frame',platform:'bilibili',videoId:null,timestamp:stamp(item.sec),caption:item.title,source:source.name,verificationStatus:'video-confirmed',confidence:'C',verified:true,publish:true,publicationApproved:true,width:852,height:480,rightsBasis:'用户确认原视频及内容免授权转载；保留原画面作者水印及署名。'});
 }
 const marker=`★ ${chapter.label}：区域图文记录`;
 const old=area.fields.mapGuide?.value||[];
 if(old.some(b=>b.text===marker)){console.log('Already appended: '+marker);continue}
 const value=[...old,{type:'heading',text:marker,...evidence(chapter.items[0].sec)},...blocks];
 area.fields.mapGuide={value,...evidence(chapter.items[0].sec)};
 area.publish=true;area.contentStatus=area.contentStatus==='empty'?'partial':area.contentStatus;
 if(!area.sources.some(s=>s.name===source.name))area.sources.push(source);
 area.videoSources.push(...chapter.items.flatMap(i=>evidence(i.sec).videoSources));
 area.updatedAt='2026-09-27';
}
// Emit a patch; the caller applies it through apply_patch.
const lines=r=>JSON.stringify(r,null,2).split('\n').map(l=>'  '+l);
let patch='*** Begin Patch\n*** Update File: '+file.replace(/\\/g,'/')+'\n';
for(const c of notes){const index=areas.findIndex(a=>a.id===c.area);const old=lines(before[index]),next=lines(areas[index]);if(index<areas.length-1){old[old.length-1]+=',';next[next.length-1]+=','}patch+='@@\n'+old.map(l=>'-'+l).join('\n')+'\n'+next.map(l=>'+'+l).join('\n')+'\n'}
process.stdout.write(patch+'*** End Patch');
