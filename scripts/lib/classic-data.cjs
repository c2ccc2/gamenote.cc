const fs=require('node:fs'),path=require('node:path');
const verificationStatuses=['unverified','source-confirmed','video-confirmed','ingame-confirmed','official-confirmed'];
const contentStatuses=['empty','partial','guide-ready','complete'],sourceTypes=['official','steam-community','wiki','guide','video','ingame'];
const meaningful=v=>v!==null&&v!==undefined&&(typeof v==='string'?v.trim().length>0:Array.isArray(v)?v.length>0:true);
function reliable(e){
 if(!e||e.confidence==='D'||!e.sources?.length)return false;
 if(e.verificationStatus==='official-confirmed')return e.sources.some(s=>s.type==='official');
 if(e.verificationStatus==='video-confirmed')return e.sources.some(s=>s.type==='video');
 if(e.verificationStatus==='ingame-confirmed')return e.sources.some(s=>s.type==='ingame');
 return e.verificationStatus==='source-confirmed'&&['A','B'].includes(e.confidence);
}
const confirmed=e=>!!e&&e.publish===true&&reliable(e)&&meaningful(e.value);
const publicValue=(r,key,fallback=null)=>confirmed(r.fields[key])?r.fields[key].value:fallback;
const approvedImage=i=>!!i&&i.publish===true&&i.confidence!=='D'&&['official-confirmed','video-confirmed','ingame-confirmed','source-confirmed'].includes(i.verificationStatus)&&(i.type==='official'||i.publicationApproved===true)&&!!i.source;
const hasVerifiedContent=r=>Object.values(r.fields||{}).some(confirmed)||(r.images||[]).some(approvedImage);
const canPublish=r=>r.publish===true&&hasVerifiedContent(r);
const visible=r=>r.directoryVisible===true||canPublish(r);
function video(v,label){if(!Array.isArray(v.verifiedItems)||! /^\d{2}:[0-5]\d:[0-5]\d$/.test(v.timestampStart)||! /^\d{2}:[0-5]\d:[0-5]\d$/.test(v.timestampEnd)||v.timestampStart>v.timestampEnd)throw Error('Invalid video evidence: '+label)}
function evidence(e,label){
 if(!['A','B','C','D'].includes(e.confidence)||!verificationStatuses.includes(e.verificationStatus)||typeof e.publish!=='boolean'||!e.sources?.length)throw Error('Invalid evidence: '+label);
 for(const s of e.sources)if(!sourceTypes.includes(s.type)||!s.name||! /^\d{4}-\d{2}-\d{2}$/.test(s.accessedAt)||s.url!==null&&! /^https?:\/\//.test(s.url))throw Error('Invalid source: '+label);
 if(e.publish&&!reliable(e))throw Error('Publication needs reliable evidence: '+label);
 if(e.publish&&e.verificationStatus==='video-confirmed'&&!e.videoSources?.length)throw Error('Video publication needs timestamps: '+label);
 for(const v of e.videoSources||[])video(v,label);
}
function validateEntity(r,label){
 for(const key of ['id','slug','nameEn','nameZh','description','confidence','verificationStatus','contentStatus','publish','sources','notes','updatedAt','videoSources','images','fields'])if(!(key in r))throw Error('Missing '+label+'.'+key);
 if(! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug)||! /^\d{4}-\d{2}-\d{2}$/.test(r.updatedAt)||!contentStatuses.includes(r.contentStatus))throw Error('Invalid entity: '+label);
 evidence({...r,publish:false},label);
 for(const [key,f] of Object.entries(r.fields)){if(!('value'in f))throw Error('Missing value');evidence(f,label+'.'+key);if(['guide','mapGuide'].includes(key)&&Array.isArray(f.value))for(const [index,block] of f.value.entries())evidence(block,label+'.'+key+'['+index+']')}
 for(const v of r.videoSources)video(v,label);
 for(const i of r.images){if(!['official','video-frame','ingame','map'].includes(i.type)||!verificationStatuses.includes(i.verificationStatus)||typeof i.publish!=='boolean')throw Error('Invalid image');if(i.publish&&!approvedImage(i))throw Error('Image evidence/permission missing')}
 if(r.publish&&!hasVerifiedContent(r))throw Error('Public page needs a meaningful verified fact: '+label);
 if(r.contentStatus==='empty'&&hasVerifiedContent(r))throw Error('Verified facts cannot have empty contentStatus');
}
function loadClassicData(root){
 const dir=path.join(root,'content/games/an-jing-wei-guang'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'data.json'),'utf8'));if(manifest.schemaVersion!==2)throw Error('Unsupported schema');
 const data={updatedAt:manifest.updatedAt};
 for(const [key,file] of Object.entries(manifest.files)){if(! /^[A-Za-z]+\.json$/.test(file))throw Error('Unsafe filename');const value=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));data[key]=value;const ids=new Set(),slugs=new Set();for(const r of Array.isArray(value)?value:[value]){validateEntity(r,key);if(ids.has(r.id)||slugs.has(r.slug))throw Error('Duplicate '+key);ids.add(r.id);slugs.add(r.slug)}}
 // Add independently sourced reference fields without overwriting existing facts or video evidence.
 const reference=JSON.parse(fs.readFileSync(path.join(dir,'ability-reference.json'),'utf8'));
 const seen=new Set();
 for(const item of reference.entries){
  if(seen.has(item.id))throw Error('Duplicate ability reference');seen.add(item.id);
  const record=[...data.abilities,...data.keyItems].find(e=>e.id===item.id);
  if(!record)throw Error('Unknown ability reference '+item.id);
  for(const [key,text,sourceIds] of [['referenceEffect',item.effect,item.effectSources],['referenceAcquisition',item.acquisition,item.locationSources]]){
   if(!sourceIds.length)continue;
   if(record.fields[key])throw Error('Reference field collision '+key);
   const sources=sourceIds.map(id=>{if(!reference.sources[id])throw Error('Unknown reference source');return reference.sources[id]});
   record.fields[key]={value:text,confidence:'B',verificationStatus:'source-confirmed',publish:true,sources,notes:[],updatedAt:'2026-09-27',videoSources:[]};
  }
  record.publish=true;if(record.contentStatus==='empty')record.contentStatus='partial';
  validateEntity(record,'ability-reference.'+item.id);
 }
 for(const c of data.challenges)if(!data.areas.some(a=>a.id===c.areaId))throw Error('Unknown challenge area');return data;
}
module.exports={loadClassicData,visible,confirmed,reliable,publicValue,approvedImage,hasVerifiedContent,canPublish,validateEntity,verificationStatuses,contentStatuses};
