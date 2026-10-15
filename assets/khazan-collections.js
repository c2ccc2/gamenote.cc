(() => {
  const form=document.querySelector('[data-collection-filter]');
  const results=document.querySelector('[data-collection-results]');
  if(!form||!results)return;
  const search=form.querySelector('[data-collection-search]');
  const kind=form.querySelector('[data-collection-kind]');
  const status=document.querySelector('[data-collection-status]');
  const groups=[...results.querySelectorAll('[data-collection-group]')];
  const params=new URLSearchParams(location.search);
  search.value=params.get('q')||'';
  if(['main','side'].includes(params.get('kind')))kind.value=params.get('kind');
  function filter(){
    const query=search.value.trim().toLocaleLowerCase();
    let count=0;
    for(const group of groups){
      let visible=0;
      for(const row of group.querySelectorAll('[data-collection-item]')){
        const matchKind=kind.value==='all'||row.dataset.kind===kind.value;
        const text=(group.dataset.taskName+' '+row.dataset.search).toLocaleLowerCase();
        row.hidden=!matchKind||!text.includes(query);
        if(!row.hidden){visible++;count++;}
      }
      group.hidden=visible===0;
    }
    status.textContent=results.dataset.locale==='en'?`${count} locations found`:`找到 ${count} 个位置`;
  }
  form.addEventListener('submit',event=>event.preventDefault());
  search.addEventListener('input',filter);
  kind.addEventListener('change',filter);
  form.addEventListener('reset',()=>requestAnimationFrame(filter));
  filter();
})();
