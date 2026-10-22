const overrides = [
 ['tragic-night',60,4,{zh:'鹿头再战',en:'Deer rematch'}],
 ['crimson-trace',192,2,{zh:'双精英战',en:'Two-elite encounter'}],
 ['suicide-squad',224,0,{zh:'侵蚀士兵与怪物战',en:'Corrupted soldiers and monsters'}],
 ['disobedience',247,0,{zh:'任务最终战',en:'Final mission encounter'}],
 ['charons-chains',248,6,{zh:'三场首领连战',en:'Three-boss gauntlet'}],
 ['birth-of-evil',252,9,{zh:'双敌人战',en:'Two-enemy encounter'}],
];
module.exports = guide => guide.side.flatMap(task => {
 const override=overrides.find(row=>row[0]===task.id);
 const step=override ? task.steps.find(s=>s.sourcePage===override[1]) : task.steps.find(s=>/首领战|BOSS战/.test(s.title.zh));
 if(!step)return [];
 return [{task,step,startBlock:override?.[2]||0,title:override?.[3]||step.title}];
});
