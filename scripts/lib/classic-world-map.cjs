// Original SVG diagram. Coordinates are editorial layout, never game-map coordinates.
const fs=require('node:fs'),path=require('node:path');
const {publicValue}=require('./classic-data.cjs');
const graph=require('../../content/games/an-jing-wei-guang/world-map.json');
const labels=require('../../content/games/an-jing-wei-guang/labels-zh.json');
const base='/games/an-jing-wei-guang/',assetBase=base+'images/maps/';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mapData(data){
 const nodes=graph.nodes.map(n=>{const area=data.areas.find(a=>a.id===n.id);if(!area)throw Error('Unknown map region '+n.id);return {...n,area}});
 if(new Set(nodes.map(n=>n.id)).size!==data.areas.length)throw Error('World diagram must cover every region once');
 const edges=[];
 for(const node of nodes)for(const target of publicValue(node.area,'nextAreas',[])){
  if(!nodes.some(n=>n.id===target))throw Error('Unknown map route target');
  edges.push({from:node.id,to:target});
 }
 return {nodes,edges};
}
function textLines(label){if(label.length<=23)return [label];const words=label.split(' ');let lines=[''];for(const word of words){if((lines.at(-1)+' '+word).trim().length>23&&lines.at(-1))lines.push(word);else lines[lines.length-1]=(lines.at(-1)+' '+word).trim()}return lines}
function svg(data,locale,focus){
 const {nodes,edges}=mapData(data),en=locale==='en',selected=focus?nodes.find(n=>n.id===focus):null;
 if(focus&&!selected)throw Error('Unknown regional crop');
 const ids=focus?new Set([focus,...edges.flatMap(e=>e.from===focus?[e.to]:e.to===focus?[e.from]:[])]):new Set(nodes.map(n=>n.id));
 const shown=nodes.filter(n=>ids.has(n.id)),links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
 const bounds=focus?[Math.min(...shown.map(n=>n.x))-35,Math.min(...shown.map(n=>n.y))-25,Math.max(...shown.map(n=>n.x))+245,Math.max(...shown.map(n=>n.y))+110]:[0,70,graph.width,graph.height-95];
 const [left,top,right,bottom]=bounds,width=focus?Math.max(740,right-left):graph.width,height=bottom-top+180;
 const label=n=>en?n.area.nameEn:publicValue(n.area,'nameZh')||labels[n.area.nameEn]||n.area.nameEn;
 const title=focus?label(selected)+(en?' — regional view':' · 区域视图'):(en?'World Structure — First Edition':'世界结构 · 第一版');
 const intro=en?'Diagram layout, not geographic position or room geometry.':'示意排布，不代表真实方位或房间轮廓。';
 const routes=links.map(e=>{const a=nodes.find(n=>n.id===e.from),b=nodes.find(n=>n.id===e.to);const ax=a.x-left+210,ay=a.y-top+45,bx=b.x-left,by=b.y-top+45;return `<path data-route="${e.from}:${e.to}" d="M ${ax} ${ay} H ${(ax+bx)/2} V ${by} H ${bx-9}" fill="none" stroke="#8f4038" stroke-width="3" marker-end="url(#arrow)"/>`}).join('');
 const regions=shown.map(n=>{const x=n.x-left,y=n.y-top,active=n.id===focus,number=String(nodes.indexOf(n)+1).padStart(2,'0');return `<a href="https://gamenote.cc${en?'/en':''}${base}maps/${n.area.slug}/"><g data-region="${n.id}"><path d="M ${x+9} ${y} H ${x+201} L ${x+210} ${y+9} V ${y+81} L ${x+201} ${y+90} H ${x+9} L ${x} ${y+81} V ${y+9} Z" fill="${active?'#fff0ca':'#f5f2e9'}" stroke="${active?'#8f4038':'#71838a'}" stroke-width="${active?3:1.5}"/><text x="${x+12}" y="${y+20}" font-size="11" fill="#74858b">${number}</text><text x="${x+105}" y="${y+44}" text-anchor="middle" font-size="18" font-weight="700" fill="#304f60">${textLines(label(n)).map((line,i)=>`<tspan x="${x+105}" dy="${i?23:0}">${escape(line)}</tspan>`).join('')}</text></g></a>`}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" lang="${en?'en':'zh-CN'}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">${escape(intro)} ${en?'Arrows show reviewed route sequence, not verified physical corridors.':'箭头表示已核对流程衔接，并非已确认的实际通道。'}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#8f4038"/></marker></defs><rect width="100%" height="100%" fill="#fffdf6"/><g font-family="Microsoft YaHei,system-ui,sans-serif"><text x="24" y="30" font-size="12" letter-spacing="2" fill="#8f4038">GAME NOTE CLASSIC / WELL DWELLER</text><text x="24" y="61" font-size="23" font-weight="700" fill="#8f4038">${escape(title)}</text><text x="24" y="85" font-size="13" fill="#596e77">${escape(intro)}</text><g transform="translate(0 110)">${routes}${regions}${!focus?`<text x="50" y="${310-top}" font-size="15" fill="#596e77">${en?'Other regions — connections not yet established':'其他区域 · 连接尚未补全'}</text>`:''}</g><path d="M 24 ${height-45} H 62" stroke="#8f4038" stroke-width="3" marker-end="url(#arrow)"/><text x="76" y="${height-40}" font-size="13" fill="#596e77">${en?'Reviewed route sequence; no line means unknown, not disconnected.':'已核对流程衔接；未画线表示未知，不代表区域不相连。'}</text></g></svg>`;
}
function buildWorldMaps(data,root){
 const dir=path.join(root,assetBase);fs.mkdirSync(path.join(dir,'regions'),{recursive:true});
 for(const locale of ['zh','en']){fs.writeFileSync(path.join(dir,'world-'+locale+'.svg'),svg(data,locale));for(const node of graph.nodes)fs.writeFileSync(path.join(dir,'regions',node.id+'-'+locale+'.svg'),svg(data,locale,node.id))}
}
function markup(area){
 const file=area?'regions/'+area.id+'-zh.svg':'world-zh.svg';
 return `<p class="classic-map-note">区域结构示意：排布不代表真实方位，箭头仅表示已核对的流程衔接。本版不标注未经确认的房间轮廓与收集坐标。</p><figure class="classic-world-map"><div class="classic-map-scroll" tabindex="0" role="region" aria-label="地图查看区域"><a href="${assetBase+file}" target="_blank" rel="noopener noreferrer" aria-label="放大结构示意图"><img src="${assetBase+file}" alt="${area?'区域结构视图':'世界结构示意图'}" loading="lazy"></a></div><figcaption>GAME NOTE 原创绘制 · 点击图片放大；小屏可横向滚动。</figcaption></figure>`;
}
module.exports={buildWorldMaps,markup,mapData,svg,graph};
