const fs = require('node:fs');
const path = require('node:path');
const writeFile = require('./write-file.cjs');
const content = require('../../content/games/an-jing-wei-guang/late-walkthrough.json');
const regions = require('../../content/games/an-jing-wei-guang/areas.json');
const labels = require('../../content/games/an-jing-wei-guang/labels-zh.json');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const base = '/games/an-jing-wei-guang/';
const routeNodes = new Map(content.areas.map(area=>[area.id,{zh:area.zh.nodes,en:area.en.nodes}]));
routeNodes.set('midnight-drench',{
 zh:['学会悬停 / 返回午夜暴雨','浮动气泡 / 右上帐篷','向东逐级上升 / 敲顶部开关','左上进神龛 / 战后向左取羽毛'],
 en:['Learn Hover / Return to Midnight Drench','Floating bubbles / Upper-right tent','Climb east / Hit the top switch','Shrine upper left / Feather on the left']
});
routeNodes.set('lookout-tower',{
 zh:['踩羽毛气泡 / 暂时飞行','中央帐篷 / 找三枚时长升级','回中央帐篷 / 开上方两个开关','第二处帐篷 / 右行挑战星歌者'],
 en:['Bounce on feather bubbles / Temporary flight','Central tent / Three duration upgrades','Return to central tent / Open two upper switches','Second tent / Starsinger to the right']
});
routeNodes.set('autumn-forest',{
 zh:['森林入口 / 先开两侧开关','搭摩天轮 / 从顶部出口离开','节庆帐篷 / 从下层绕开封路','挑战森林之王 / 战后取金羽毛'],
 en:['Forest entrance / Open both switches','Ride the Ferris wheel / Take the top exit','Festival tent / Detour below the blocked path','Forest King / Collect the Golden Feather']
});
function buildRouteDiagrams(root) {
  const directory = path.join(root, 'games/an-jing-wei-guang/images/routes');
  fs.mkdirSync(directory, {recursive:true});
  for (const [id,route] of routeNodes) for (const locale of ['zh','en']) {
    const nodes = route[locale];
    const width = 820, boxWidth = 176, gap = 24;
    const cards = nodes.map((node,index) => {
      const x = 20 + index * (boxWidth + gap), lines = node.split(' / ');
      return `<g><rect x="${x}" y="48" width="${boxWidth}" height="91" fill="#fffefb" stroke="#9aafbb"/><text x="${x+14}" y="71" fill="#a93131" font-size="12">0${index+1}</text>${lines.map((line,row)=>`<text x="${x+boxWidth/2}" y="${lines.length>1?98+row*22:110}" text-anchor="middle" font-size="15" fill="#293238">${esc(line)}</text>`).join('')}${index<nodes.length-1?`<path d="M${x+boxWidth+4} 94h14m-5-5 5 5-5 5" stroke="#a93131" fill="none" stroke-width="2"/>`:''}</g>`;
    }).join('');
    writeFile(path.join(directory,id+'-'+locale+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="166" viewBox="0 0 ${width} 166" role="img" aria-labelledby="title description"><title id="title">${locale==='zh'?'路线节点示意':'Route checkpoints'}</title><desc id="description">${locale==='zh'?'GAME NOTE 原创推进示意，节点顺序不代表实际房间布局。':'Original GAME NOTE progression diagram; this is not a geographic room map.'}</desc><rect width="820" height="166" fill="#eaf0f2"/><g font-family="system-ui,Microsoft YaHei,sans-serif"><text x="20" y="28" fill="#526168" font-size="12">GAME NOTE · ${locale==='zh'?'推进节点':'ROUTE CHECKPOINTS'}</text>${cards}</g></svg>\n`);
  }
}
function markup(record) {
  const area = content.areas.find(area=>area.id===record.id); if(!area)return '';
  const text=area.zh;
  const related=[...(area.boss?[['首领战要点',base+'bosses/'+area.boss+'/']]:[]),...area.next.map(id=>{const record=regions.find(record=>record.id===id);if(!record)throw Error('Unknown next region '+id);return ['后续区域：'+(labels[record.nameEn]||record.nameEn),base+'walkthrough/'+id+'/']})];
  if(area.id==='dollmakers-house')related.push(['墙壁弹射',base+'abilities/wall-sling/']);
  if(area.id==='burial-vault')related.push(['护送任务',base+'quests/a-ride-to-the-party/#escort-route']);
  if(area.id==='webdrench-inn')related.push(['金色羽毛',base+'collectibles/golden-feathers/']);
  if(area.id==='queens-castle')related.push(['女王城堡三处牢笼',base+'quests/the-queens-chamber/#castle-cages'],['通关后的探索',base+'secrets/']);
  return `<section><h2 class="classic-heading">本段目标</h2><p>${esc(text.goal)}</p><h2 class="classic-heading">入区准备</h2><p>${esc(text.before)}</p>${text.steps.map((step,index)=>`<h2 class="classic-heading" id="route-step-${index+1}">${esc(step.title)}</h2><p>${esc(step.text)}</p>`).join('')}<h2 class="classic-heading">离开前检查</h2>${text.check.map(point=>`<p>${esc(point)}</p>`).join('')}<h2 class="classic-heading">后续攻略</h2><ul class="classic-links">${related.map(([title,url])=>`<li>→ <a href="${url}">${esc(title)}</a></li>`).join('')}</ul></section>`;
}
function diagram(id) {
  if(!routeNodes.has(id))return '';
  const src=base+'images/routes/'+id+'-zh.svg';
  return `<figure id="route-checkpoints"><a href="${src}"><img src="${src}" width="820" height="166" alt="路线节点示意"></a><figcaption>GAME NOTE 原创节点示意 · 不代表实际房间地图</figcaption></figure>`;
}
module.exports={buildRouteDiagrams,markup,diagram};
