const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),id='GTM-W5W5PT67',skip=new Set(['.git','.github','node_modules','content','scripts','_research','pagefind']);let count=0,classic=0;
function check(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){if(!skip.has(entry.name))check(file)}else if(entry.name.endsWith('.html')){
 const $=cheerio.load(fs.readFileSync(file,'utf8')),script=$('script[data-gamenote-gtm]');
 assert.equal(script.length,1,'One GTM bootstrap: '+file);assert.equal(script.attr('data-gamenote-gtm'),id);
 assert.equal($('script').filter((_,n)=>($(n).text()+' '+($(n).attr('src')||'')).includes(id)).length,1,'No duplicate GTM: '+file);
 assert.equal($('noscript').filter((_,n)=>($(n).html()||'').includes('ns.html?id='+id)).length,1,'One fallback: '+file);
 const injected=[],context={window:{},document:{querySelector:()=>injected.length?injected[0]:null,createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore:node=>injected.push(node)}}]}};
 vm.runInNewContext(script.text(),context);vm.runInNewContext(script.text(),context);
 assert.equal(injected.length,1);assert.equal(injected[0].src,'https://www.googletagmanager.com/gtm.js?id='+id);assert.equal(context.window.dataLayer.length,1,'Single page initialization');
 count++;if($('body').hasClass('classic'))classic++;
}}}
check(root);assert.equal(classic,328);assert.ok(count>=365);console.log(`Verified GTM on ${count} public pages (${classic} Classic): single bootstrap, fallback and duplicate-safe initialization.`);
