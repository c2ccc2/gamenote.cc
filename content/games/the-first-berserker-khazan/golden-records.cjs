// All fifteen entries resolve through the shared collectible records and exact route anchors.
module.exports=guide=>{
 const families=[['关于莉丝',3],['预言',4],['赫斯讨伐战',4],['黑月升起之日',4]],numerals=['一','二','三','四'];
 return families.flatMap(([family,count])=>Array.from({length:count},(_,index)=>{
  const name=family+'（'+numerals[index]+'）',point=guide.points.find(p=>p.type==='records'&&p.name.zh===name);
  if(!point)throw Error('Missing golden record in the shared index: '+name);
  return {pointId:point.id,kind:point.kind,id:name==='黑月升起之日（二）'?'golden-black-moon-ii':'golden-'+point.id,name:point.name,taskId:point.taskId,anchor:point.routeAnchor,location:point.location,source:point.supplementSource};
 }));
};
