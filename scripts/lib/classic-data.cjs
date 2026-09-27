const fs=require('node:fs'),path=require('node:path');
const statuses=['research','draft','published'],verifications=['unverified','source-confirmed','video-confirmed','ingame-confirmed'];
const sourceTypes=['official','steam-community','wiki','guide','video','ingame'];
function validateEvidence(record,label){
 if(!['A','B','C','D'].includes(record.confidence)||!statuses.includes(record.publishStatus)||!verifications.includes(record.verificationStatus))throw Error('Invalid evidence state: '+label);
 if(!Array.isArray(record.sources)||!record.sources.length)throw Error('Missing sources: '+label);
 for(const s of record.sources){if(!sourceTypes.includes(s.type)||!s.name||!/^\d{4}-\d{2}-\d{2}$/.test(s.accessedAt)||s.url!==null&&!/^https?:\/\//.test(s.url))throw Error('Invalid source: '+label)}
 if(record.publishStatus==='published'&&(!['A','B'].includes(record.confidence)||record.verificationStatus==='unverified'))throw Error('Published evidence needs confirmed A/B sources: '+label);
}
function validateEntity(record,label){
 for(const key of ['id','slug','nameEn','nameZh','description','confidence','verificationStatus','publishStatus','sources','notes','updatedAt','videoSources','images','fields'])if(!(key in record))throw Error('Missing '+label+'.'+key);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)||!/^\d{4}-\d{2}-\d{2}$/.test(record.updatedAt))throw Error('Invalid slug/date: '+label);
 validateEvidence(record,label);
 for(const [key,field] of Object.entries(record.fields)){if(!('value'in field))throw Error('Missing field value');validateEvidence(field,label+'.'+key)}
 for(const v of record.videoSources){if(!Array.isArray(v.verifiedItems)||!/^\d{2}:\d{2}:\d{2}$/.test(v.timestampStart)||!/^\d{2}:\d{2}:\d{2}$/.test(v.timestampEnd))throw Error('Invalid video evidence: '+label)}
 for(const image of record.images){if(!['official','video-frame','ingame','map'].includes(image.type)||!statuses.includes(image.publishStatus)||typeof image.verified!=='boolean')throw Error('Invalid image evidence: '+label)}
}
function loadClassicData(root){
 const dir=path.join(root,'content/games/an-jing-wei-guang');
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'data.json'),'utf8'));
 if(manifest.schemaVersion!==1)throw Error('Unsupported Classic schema');
 const data={updatedAt:manifest.updatedAt};
 for(const [key,file] of Object.entries(manifest.files)){
  if(!/^[A-Za-z]+\.json$/.test(file))throw Error('Unsafe data filename');
  const value=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));data[key]=value;
  const records=Array.isArray(value)?value:[value],ids=new Set(),slugs=new Set();
  for(const record of records){validateEntity(record,key);if(ids.has(record.id)||slugs.has(record.slug))throw Error('Duplicate '+key);ids.add(record.id);slugs.add(record.slug)}
 }
 for(const c of data.challenges)if(!data.areas.some(a=>a.id===c.areaId))throw Error('Unknown challenge area');
 return data;
}
const visible=r=>r.publishStatus!=='research';
const confirmed=f=>!!f&&f.publishStatus==='published'&&['A','B'].includes(f.confidence)&&f.verificationStatus!=='unverified';
const publicValue=(record,key,fallback=null)=>confirmed(record.fields[key])?record.fields[key].value:fallback;
const approvedImage=i=>i.verified&&i.publishStatus==='published'&&(i.type==='official'||i.publicationApproved===true);
module.exports={loadClassicData,visible,confirmed,publicValue,approvedImage,validateEntity};
