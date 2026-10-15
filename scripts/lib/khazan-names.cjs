const characters=require('../../content/games/the-first-berserker-khazan/characters.cjs');
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const names=new Map();
for(const c of characters)for(const name of [c.zh.title,c.en.title,...c.aliases])names.set(name,c);
const pattern=new RegExp([...names.keys()].sort((a,b)=>b.length-a.length).map(n=>/^[\x00-\x7F]+$/.test(n)?`\\b${escaped(n)}\\b`:escaped(n)).join('|'),'g');
module.exports=(text,locale)=>String(text??'').replace(pattern,name=>names.get(name)[locale].title);
