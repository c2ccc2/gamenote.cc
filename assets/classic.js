/* Native directory disclosure on desktop and mobile. */
(()=>{
 const menu=document.querySelector('.classic-sidebar details');if(!menu)return;
 const media=matchMedia('(max-width:760px)');
 const shell=document.querySelector('.classic-shell'),summary=menu.querySelector('summary');
 const en=document.documentElement.lang==='en';
 const sidebar=document.querySelector('.classic-sidebar'),nav=menu.querySelector('.classic-nav');
 const storageKey='gamenote:classic-directory:'+location.pathname.replace(/^\/en\//,'/').split('/').slice(0,3).join('/');
 let state={collapsed:[],sidebarScroll:0,navScroll:0};
 try{const saved=JSON.parse(sessionStorage.getItem(storageKey));if(saved&&Array.isArray(saved.collapsed))state={collapsed:saved.collapsed.filter(id=>typeof id==='string'),sidebarScroll:Number.isFinite(saved.sidebarScroll)?Math.max(0,saved.sidebarScroll):0,navScroll:Number.isFinite(saved.navScroll)?Math.max(0,saved.navScroll):0}}catch{}
 const controllers=[];
 const allButton=document.querySelector('.classic-collapse-all');
 const updateAll=()=>{
  if(!allButton)return;
  const collapsed=controllers.length>0&&controllers.every(c=>c.items.hidden);
  allButton.textContent=en?(collapsed?'Expand all':'Collapse all'):(collapsed?'全部展开':'全部收起');
  allButton.setAttribute('aria-label',en?(collapsed?'Expand all submenu groups':'Collapse all submenu groups'):(collapsed?'展开所有二级菜单':'收起所有二级菜单'));
  allButton.setAttribute('aria-expanded',String(!collapsed));
 };
 const save=()=>{
  state.collapsed=controllers.filter(c=>c.items.hidden).map(c=>c.items.id);
  if(menu.open){if(media.matches)state.navScroll=nav.scrollTop;else state.sidebarScroll=sidebar.scrollTop}
  try{sessionStorage.setItem(storageKey,JSON.stringify(state))}catch{}
 };
 const restoreScroll=()=>{if(menu.open){sidebar.scrollTop=state.sidebarScroll;nav.scrollTop=state.navScroll}};
 document.querySelectorAll('.classic-group-toggle').forEach(button=>{
  const items=document.getElementById(button.getAttribute('aria-controls'));
  items.hidden=state.collapsed.includes(items.id);
  const label=button.closest('.classic-nav-group-heading').querySelector('h2').textContent.trim();
  const update=()=>{
   button.setAttribute('aria-expanded',String(!items.hidden));
   button.textContent=items.hidden?'+':'−';
   button.setAttribute('aria-label',(en?(items.hidden?'Expand ':'Collapse '):(items.hidden?'展开':'收起'))+label);
  };
  controllers.push({items,update});
  button.addEventListener('click',()=>{items.hidden=!items.hidden;update();updateAll();save()});update();
  button.closest('.classic-nav-group').querySelectorAll('a').forEach(link=>{
   link.addEventListener('click',()=>{items.hidden=false;update();updateAll();save()});
  });
 });
 updateAll();
 allButton?.addEventListener('click',()=>{
  const collapse=!controllers.every(c=>c.items.hidden);
  controllers.forEach(c=>{c.items.hidden=collapse;c.update()});updateAll();
  sidebar.scrollTop=0;nav.scrollTop=0;state.sidebarScroll=0;state.navScroll=0;save();
 });
 // Capture the position before normal same-tab navigation or mobile menu closure.
 nav.addEventListener('click',save);
 sidebar.addEventListener('scroll',save,{passive:true});nav.addEventListener('scroll',save,{passive:true});
 window.addEventListener('pagehide',save);
 const sync=()=>{
  shell.classList.toggle('classic-menu-collapsed',!media.matches&&!menu.open);
  summary.textContent=menu.open?(en?'Collapse directory':'收起目录'):(en?'Expand directory':'展开目录');
 };
 const resize=()=>{menu.open=!media.matches};resize();media.addEventListener('change',resize);
 menu.addEventListener('toggle',()=>{sync();restoreScroll()});media.addEventListener('change',sync);sync();
 restoreScroll();requestAnimationFrame(restoreScroll);
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;summary.focus()}});
 menu.addEventListener('click',e=>{if(media.matches&&e.target.closest('a'))menu.open=false});
})();
