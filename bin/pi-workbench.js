#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const args = process.argv.slice(2);

const dirs = {
  raw: 'raw', wiki: 'wiki', lattice: 'lattice', work: 'work'
};

function mkdirp(p){ fs.mkdirSync(path.join(cwd,p), {recursive:true}); }
function exists(p){ return fs.existsSync(path.join(cwd,p)); }
function writeNew(p, s){ const f=path.join(cwd,p); if(!fs.existsSync(f)) fs.writeFileSync(f,s); }
function files(dir, exts=['.md']){
  const root=path.join(cwd,dir); if(!fs.existsSync(root)) return [];
  const out=[]; const walk=d=>{ for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(exts.includes(path.extname(e.name))) out.push(p);
  }}; walk(root); return out;
}
function rel(p){ return path.relative(cwd,p).replaceAll(path.sep,'/'); }

function init(){
  ['raw/transcripts','raw/measurements','raw/manuals','raw/sessions','wiki/concepts','wiki/field-notes','wiki/evidence-reviews','lattice','work/inbox','work/active','work/review','work/done','.workbench','scripts'].forEach(mkdirp);
  writeNew('.workbench/config.toml', `[paths]\nraw = "raw"\nwiki = "wiki"\nlattice = "lattice"\nwork = "work"\n\n[checks]\nrequire_wiki_sources = true\nrequire_lattice_leading_paragraphs = true\n\n[commands]\ntest = "cargo test"\n`);
  writeNew('wiki/index.md', '# Wiki Index\n\nFlexible synthesis index for source-derived knowledge and field notes.\n\n');
  writeNew('wiki/log.md', '# Wiki Log\n\nAppend-only log of ingests, queries, reviews, and important updates.\n\n');
  writeNew('wiki/sources.md', '# Sources\n\nCatalogue of raw sources and external links used by the wiki.\n\n');
  writeNew('wiki/open-questions.md', '# Open Questions\n\nQuestions not yet resolved by current evidence.\n\n');
  writeNew('lattice/index.md', '# Lattice Index\n\nCanonical implementation/project knowledge graph for code-affecting truth.\n\n- [[architecture]] — System shape and module boundaries\n- [[domain]] — Project domain concepts that affect implementation\n- [[constraints]] — Hard boundaries, gotchas, and safety rules\n- [[decisions]] — Durable implementation decisions\n- [[tests]] — Executable behaviour specs\n');
  writeNew('lattice/architecture.md', '# Architecture\n\nCurrent implementation architecture and module boundaries.\n\n');
  writeNew('lattice/domain.md', '# Domain\n\nDomain concepts that the implementation depends on.\n\n');
  writeNew('lattice/constraints.md', '# Constraints\n\nHard rules, gotchas, and safety boundaries that implementation must preserve.\n\n');
  writeNew('lattice/decisions.md', '# Decisions\n\nDurable implementation decisions and their rationale.\n\n');
  writeNew('lattice/tests.md', '---\nlattice:\n  require-code-mention: true\n---\n# Tests\n\nExecutable behaviour specifications that should have direct test coverage.\n\n');
  writeNew('scripts/check.sh', '#!/usr/bin/env bash\nset -euo pipefail\npi-workbench check\nif command -v cargo >/dev/null 2>&1 && [ -f Cargo.toml ]; then cargo test; fi\n');
  fs.chmodSync(path.join(cwd,'scripts/check.sh'),0o755);
  console.log('Initialized pi-workbench structure.');
}

function parseHeadings(text){
  const heads=[]; for(const [i,line] of text.split(/\r?\n/).entries()){
    const m=line.match(/^(#{1,6})\s+(.+?)\s*$/); if(m) heads.push({line:i+1, level:m[1].length, title:m[2]});
  } return heads;
}
function sectionIds(file){
  const text=fs.readFileSync(file,'utf8'); const stack=[]; const ids=[];
  for(const h of parseHeadings(text)){ stack.length=h.level-1; stack[h.level-1]=h.title; ids.push(`${rel(file).replace(/\.md$/,'')}#${stack.join('#')}`); }
  return ids;
}
function leadingParagraphErrors(file){
  const text=fs.readFileSync(file,'utf8'); const lines=text.split(/\r?\n/); const errs=[];
  for(let i=0;i<lines.length;i++){
    if(!/^#{1,6}\s+/.test(lines[i])) continue;
    let j=i+1; while(j<lines.length && lines[j].trim()==='') j++;
    if(j>=lines.length || /^#{1,6}\s+/.test(lines[j]) || lines[j].trim().startsWith('```') || lines[j].trim().startsWith('- ')) errs.push(`${rel(file)}:${i+1} missing leading paragraph`);
    else if(lines[j].replace(/\[\[[^\]]+\]\]/g,'').length>250) errs.push(`${rel(file)}:${i+1} leading paragraph >250 chars`);
  }
  return errs;
}
function check(){
  const errors=[]; const warnings=[];
  const md=[...files('wiki'),...files('lattice')];
  const allSections=new Set(); for(const f of md) for(const id of sectionIds(f)) allSections.add(id);
  const stems=new Map(); for(const id of allSections){ const short=id.replace(/^(wiki|lattice)\//,''); stems.set(short,id); }
  for(const f of files('lattice')) errors.push(...leadingParagraphErrors(f));
  for(const f of md){
    const text=fs.readFileSync(f,'utf8');
    for(const m of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)){
      const target=m[1].trim();
      if(target.startsWith('http') || target.startsWith('../') || target.startsWith('./')) continue;
      const norm=target.replace(/\.md#/,'#').replace(/\.md$/,'');
      if(!allSections.has(norm) && !stems.has(norm) && !fs.existsSync(path.join(cwd,target))) warnings.push(`${rel(f)} unresolved wiki link [[${target}]]`);
    }
    if(rel(f).startsWith('wiki/') && !['wiki/index.md','wiki/log.md','wiki/open-questions.md','wiki/sources.md'].includes(rel(f))) {
      if(/source-derived:\s*true/i.test(text) && !/^## Sources\s*$/mi.test(text)) errors.push(`${rel(f)} source-derived page missing ## Sources`);
    }
  }
  const code=files('.', ['.rs','.ts','.js','.py','.go','.c','.h']).filter(f=>!rel(f).startsWith('node_modules/')&&!rel(f).startsWith('.git/'));
  for(const f of code){
    const text=fs.readFileSync(f,'utf8');
    for(const m of text.matchAll(/@lattice:\s*\[\[([^\]]+)\]\]/g)){
      const t=m[1].trim(); const norm=t.replace(/\.md#/,'#').replace(/\.md$/,'');
      if(!allSections.has(norm) && !stems.has(norm)) errors.push(`${rel(f)} dangling @lattice [[${t}]]`);
    }
  }
  for(const e of errors) console.error('ERROR', e);
  for(const w of warnings) console.warn('WARN ', w);
  if(errors.length){ console.error(`pi-workbench check failed: ${errors.length} error(s), ${warnings.length} warning(s)`); process.exit(1); }
  console.log(`pi-workbench check passed: ${warnings.length} warning(s)`);
}
function status(){
  for(const d of ['inbox','active','review','done']) console.log(`${d}: ${files(`work/${d}`).length}`);
}
function taskNext(){
  const fs1=files('work/inbox'); if(!fs1.length){ console.log('No inbox tasks.'); return; }
  console.log(rel(fs1[0]));
}
function taskDone(p){
  if(!p) throw new Error('task done requires a task path');
  const src=path.join(cwd,p); const dst=path.join(cwd,'work/done',path.basename(p));
  fs.renameSync(src,dst); console.log(rel(dst));
}
function sessionImport(p){
  if(!p) throw new Error('session import requires jsonl path');
  mkdirp('raw/sessions'); const dst=path.join(cwd,'raw/sessions',path.basename(p)); fs.copyFileSync(p,dst);
  const lines=fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean); const users=[];
  for(const line of lines){ try{ const o=JSON.parse(line); const m=o.message; if(m?.role==='user') users.push(m.content?.filter(c=>c.type==='text').map(c=>c.text).join('\n')); }catch{} }
  fs.appendFileSync(path.join(cwd,'wiki/log.md'), `\n## [${new Date().toISOString().slice(0,10)}] session-import | ${path.basename(p)}\n\nImported to \`${rel(dst)}\`.\n\nUser prompts:\n${users.slice(0,12).map(u=>`- ${String(u).replace(/\n/g,' ').slice(0,240)}`).join('\n')}\n`);
  console.log(`Imported ${p} -> ${rel(dst)}`);
}

try{
  const [cmd, sub, third] = args;
  if(!cmd || cmd==='help' || cmd==='--help') console.log('Usage: pi-workbench init|check|status|task next|task done <path>|session import <jsonl>');
  else if(cmd==='init') init();
  else if(cmd==='check') check();
  else if(cmd==='status') status();
  else if(cmd==='task' && sub==='next') taskNext();
  else if(cmd==='task' && sub==='done') taskDone(third);
  else if(cmd==='session' && sub==='import') sessionImport(third);
  else throw new Error(`unknown command: ${args.join(' ')}`);
}catch(e){ console.error(`pi-workbench: ${e.message}`); process.exit(2); }
