const fs=require('node:fs');
const path=require('node:path');

// These boundaries were edited against the local walkthrough paragraphs.
// A section may continue through several imported pages; pages are not sections.
module.exports=function attachRouteLayout(tasks){
 const file=path.join(__dirname,'../../content/games/the-first-berserker-khazan/route-layout.txt');
 const boundaries=new Map();
 for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){
  if(!line||line.startsWith('#'))continue;
  const fields=line.split('|');
  if(fields.length!==4)throw Error('Invalid route layout: '+line);
  const [page,block,zh,en]=fields,key=`${+page}:${+block}`;
  if(boundaries.has(key))throw Error('Duplicate route boundary: '+key);
  boundaries.set(key,{sourcePage:+page,blockIndex:+block,id:`path-${page}-${block}`,title:{zh,en}});
 }
 let used=0;
 for(const task of tasks){
  task.routeSections=[];
  task.routeNavigation=[];
  for(const step of task.steps){
   step.routeSections=[];
   for(let index=0;index<step.blocks.length;index++){
    const section=boundaries.get(`${step.sourcePage}:${index}`);
    if(section){
     if(!step.blocks[index].text)throw Error('Route heading must start at an instruction: '+section.id);
     task.routeSections.push(section);step.routeSections.push(section);
     task.routeNavigation.push({id:section.id,title:section.title,section});used++;
    }
    for(const point of step.points.filter(p=>p.blockIndex===index)){
     task.routeNavigation.push({id:point.routeAnchor,title:point.name,point});
    }
   }
  }
  if(!task.routeSections.length)throw Error('Missing route layout: '+task.id);
  const first=task.routeSections[0];
  if(first.sourcePage!==task.steps[0].sourcePage||first.blockIndex!==0)throw Error('Route must begin at its first block: '+task.id);
  task.routeNavigation.forEach((entry,index)=>{if(entry.section)entry.section.number=index+1;});
 }
 if(used!==boundaries.size)throw Error('Unused route boundaries');
};
