// Public reading copy is separate from timestamped research evidence.
const replacements=require('../../content/games/an-jing-wei-guang/reader-copy.json');
function readerText(value){
 const text=String(value??''),replacement=[...replacements].sort((a,b)=>b.match.length-a.match.length).find(item=>text.includes(item.match));
 return replacement?replacement.zh:text;
}
module.exports={readerText,replacements};
