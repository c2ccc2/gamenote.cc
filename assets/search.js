(function(){
 const form=document.querySelector('[data-search-form]');if(!form)return;
 const en=document.documentElement.lang==='en',input=form.querySelector('input'),status=document.querySelector('[data-search-status]'),results=document.querySelector('[data-search-results]'),more=document.querySelector('[data-search-more]');
 const tr=(zh,english)=>en?english:zh;
 let engine,version=0,items=[],offset=0;
 const safeUrl=value=>{const url=new URL(value,location.origin);if(url.origin!==location.origin||!url.pathname.startsWith('/')||/^\/(?:_research|content|scripts)\//.test(url.pathname))throw Error('Invalid result URL');return url.pathname+url.search+url.hash};
 function excerpt(html){const template=document.createElement('template');template.innerHTML=html;const out=document.createDocumentFragment();function append(node,parent){if(node.nodeType===3)parent.append(document.createTextNode(node.textContent));else if(node.nodeType===1){if(node.tagName==='MARK'){const mark=document.createElement('mark');parent.append(mark);node.childNodes.forEach(n=>append(n,mark))}else node.childNodes.forEach(n=>append(n,parent))}}template.content.childNodes.forEach(n=>append(n,out));return out}
 async function render(token){
  const slice=items.slice(offset,offset+15);const entries=await Promise.all(slice.map(item=>item.data()));if(token!==version)return;
  for(const entry of entries){const li=document.createElement('li');li.className='search-result';const h=document.createElement('h2'),a=document.createElement('a');a.href=safeUrl(entry.url);a.textContent=entry.meta.title||entry.url;h.append(a);li.append(h);const meta=document.createElement('div');meta.className='search-result-meta';meta.textContent=[entry.meta.type,entry.meta.game,entry.meta.category].filter(Boolean).join(' · ');li.append(meta);const p=document.createElement('p');p.append(excerpt(entry.excerpt));li.append(p);const path=document.createElement('div');path.className='search-result-path';path.textContent=entry.url;li.append(path);results.append(li)}
  offset+=entries.length;more.hidden=offset>=items.length;
 }
 async function search(updateUrl=true){
  const token=++version,q=input.value.trim();results.replaceChildren();more.hidden=true;items=[];offset=0;
  if(updateUrl){const url=new URL(location.href);q?url.searchParams.set('q',q):url.searchParams.delete('q');history.replaceState(null,'',url)}
  if(!q){status.textContent=tr('输入关键词搜索 GAME NOTE。','Enter a keyword to search GAME NOTE.');return}
  status.textContent=tr('正在搜索…','Searching…');
  try{engine=engine||import('/pagefind/pagefind.js');const pagefind=await engine;const response=await pagefind.search(q);if(token!==version)return;items=response.results;status.textContent=items.length?tr('找到 '+items.length+' 条相关内容。',items.length+' results found.'):tr('没有找到相关内容。','No results found.');await render(token)}
  catch(error){if(token===version){status.textContent=tr('搜索暂时不可用，请稍后重试。','Search is temporarily unavailable. Please try again later.');console.error('Search unavailable',error)}}
 }
 form.addEventListener('submit',event=>{event.preventDefault();search()});
 more.addEventListener('click',async()=>{more.disabled=true;try{await render(version)}finally{more.disabled=false}});
 window.addEventListener('popstate',()=>{input.value=new URLSearchParams(location.search).get('q')||'';search(false)});
 input.value=new URLSearchParams(location.search).get('q')||'';search(false);
})();
