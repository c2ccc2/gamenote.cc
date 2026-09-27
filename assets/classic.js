/* Native directory disclosure on desktop and mobile. */
(()=>{
 const menu=document.querySelector('.classic-sidebar details');if(!menu)return;
 const media=matchMedia('(max-width:760px)');
 const shell=document.querySelector('.classic-shell'),summary=menu.querySelector('summary');
 const en=document.documentElement.lang==='en';
 document.querySelectorAll('.classic-group-toggle').forEach(button=>{
  const items=document.getElementById(button.getAttribute('aria-controls'));
  const label=button.closest('.classic-nav-group-heading').querySelector('h2').textContent.trim();
  const update=()=>{
   button.setAttribute('aria-expanded',String(!items.hidden));
   button.textContent=items.hidden?'+':'−';
   button.setAttribute('aria-label',(en?(items.hidden?'Expand ':'Collapse '):(items.hidden?'展开':'收起'))+label);
  };
  button.addEventListener('click',()=>{items.hidden=!items.hidden;update()});update();
 });
 const sync=()=>{
  shell.classList.toggle('classic-menu-collapsed',!media.matches&&!menu.open);
  summary.textContent=menu.open?(en?'Collapse directory':'收起目录'):(en?'Expand directory':'展开目录');
 };
 const resize=()=>{menu.open=!media.matches};resize();media.addEventListener('change',resize);
 menu.addEventListener('toggle',sync);media.addEventListener('change',sync);sync();
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;summary.focus()}});
 menu.addEventListener('click',e=>{if(media.matches&&e.target.closest('a'))menu.open=false});
})();
