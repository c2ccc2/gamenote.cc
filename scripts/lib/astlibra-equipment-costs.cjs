const items=require('../../content/games/astlibra-revision/items.json').records;
const costs=require('../../content/games/astlibra-revision/equipment-costs.cjs');
const equipment=items.filter(r=>['weapons','shields','armor','accessories'].includes(r.category));
const aliases={'无暇冰':'无瑕冰','虫脚':'虫腿','精金钢石':'精金刚石'};
const records=equipment.map(item=>{
 const entry=item.name==='心天平'?{gold:null,materials:[{name:'变石',quantity:1}]}:costs.find(c=>c.id===item.id);
 const materials=(entry?.materials||[]).map(m=>{
  const canonical=aliases[m.name]||m.name,record=items.find(r=>r.name===canonical&&['minerals','monster-materials','food','ingredients','misc','collection-items'].includes(r.category));
  if(!record)throw Error('No acquisition record for material '+m.name);
  return {...m,itemId:record.id,canonical,source:record.source,sourceHref:record.sourceHref};
 });
 return {...item,gold:entry?.gold??null,materials,costType:item.name==='心天平'?'exchange':materials.length?'craft':entry?.gold?'purchase':/商店/.test(item.source)?'unlisted':'reward'};
});
for(const c of costs)if(!equipment.some(r=>r.id===c.id))throw Error('Cost refers to unknown equipment '+c.id);
module.exports={records,byId:Object.fromEntries(records.map(r=>[r.id,r])),aliases};
