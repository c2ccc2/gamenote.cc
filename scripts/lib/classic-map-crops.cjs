// Code-native SVG viewports crop unchanged approved footage; no rooms are invented.
const fs=require('node:fs'),path=require('node:path');
const crops=require('../../content/games/an-jing-wei-guang/map-crops.json');
const {approvedImage}=require('./classic-data.cjs');
const assetBase='/games/an-jing-wei-guang/images/maps/crops/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function buildMapCrops(data,root){
 const dir=path.join(root,assetBase);fs.mkdirSync(dir,{recursive:true});
 for(const crop of crops){
  const area=data.areas.find(a=>a.id===crop.id),image=area?.images.find(i=>i.src===crop.source);
  if(!image||!approvedImage(image))throw Error('Map crop requires an approved source: '+crop.id);
  const [x,y,w,h]=crop.bounds;if(x<0||y<0||w<=0||h<=0||x+w>image.width||y+h>image.height)throw Error('Invalid map crop bounds: '+crop.id);
  const uri='data:image/webp;base64,'+fs.readFileSync(path.join(root,crop.source)).toString('base64');
  for(const en of [false,true]){
   const locale=en?'en':'zh',width=640,mapHeight=Math.round(h*width/w),height=mapHeight+124;
   const title=(en?crop.titleEn:crop.titleZh)+(en?' — Explored Map Detail':' · 已探索局部地图');
   // A single SVG root avoids live-server injecting its reload script at each
   // nested </svg> while advertising a Content-Length for only one injection.
   const scale=width/w;
   const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${en?'Cropped from credited gameplay footage. Incomplete exploration, not a full regional map.':'裁切自已署名游戏录像，仅显示当时的探索部分，不是完整区域地图。'}</desc><defs><clipPath id="map-crop" clipPathUnits="userSpaceOnUse"><rect x="0" y="48" width="${width}" height="${mapHeight}"/></clipPath><clipPath id="creator-watermark" clipPathUnits="userSpaceOnUse"><rect x="430" y="${height-42}" width="202" height="38"/></clipPath></defs><rect width="100%" height="100%" fill="#101719"/><text x="16" y="28" font-family="Microsoft YaHei,system-ui,sans-serif" font-size="19" fill="#f1e5c8">${esc(title)}</text><g clip-path="url(#map-crop)" data-source-bounds="${crop.bounds.join(' ')}"><image width="${image.width}" height="${image.height}" href="${uri}" transform="translate(${-x*scale} ${48-y*scale}) scale(${scale})"/></g><text x="16" y="${height-44}" font-family="Microsoft YaHei,system-ui,sans-serif" font-size="14" fill="#d6dfdf">${en?'Source':'原视频'}：好吃的香草雪球 · P${crop.part} ${crop.time}</text><text x="16" y="${height-20}" font-family="Microsoft YaHei,system-ui,sans-serif" font-size="13" fill="#b9c6c9">${en?'Partial exploration · GAME NOTE crop':'局部探索进度 · GAME NOTE 裁切整理'}</text><g clip-path="url(#creator-watermark)"><image x="-220" y="${height-47}" width="${image.width}" height="${image.height}" href="${uri}"/></g></svg>`;
   fs.writeFileSync(path.join(dir,crop.id+'-'+locale+'.svg'),svg+'\n');
  }
 }
}
function markup(area){
 const crop=crops.find(c=>c.id===area.id);if(!crop)return '';
 return `<section class="classic-regional-crop"><h2 class="classic-heading">区域地图 · 局部裁切</h2><figure class="classic-image-block center"><a href="${assetBase+crop.id}-zh.svg" target="_blank" rel="noopener noreferrer" aria-label="放大区域地图"><img src="${assetBase+crop.id}-zh.svg" alt="${esc(crop.titleZh)}已探索局部地图" width="640" height="${Math.round(crop.bounds[3]*640/crop.bounds[2])+124}" loading="lazy"></a><figcaption>仅显示录像当时的已探索部分，不代表完整区域或全收集。原视频作者：好吃的香草雪球。</figcaption></figure><p><a href="${crop.source}" target="_blank" rel="noopener noreferrer">查看完整原画面</a> · <a href="https://space.bilibili.com/3804625/" target="_blank" rel="noopener noreferrer">原视频作者</a></p></section>`;
}
module.exports={crops,buildMapCrops,markup};
