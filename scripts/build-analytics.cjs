// One shared GTM container on every public HTML page, independent of its theme.
const fs=require('node:fs'),path=require('node:path'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),container='GTM-W5W5PT67';
const excluded=new Set(['.git','.github','node_modules','content','scripts','_research','pagefind']);
function publicHtml(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(excluded.has(e.name)?[]:publicHtml(path.join(dir,e.name))):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}
const bootstrap=`(function(w,d,s,l,i){if(d.querySelector('script[src*="googletagmanager.com/gtm.js?id='+i+'"]'))return;w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${container}');`;
const files=publicHtml(root);
for(const file of files){
 const $=cheerio.load(fs.readFileSync(file,'utf8'));
 $('script').each((_,node)=>{const s=$(node),value=(s.attr('src')||'')+' '+s.text();if(s.attr('data-gamenote-gtm')||value.includes(container)&&/googletagmanager\.com/.test(value))s.remove()});
 $('noscript').each((_,node)=>{if(($(node).html()||'').includes(container))$(node).remove()});
 $('head').prepend(`<script data-gamenote-gtm="${container}">${bootstrap}</script>`);
 $('body').prepend(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${container}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`);
 fs.writeFileSync(file,$.html()+'\n');
}
console.log(`Unified ${container} on ${files.length} public HTML pages.`);
