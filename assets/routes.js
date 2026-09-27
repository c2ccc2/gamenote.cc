(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GAMENOTE_ROUTES=api;
})(typeof window==='undefined'?this:window,function(){
  const origin='https://gamenote.cc';
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function noteUrl(slug,en=false){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid note slug');
    return (en?'/en':'')+'/notes/'+slug+'/';
  }
  function breadcrumb(items,theme='modern'){
    return '<nav class="'+(theme==='classic'?'classic-crumb':'site-breadcrumb')+'" aria-label="Breadcrumb">'+items.map((item,index)=>(index?'<span aria-hidden="true"> '+(theme==='classic'?'&gt;':'/')+' </span>':'')+(item.current?'<span aria-current="page">'+escape(item.label)+'</span>':'<a href="'+escape(item.href)+'">'+escape(item.label)+'</a>')).join('')+'</nav>';
  }
  function schema(items){
    return JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.label,item:origin+item.href}))}).replace(/</g,'\\u003c');
  }
  function updateUrl(slug,en=false){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid update slug');
    return (en?'/en':'')+'/updates/'+slug+'/';
  }
  return {noteUrl,updateUrl,breadcrumb,schema,escape};
});
