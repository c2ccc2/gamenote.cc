/* Static content; mobile directory enhancement only. */
(()=>{
 const menu=document.querySelector('.classic-sidebar details');if(!menu)return;
 const media=matchMedia('(max-width:760px)');
 const resize=()=>{menu.open=!media.matches};resize();media.addEventListener('change',resize);
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&media.matches){menu.open=false;menu.querySelector('summary').focus()}});
 menu.addEventListener('click',e=>{if(media.matches&&e.target.closest('a'))menu.open=false});
})();
