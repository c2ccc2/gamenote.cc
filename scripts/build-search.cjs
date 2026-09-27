const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),output=path.join(root,'pagefind');
// This exact directory contains generated search artifacts only. Prevent old fragments from surviving an unpublish.
if(path.dirname(output)!==root||path.basename(output)!=='pagefind')throw Error('Unsafe search output');
if(fs.existsSync(output)){if(fs.lstatSync(output).isSymbolicLink())throw Error('Search output must not be a symlink');fs.rmSync(output,{recursive:true})}
const packageRoot=path.join(root,'node_modules','pagefind'),pkg=JSON.parse(fs.readFileSync(path.join(packageRoot,'package.json'),'utf8'));
const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin.pagefind;
const result=spawnSync(process.execPath,[path.join(packageRoot,bin),'--site','.', '--glob','{index.html,games/**/*.html,notes/**/*.html,updates/**/*.html,about/**/*.html,en/**/*.html}','--force-language','zh-CN'],{cwd:root,stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
if(!fs.existsSync(path.join(output,'pagefind.js')))throw Error('Missing production search bundle');
