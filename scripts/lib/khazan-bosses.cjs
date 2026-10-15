const names=[
 ['snow-yeti-king','Yetuga'],['blade-phantom-boss','Blade Phantom'],
 ['viper','Viper'],['volbaino','Volbaino'],['aratra','Aratra'],
 ['rangkus','Rangkus'],['maluca','Maluka'],['elamein','Elamein'],
 ['shactuka','Shactuka'],['trokka','Trokka'],['bellerian','Bellerian'],
 ['skalpel','Skalpel'],['princess-ilyna','Princess Illyna'],
 ['hismar','Hismar'],['reese','Reese'],['ozma-boss','Ozma'],
];
module.exports=guide=>guide.main.map((task,index)=>{
 const step=task.steps.find(s=>/首领战|BOSS战/.test(s.title.zh));
 if(!step)throw new Error('Missing boss encounter: '+task.id);
 return {...require('../../content/games/the-first-berserker-khazan/boss-profiles.cjs')[index],id:names[index][0],title:{zh:step.title.zh.replace(/^首领战：|^BOSS战：/,'').replace(/-鹿头|-蜘蛛/g,''),en:names[index][1]},task,step};
});
