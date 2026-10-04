// Regenerate Amanta months from checked Drik Panchang facts. See CONTENT_SOURCES.md.
const fs=require('node:fs'); const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {ALL_LUNAR_DAYS}=require('../src/data/lunarDays.ts');

const names=require('../src/data/masamFullMoonNames.json').slice();
names.push({date:'2036-01-12',name:'Pausha',adhika:false});
function instant(t){const m=t.time.match(/(\d+):(\d+) (AM|PM)/); const h=Number(m[1])%12+(m[3]==='PM'?12:0); return new Date(`${t.date}T${String(h).padStart(2,'0')}:${m[2]}:00+05:30`).getTime();}
const moons=[...new Set(ALL_LUNAR_DAYS.filter(d=>d.kind==='amavasya').map(d=>instant(d.ends)))].sort((a,b)=>a-b);
const before=Date.parse('2024-12-30T22:27:25.420Z');
const after=Date.parse('2036-01-28T10:17:48.418Z');
moons.unshift(before);moons.push(after);
const periods=[];
for(let i=0;i<moons.length-1;i++){
 const start=moons[i],end=moons[i+1]; const full=ALL_LUNAR_DAYS.find(d=>d.kind==='purnima'&&instant(d.ends)>start&&instant(d.ends)<end);
 const midpoint=full?instant(full.ends):(start+end)/2;
 const match=names.map(n=>({...n,diff:Math.abs(new Date(n.date+'T12:00:00Z').getTime()-midpoint)})).sort((a,b)=>a.diff-b.diff)[0];
 if(match.diff>3*86400000) throw Error(`Month name not verified for ${new Date(start).toISOString()}`);
 const matchSame=names.filter(n=>n.name===match.name&&Math.abs(new Date(n.date+'T12:00:00Z').getTime()-midpoint)<3*86400000);
 if(new Set(matchSame.map(n=>n.adhika)).size!==1) throw Error('Conflicting month observations '+JSON.stringify(matchSame));
 periods.push({startAt:new Date(start).toISOString(),endAt:new Date(end).toISOString(),month:match.name,adhika:match.adhika});
}
fs.writeFileSync(path.join(__dirname,'../src/data/masamTransitions.json'),JSON.stringify(periods,null,2)+'\n');
console.log('Verified lunar month intervals:',periods.length);console.log(periods.filter(p=>p.startAt.startsWith('2026')).map(p=>({start:p.startAt,month:p.month,adhika:p.adhika})));
