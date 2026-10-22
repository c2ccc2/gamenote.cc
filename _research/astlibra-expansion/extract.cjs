const fs=require('fs');
const original=JSON.parse(fs.readFileSync('_research/astlibra-expansion/ocr.json','utf8').replace(/^\uFEFF/,''));
const tiles=JSON.parse(fs.readFileSync('_research/astlibra-expansion/cell-ocr.json','utf8').replace(/^\uFEFF/,''));
const bounds=require('./cells.json');
const compact=t=>t.replace(/\s+/g,'').replace(/重是/g,'重量').replace(/精邇|精遄/g,'精通').replace(/格扌当/g,'格挡').replace(/弓虽/g,'强').replace(/廣导/g,'魔导').replace(/[×]/g,'x');
function textRect(words,x1,y1,x2,y2){const selected=words.filter(w=>w.x+w.w/2>=x1&&w.x+w.w/2<x2&&w.y+w.h/2>=y1&&w.y+w.h/2<y2).sort((a,b)=>a.y-b.y||a.x-b.x);const lines=[];for(const w of selected){let l=lines.find(l=>Math.abs(l.y-w.y)<8);if(!l){l={y:w.y,words:[]};lines.push(l)}l.words.push(w)}return lines.map(l=>l.words.sort((a,b)=>a.x-b.x).map(w=>w.text).join('')).map(compact).join('；')}
const result=[];
for(const tile of tiles){const b=bounds.find(b=>b.block===tile.block),orig=original.find(im=>im.block===b.sourceBlock),words=tile.lines.flatMap(l=>l.words).map(w=>({...w,x:w.x/3,y:w.y/3,w:w.w/3,h:w.h/3}));
 const oldWords=orig.lines.flatMap(l=>l.words).map(w=>({...w,x:w.x-b.col*Math.floor(orig.width/2),y:w.y-b.top}));
 const title=textRect(oldWords,110,0,orig.width/2,38),newTitle=textRect(words,110,0,orig.width/2,38);
 const type=b.sourceBlock<9?'weapons':b.sourceBlock<14?'shields':b.sourceBlock<19?'armor':b.sourceBlock<27?'accessories':'items';
 const top=type==='weapons'?174:type==='accessories'?140:type==='items'?145:140;
 const source=textRect(words,type==='weapons'?190:type==='items'?112:type==='accessories'?120:118,top,orig.width/2,b.bottom-b.top);
 const effect=type==='items'?textRect(words,112,105,orig.width/2,180):textRect(words,type==='weapons'?190:120,40,orig.width/2,140);
 result.push({key:tile.block,sourceBlock:b.sourceBlock,row:b.row,col:b.col,type,title,newTitle,effect,source,src:b.src,fields:words});
}
result.sort((a,b)=>a.sourceBlock-b.sourceBlock||a.row-b.row||a.col-b.col);
fs.writeFileSync('_research/astlibra-expansion/extracted.json',JSON.stringify(result,null,2));
for(const r of result)console.log(r.key+' '+r.title+' / '+r.newTitle);
