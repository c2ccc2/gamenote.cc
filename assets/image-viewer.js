/* Native dialog viewer; ordinary image links remain a new-tab fallback. */
(()=>{
 const en=document.documentElement.lang==='en';let dialog,trigger;
 function create(){
  dialog=document.createElement('dialog');dialog.className='image-viewer';dialog.setAttribute('aria-label',en?'Image preview':'图片预览');
  const close=document.createElement('button');close.type='button';close.className='image-viewer-close';close.textContent=en?'Close ×':'关闭 ×';
  const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');figure.append(img,caption);dialog.append(close,figure);document.body.append(dialog);
  close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('image-viewer-open');trigger?.focus()});
 }
 document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href]');if(!anchor||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0||!anchor.querySelector('img'))return;
  const url=new URL(anchor.href,location.href);if(!/\.(webp|png|jpe?g|gif|avif|svg)$/i.test(url.pathname)||typeof HTMLDialogElement==='undefined')return;
  event.preventDefault();if(!dialog)create();trigger=anchor;
  const original=anchor.querySelector('img'),caption=anchor.closest('figure')?.querySelector('figcaption')?.textContent||original.alt;
  dialog.querySelector('img').src=anchor.href;dialog.querySelector('img').alt=original.alt;dialog.querySelector('figcaption').textContent=caption;
  document.documentElement.classList.add('image-viewer-open');dialog.showModal();
 });
})();
