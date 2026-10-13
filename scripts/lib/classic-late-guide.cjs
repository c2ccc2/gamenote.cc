const fs = require('node:fs');
const path = require('node:path');
const writeFile = require('./write-file.cjs');
const content = require('../../content/games/an-jing-wei-guang/late-walkthrough.json');
const regions = require('../../content/games/an-jing-wei-guang/areas.json');
const labels = require('../../content/games/an-jing-wei-guang/labels-zh.json');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const base = '/games/an-jing-wei-guang/';
function buildRouteDiagrams(root) {
  const directory = path.join(root, 'games/an-jing-wei-guang/images/routes');
  fs.mkdirSync(directory, {recursive:true});
  for (const area of content.areas) for (const locale of ['zh','en']) {
    const nodes = area[locale].nodes;
    const width = 820, boxWidth = 176, gap = 24;
    const cards = nodes.map((node,index) => {
      const x = 20 + index * (boxWidth + gap), lines = node.split(' / ');
      return `<g><rect x="${x}" y="48" width="${boxWidth}" height="91" fill="#fffefb" stroke="#9aafbb"/><text x="${x+14}" y="71" fill="#a93131" font-size="12">0${index+1}</text>${lines.map((line,row)=>`<text x="${x+boxWidth/2}" y="${lines.length>1?98+row*22:110}" text-anchor="middle" font-size="15" fill="#293238">${esc(line)}</text>`).join('')}${index<nodes.length-1?`<path d="M${x+boxWidth+4} 94h14m-5-5 5 5-5 5" stroke="#a93131" fill="none" stroke-width="2"/>`:''}</g>`;
    }).join('');
    writeFile(path.join(directory,area.id+'-'+locale+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="166" viewBox="0 0 ${width} 166" role="img" aria-labelledby="title description"><title id="title">${locale==='zh'?'路线节点示意':'Route checkpoints'}</title><desc id="description">${locale==='zh'?'GAME NOTE 原创推进示意，节点顺序不代表实际房间布局。':'Original GAME NOTE progression diagram; this is not a geographic room map.'}</desc><rect width="820" height="166" fill="#eaf0f2"/><g font-family="system-ui,Microsoft YaHei,sans-serif"><text x="20" y="28" fill="#526168" font-size="12">GAME NOTE · ${locale==='zh'?'推进节点':'ROUTE CHECKPOINTS'}</text>${cards}</g></svg>\n`);
  }
}
function markup(record) {
  const area = content.areas.find(area=>area.id===record.id); if(!area)return '';
  const text=area.zh;
  const related=[...(area.boss?[['首领战要点',base+'bosses/'+area.boss+'/']]:[]),...area.next.map(id=>{const record=regions.find(record=>record.id===id);if(!record)throw Error('Unknown next region '+id);return ['后续区域：'+(labels[record.nameEn]||record.nameEn),base+'walkthrough/'+id+'/']})];
  if(area.id==='dollmakers-house')related.push(['墙壁弹射',base+'abilities/wall-sling/']);
  if(area.id==='burial-vault')related.push(['护送任务',base+'quests/a-ride-to-the-party/']);
  if(area.id==='webdrench-inn')related.push(['金色羽毛',base+'collectibles/golden-feathers/']);
  if(area.id==='queens-castle')related.push(['兄弟姐妹任务',base+'quests/the-queens-chamber/'],['通关后的探索',base+'secrets/']);
  return `<section><h2 class="classic-heading">本段目标</h2><p>${esc(text.goal)}</p><h2 class="classic-heading">入区准备</h2><p>${esc(text.before)}</p>${text.steps.map((step,index)=>`<h2 class="classic-heading" id="route-step-${index+1}">${esc(step.title)}</h2><p>${esc(step.text)}</p>`).join('')}<h2 class="classic-heading">离开前检查</h2>${text.check.map(point=>`<p>${esc(point)}</p>`).join('')}<h2 class="classic-heading">后续攻略</h2><ul class="classic-links">${related.map(([title,url])=>`<li>→ <a href="${url}">${esc(title)}</a></li>`).join('')}</ul></section>`;
}
module.exports={buildRouteDiagrams,markup};
