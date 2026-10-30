import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=[];const html=read('index.html');
const assert=(v,m)=>{if(!v)fail.push(m)};
const canonical=html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
assert(html.includes('<main '),'Missing semantic main');assert(html.includes('<header '),'Missing semantic header');assert(html.includes('<footer '),'Missing semantic footer');
assert(/<html lang="[^"]+"/.test(html),'Missing locale');assert(/^https:\/\//.test(canonical||''),'Missing HTTPS canonical');
assert(html.includes('data-mobile-menu')&&html.includes('data-menu-button'),'Missing accessible mobile controls');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
for(const m of html.matchAll(/href="#([^"]+)"/g)){assert(ids.has(m[1]),'Unknown anchor #'+m[1])}
for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
 const u=m[1];if(!u||u.startsWith('#')||u.startsWith('data:')||u.startsWith('mailto:')||/^(https?:)?\/\//.test(u))continue;
 const p=decodeURIComponent(u.split(/[?#]/)[0]).replace(/^\.\//,'');
 if(p.startsWith('/')){fail.push('Unexpected root-relative path '+p);continue}
 assert(fs.existsSync(path.join(root,p)), 'Missing local path '+p);
}
const sitemap=read('sitemap.xml');assert(!!canonical&&sitemap.includes(canonical),'Canonical missing from sitemap');
assert(!/sales@[^\s"<>]*github\.io/.test(html),'Invalid GitHub Pages email');
if(html.includes('application/ld+json')){
 for(const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  try{const v=JSON.parse(block[1]);if(v.url)assert(v.url===canonical,'JSON-LD URL differs from canonical')}catch(e){fail.push('Invalid JSON-LD: '+e.message)}
 }
}
if(fail.length){console.error('SITE CHECK FAILED\n'+fail.map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('SITE CHECK PASSED: links, landmarks, mobile navigation, metadata, canonical and sitemap');
