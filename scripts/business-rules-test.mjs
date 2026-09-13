const IST='Asia/Kolkata';
const hours={0:[['18:00','23:00']],1:[['18:00','23:00']],2:[['18:00','23:00']],3:[['10:00','22:00']],4:[['18:00','23:00']],5:[['18:00','23:00']],6:[['18:00','23:00']]};
function parts(d){return Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:IST,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));}
function fits(d,dur){const p=parts(d);const wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday);const m=+p.hour*60 + +p.minute;return hours[wd].some(([a,b])=>{const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);return m>=ah*60+am && m+dur<=bh*60+bm});}
function slot(d){return +parts(d).minute%10===0}
const checks=[['Monday 18:00 / 30m',fits(new Date('2026-09-14T12:30:00Z'),30),true],['Wednesday 21:30 / 30m',fits(new Date('2026-09-16T16:00:00Z'),30),true],['Wednesday 21:40 / 30m',fits(new Date('2026-09-16T16:10:00Z'),30),false]];
for(const [name,got,want] of checks){if(got!==want)throw new Error(`${name}: expected ${want}, got ${got}`)}
if(!slot(new Date('2026-09-14T12:30:00Z')))throw new Error('10-minute slot check failed');
console.log('Business-rule tests passed:',checks.length+1);
