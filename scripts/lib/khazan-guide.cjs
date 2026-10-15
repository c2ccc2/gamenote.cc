const fs = require('node:fs');
const path = require('node:path');
const tasks = require('../../content/games/the-first-berserker-khazan/tasks.json');
const notes = require('../../content/games/the-first-berserker-khazan/route-notes.cjs');
const sources = require('../../content/games/the-first-berserker-khazan/source-index.json');
const archive = require('../../content/games/the-first-berserker-khazan/source-content.json');

const types = [
  {id:'soulstones', zh:'鬼石位置', en:'Soulstone locations'},
  {id:'jarlings', zh:'罐子精灵位置', en:'Jarling locations'},
  {id:'records', zh:'文书与剧情收集', en:'Records and story items'},
  {id:'scrolls', zh:'卷轴位置', en:'Scroll locations'},
  {id:'upgrades', zh:'冥界气息', en:'Netherworld Energy'},
  {id:'relics', zh:'鬼气弥漫的物品', en:'Ghostly items'},
  {id:'key-items', zh:'钥匙与圆盘碎片', en:'Keys and disc fragments'},
];
const extras = [
  [47,'罐子精灵','jarlings'],[47,'罐子精灵','jarlings'],
  [48,'罐子精灵','jarlings'],[48,'罐子精灵','jarlings'],[48,'罐子精灵','jarlings'],[48,'罐子精灵','jarlings'],
  [9,'班吉的识别牌','records'],[40,'毒素抗性魔法卷轴','scrolls','不使用恢复类消耗品击败巨型蝙蝠。','Defeat the giant bat without using healing consumables.'],
  [58,'火召唤卷轴','scrolls'],[60,'堕落守护神卷轴','scrolls'],[66,'吟游诗人卷轴','scrolls'],[72,'毒素召唤卷轴','scrolls'],
  [79,'某个魔法学者的记录','records'],[79,'罐子精灵','jarlings'],[81,'猎杀者卷轴','scrolls'],[99,'闪电净化魔法卷轴','scrolls'],
  [104,'刺客秘方','scrolls'],[108,'帝国哨兵的记录','records'],[138,'水净化魔法卷轴','scrolls'],
  [141,'鬼石5','soulstones'],[142,'未寄出的信','records'],[163,'猩红恶鬼卷轴','scrolls'],[166,'幻觉净化魔法卷轴','scrolls'],
  [184,'大将军卷轴','scrolls'],[185,'破旧的日记本','records'],[242,'屠戮者卷轴','scrolls'],[269,'大地净化魔法卷轴','scrolls'],
  [274,'褪色回忆卷轴','scrolls'],[284,'混沌之主卷轴','scrolls'],
];
const correctedNames = new Map([
  ['士兵的日记','帝国士兵的日记'], ['通缉令盗贼团账幕之刃','通缉令：盗贼团账幕之刃'],
  ['冥界气息-回血+1','冥界气息'],['冥界气息+1','冥界气息'],['罐子补充','罐子精灵'],['罐子','罐子精灵'],
]);
const headings = new Map([
  [3,['进入 Heinmach','Entering Heinmach']],[20,['边界裂缝与任务入口','The Crevice and mission portal']],
  [28,['救援贝罗妮卡','Helping Veronika']],[30,['开启首领门与助力之魂','Opening the boss gate']],
  [141,['图书馆两翼与书柜密道','Both library wings and the hidden passage']],
  [275,['进入皇宫','Entering the palace']],[276,['皇宫侧路','Palace side route']],
  [282,['打开皇宫捷径','Opening the palace shortcut']],[283,['最终存档点','The final checkpoint']],
  [285,['结局收尾','The ending']],
]);
function itemsFromTitle(title) {
  const start = title.indexOf('（');
  if (start < 0) return [];
  return title.slice(start + 1, title.lastIndexOf('）')).split(/[、，,]/).flatMap(raw => {
    let name = raw.replace(/^收集[：:]\s*/, '').trim();
    name = correctedNames.get(name) || name;
    let type;
    if (/^鬼石\d*$/.test(name)) type = 'soulstones';
    else if (/^罐子/.test(name)) {type = 'jarlings'; name = '罐子精灵';}
    else if (/卷轴|秘方/.test(name)) type = 'scrolls';
    else if (/冥界气息/.test(name)) {type = 'upgrades'; name = '冥界气息';}
    else if (/^鬼气弥漫/.test(name)) type = 'relics';
    else if (/圆盘碎片|钥匙/.test(name)) type = 'key-items';
    else if (/^收集[：:]/.test(raw) || /记录|日记|手记|预言|讨伐战/.test(name)) type = 'records';
    return type ? [{name, type}] : [];
  });
}
function heading(source, locale) {
  if (headings.has(source.page)) return headings.get(source.page)[locale === 'en' ? 1 : 0];
  const start = source.title.indexOf('（');
  let title = start < 0 ? source.title : source.title.slice(start + 1, source.title.lastIndexOf('）'));
  if (locale === 'en') {
    if (/B[O0]?[OS]*S|BOOS/.test(title)) return /前/.test(title) ? 'Rest before the boss' : 'Boss encounter';
    if (/罐子/.test(title)) return 'Jarling and nearby route';
    if (/鬼石/.test(title)) return 'Soulstone and nearby route';
    if (/卷轴/.test(title)) return 'Scroll pickup';
    if (/冥界/.test(title)) return 'Healing upgrade';
    if (/鬼气/.test(title)) return 'Ghostly item';
    if (/试炼/.test(title)) return 'Weapon trial';
    return 'Exploration and pickups';
  }
  return title.replace(/^BOSS战[：:]/,'首领战：').replace(/^BOSS战$/,'首领战').replace(/BOSS前|BOOS前/,'首领前').replace(/^收集[：:]/,'').replace(/^罐子补充$/,'罐子精灵');
}

module.exports = function loadGuide(root) {
  if (notes.length !== 285 || new Set(notes.map(n=>n.page)).size !== 285) throw Error('Missing authored route notes');
  if(archive.pages.length!==285)throw Error('Missing local guide body');
  const noteMap = new Map(notes.map(n => [n.page,n]));
  const usedPages = new Set(), allPoints = [];
  const normalized = tasks.map(task => {
    if (!['main','side'].includes(task.kind) || !/^[a-z0-9-]+$/.test(task.id) || !task.sourcePages.length) throw Error('Invalid Khazan task');
    const counts = new Map();
    const steps = task.sourcePages.map(page => {
      if (usedPages.has(page)) throw Error('Source page assigned to multiple tasks: ' + page);
      usedPages.add(page);
      const source = sources[page-1], note = noteMap.get(page);
      const content = archive.pages[page-1];
      if (!source || !note?.zh || !note?.en) throw Error('Missing Khazan step: ' + page);
      if(content.page!==page||content.source!==source.url)throw Error('Local guide source mismatch: '+page);
      const id = `route-${page}`;
      const itemDrafts = [...itemsFromTitle(source.title), ...extras.filter(e=>e[0]===page).map(([,name,type,zh,en])=>({name,type,requirement:zh?{zh,en}:null}))];
      const points = itemDrafts.map((item,index) => {
        const order = (counts.get(item.type) || 0) + 1;
        counts.set(item.type,order);
        const name = item.type === 'soulstones' ? `鬼石 ${order}` : item.name;
        const point = {
          id:`${task.id}-${item.type}-${order}`, type:item.type, order, taskId:task.id, kind:task.kind, stepId:id,
          name:{zh:name,en:item.type === 'soulstones' ? `Soulstone ${order}` : item.type === 'jarlings' ? 'Jarling' : `${({records:'Record',scrolls:'Scroll',upgrades:'Netherworld Energy',relics:'Ghostly item','key-items':'Key item'})[item.type]} ${order}`},
          location:{zh:note.zh,en:note.en}, source:source.url, sourcePage:page, requirement:item.requirement,
        };
        if (page===141 && item.type==='soulstones') point.location = order===4
          ? {zh:'从大厅右侧楼梯进入书房，清理骷髅并上楼，鬼石在敌人左侧。',en:'Take the hall’s right stairs through the study, clear the skeletons, and climb to the Soulstone on the left.'}
          : {zh:'从大厅左侧楼梯进入图书馆，互动带机关的书柜，密道内有另一块鬼石。',en:'Enter the library from the left stairs and activate the bookshelf mechanism for another Soulstone in the passage.'};
        if(task.id==='jar-enthusiast'&&item.type==='jarlings'){
          const locations=[
            ['第一个罐子在开场前方桥边。','The first jar is beside the bridge near the start.'],
            ['经过隐形敌人后下到房屋，第二个罐子在屋内。','Pass the invisible enemy and descend to the house for the second jar inside.'],
            ['爬右侧房屋楼梯上去，第三个罐子在左边房屋内。','Climb the stairs in the right house; the third jar is in the house on the left.'],
            ['沿道路再走一段，第四个罐子仍在左侧房屋内。','Continue along the road for the fourth jar in the next house on the left.'],
            ['离开第四个罐子所在房屋，检查右上方，第五个罐子在这里。','Leave the fourth jar’s house and inspect the upper right area for the fifth jar.'],
            ['最后一个罐子在道路尽头左侧，取完后出现返回传送点。','The last jar is on the left at the end of the road, where the return portal appears.'],
          ][order-1];
          point.name={zh:`罐子精灵 ${order}`,en:`Jarling ${order}`};
          point.location={zh:locations[0],en:locations[1]};
        }
        const term=item.type==='soulstones'?'鬼石':item.type==='jarlings'?'罐子精灵':item.name;
        let matches=content.blocks.map((block,index)=>({block,index})).filter(x=>x.block.text?.includes(term));
        if(item.type==='jarlings'&&!matches.length)matches=content.blocks.map((block,index)=>({block,index})).filter(x=>x.block.text?.includes('罐子'));
        if(item.type==='upgrades'&&!matches.length)matches=content.blocks.map((block,index)=>({block,index})).filter(x=>/冥界.?气息/.test(x.block.text||''));
        let anchor=matches.at(-1);
        if(page===141&&item.type==='soulstones')anchor=order===4?matches[0]:matches.at(-1);
        if(task.id==='jar-enthusiast'&&item.type==='jarlings'){
          const marker=['第一个罐子','第二个罐子','第三个罐子','第四个罐子','第五个','最后一个罐子'][order-1];
          const index=content.blocks.findIndex(b=>b.text?.includes(marker));
          if(index>=0)anchor={index};
        }
        point.image=anchor?content.blocks.slice(anchor.index+1).find(b=>b.kind==='image')?.src:null;
        point.blockIndex=anchor?.index??0;
        point.routeAnchor='pickup-'+point.id;
        allPoints.push(point);
        return point;
      });
      const images = content.blocks.filter(b=>b.kind==='image').map(b=>b.src);
      for (const image of images) if (!fs.existsSync(path.join(root,image.slice(1)))) throw Error('Missing route image: '+image);
      return {id,sourcePage:page,source:source.url,title:{zh:heading(source,'zh'),en:heading(source,'en')},text:{zh:note.zh,en:note.en},blocks:content.blocks,images,points,revisit:source.title.startsWith('章节：')};
    });
    return {...task,slug:task.id,status:'published',steps,points:steps.flatMap(s=>s.points)};
  });
  if (usedPages.size !== 285 || normalized.filter(t=>t.kind==='main').length!==16 || normalized.filter(t=>t.kind==='side').length!==24) throw Error('Incomplete task coverage');
  const pointIds=allPoints.map(p=>p.id);
  if (new Set(pointIds).size!==pointIds.length) throw Error('Duplicate Khazan collectible');
  const english=require('./khazan-english.cjs');
  for(const task of normalized)for(const step of task.steps)step.title.en=english.title(step.title.zh);
  for(const point of allPoints)if(!['soulstones','jarlings'].includes(point.type))point.name.en=english.title(point.name.zh);
  return {tasks:normalized,main:normalized.filter(t=>t.kind==='main'),side:normalized.filter(t=>t.kind==='side'),points:allPoints,types,assets:archive.assets||{}};
};
