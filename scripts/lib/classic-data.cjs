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
   record.fields[key]={value:text,confidence:'B',verificationStatus:'source-confirmed',publish:true,sources,notes:[],updatedAt:item.updatedAt||'2026-09-27',videoSources:[]};
  }
  record.publish=true;if(record.contentStatus==='empty')record.contentStatus='partial';if(item.updatedAt)record.updatedAt=item.updatedAt;
  validateEntity(record,'ability-reference.'+item.id);
 }
 const refresh=JSON.parse(fs.readFileSync(path.join(dir,'reference-refresh.json'),'utf8'));
 const refreshIds=new Set();
 for(const item of refresh.entries){
  const identity=item.group+'.'+item.id;if(refreshIds.has(identity))throw Error('Duplicate refresh entry '+identity);refreshIds.add(identity);
  const record=data[item.group]?.find(e=>e.id===item.id);if(!record)throw Error('Unknown refresh entry '+identity);
  const targets=[record];
  if(item.group==='collectibles'){const keyItem=data.keyItems.find(e=>e.id===item.id);if(keyItem)targets.push(keyItem)}
  for(const target of targets){
   for(const [key,field] of Object.entries(item.fields)){
    if(target.fields[key])throw Error('Refresh field collision '+identity+'.'+key);
    if(!Array.isArray(field.zh)||!field.zh.length||!Array.isArray(field.en)||field.zh.length!==field.en.length||!field.sources?.length)throw Error('Invalid bilingual refresh field '+identity+'.'+key);
    const sources=field.sources.map(id=>{if(!refresh.sources[id])throw Error('Unknown refresh source '+id);return refresh.sources[id]});
    target.fields[key]={value:field.zh,confidence:'B',verificationStatus:'source-confirmed',publish:true,sources,notes:['Original summary of attributed reference material.'],updatedAt:refresh.updatedAt,videoSources:[]};
    target.sources=[...new Map([...target.sources,...sources].map(source=>[source.url||source.name,source])).values()];
   }
   target.publish=true;target.contentStatus=target.contentStatus==='empty'?'partial':target.contentStatus;target.updatedAt=refresh.updatedAt;
   const summary=item.fields.referenceRoute||item.fields.referenceChecklist;if(summary)target.description=summary.zh[0];
   validateEntity(target,'reference-refresh.'+identity);
  }
 }
 const late=JSON.parse(fs.readFileSync(path.join(dir,'late-walkthrough.json'),'utf8'));
 for(const area of late.areas){
  const record=data.areas.find(record=>record.id===area.id);if(!record)throw Error('Unknown late route '+area.id);
  for(const locale of ['zh','en']){const text=area[locale];if(!text?.goal||!text.before||text.nodes?.length!==4||!text.steps?.length||!text.check?.length)throw Error('Incomplete late route '+area.id+' '+locale)}
  const sources=area.sources.map(id=>{if(!late.sources[id])throw Error('Missing late route source '+id);return late.sources[id]});
  record.fields.referenceDetailedRoute={value:[area.zh.goal,area.zh.before,...area.zh.steps.map(step=>step.text)],confidence:'B',verificationStatus:'source-confirmed',publish:true,sources,notes:['Original route instructions; diagrams show progression, not room geometry.'],updatedAt:late.updatedAt,videoSources:[]};
  record.updatedAt=late.updatedAt;validateEntity(record,'late-walkthrough.'+area.id);
 }
 data.updatedAt=refresh.updatedAt;
 for(const c of data.challenges)if(!data.areas.some(a=>a.id===c.areaId))throw Error('Unknown challenge area');return data;
}
module.exports={loadClassicData,visible,confirmed,reliable,publicValue,approvedImage,hasVerifiedContent,canPublish,validateEntity,verificationStatuses,contentStatuses};
