export const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'] as const;
export type Category = typeof categories[number];
export type Transaction = { id: string; name: string; amount: number; category: Category; type: 'income'|'expense'; date: string; vehicleId?: string };
export type Goal = { id: string; name: string; target: number; saved: number; icon: number };
export type Vehicle = { id: string; name: string; mileage: number; plate: string };
export type Event = { id: string; name: string; date: string; amount: number; paid: boolean; category: Category; vehicleId?: string };
export type GameState = { version: number; demo: boolean; name: string; transactions: Transaction[]; budgets: Record<Category,number>; goals: Goal[]; tasks: Record<string,string[]>; rewards: string[]; xp: number; events: Event[]; vehicles: Vehicle[] };
export type Command = { type: string; [key: string]: unknown };
export const taskNames = ['Review expenses', 'Check upcoming bills', 'Call garage supplier', 'Plan weekend'];
export const today = () => new Date().toISOString().slice(0,10);
export const money = (cents: number) => '€ ' + (cents/100).toLocaleString('en-IE', {minimumFractionDigits:2,maximumFractionDigits:2});
export function totals(s: GameState, month?: string) { const ts=s.transactions.filter(t=>!month||t.date.startsWith(month));const income=ts.filter(t=>t.type==='income').reduce((n,t)=>n+t.amount,0);const expenses=ts.filter(t=>t.type==='expense').reduce((n,t)=>n+t.amount,0);return {income,expenses,wallet:income-expenses,saved:s.goals.reduce((n,g)=>n+g.saved,0)}; }
export function spent(s:GameState,c:Category,month:string) {return s.transactions.filter(t=>t.type==='expense'&&t.category===c&&t.date.startsWith(month)).reduce((n,t)=>n+t.amount,0);}
export function seedState(demo=true):GameState {
 const date=today(),month=date.slice(0,7); const d=(day:number)=>`${month}-${String(Math.max(1,Math.min(Number(date.slice(8)),day))).padStart(2,'0')}`;
 const s:GameState={version:0,demo,name:'Adventurer',transactions:[],budgets:{Food:50000,Transport:35000,Bills:35000,Shopping:20000,Other:20000},goals:[],tasks:{},rewards:[],xp:0,events:[],vehicles:[]};
 if(!demo)return s;
 const row=(name:string,amount:number,category:Category,type:'income'|'expense',day:number):Transaction=>({id:`demo-${name}`,name,amount,category,type,date:d(day)});
 s.transactions=[row('Coffee',450,'Food','expense',9),row('Groceries (Colruyt)',6230,'Food','expense',8),row('Paycheck',120000,'Other','income',1),row('Gym Membership',3500,'Other','expense',1),row('Spotify',999,'Other','expense',1),row('Earlier groceries',30140,'Food','expense',1),row('Fuel & transport',27650,'Transport','expense',1),row('Household bills',20710,'Bills','expense',1),row('Shopping',16130,'Shopping','expense',1),row('Other expenses',9191,'Other','expense',1),row('Freelance project',120000,'Other','income',1)];
 s.goals=[{id:'laptop',name:'New Laptop',target:100000,saved:40000,icon:2},{id:'car',name:'BMW 7 Series',target:100000,saved:27000,icon:4},{id:'emergency',name:'Emergency Fund',target:80000,saved:49600,icon:1},{id:'home',name:'Move Out',target:46667,saved:8400,icon:0}];
 s.vehicles=[{id:'fiesta',name:'Ford Fiesta ST',mileage:86420,plate:'1-NXS-042'}];
 const upcoming=(offset:number)=>{const v=new Date(date+'T12:00:00Z');v.setUTCDate(v.getUTCDate()+offset);return v.toISOString().slice(0,10);};
 s.events=[{id:'insurance',name:'Insurance payment',date:upcoming(1),amount:6420,paid:false,category:'Transport',vehicleId:'fiesta'},{id:'meet',name:'Car meet (Nürburgring)',date:upcoming(3),amount:0,paid:false,category:'Other'},{id:'phone',name:'Phone subscription',date:upcoming(6),amount:2499,paid:false,category:'Bills'},{id:'oil',name:'Oil change (Fiesta ST)',date:upcoming(11),amount:0,paid:false,category:'Transport',vehicleId:'fiesta'},{id:'rent',name:'Rent',date:upcoming(24),amount:45000,paid:false,category:'Bills'}];
 return s;
}
function text(v:unknown,label:string,max=80):string {if(typeof v!=='string'||!v.trim()||v.trim().length>max)throw new Error(`${label} must be 1–${max} characters.`);return v.trim();}
function number(v:unknown,label:string,min=1,max=100000000):number {if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min||v>max)throw new Error(`${label} must be a valid amount within range.`);return v;}
function date(v:unknown):string {const s=text(v,'Date',10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw new Error('Enter a valid date.');return s;}
function category(v:unknown):Category {if(!categories.includes(v as Category))throw new Error('Choose a valid category.');return v as Category;}
export function applyCommand(current:GameState,cmd:Command):GameState {
 const s=structuredClone(current); const reward=(key:string,xp:number)=>{if(!s.rewards.includes(key)){s.rewards.push(key);s.xp+=xp;}};
 if(cmd.type==='transaction') {
  if(s.transactions.length>=10000&&!cmd.id)throw new Error('Your ledger is full. Export it before starting a new adventure.');
  const name=text(cmd.name,'Description'), amount=number(cmd.amount,'Amount'), c=category(cmd.category), when=date(cmd.date);
  if(when>today())throw new Error('Use Upcoming for future expenses.');
  if(cmd.kind!=='income'&&cmd.kind!=='expense')throw new Error('Choose income or expense.');
  const old=cmd.id?s.transactions.find(t=>t.id===cmd.id):null;if(cmd.id&&!old)throw new Error('Transaction no longer exists.');
  if(cmd.vehicleId&&!s.vehicles.some(v=>v.id===cmd.vehicleId))throw new Error('Vehicle no longer exists.');
  const t:Transaction={id:old?.id??crypto.randomUUID(),name,amount,category:c,date:when,type:cmd.kind, ...(cmd.vehicleId?{vehicleId:String(cmd.vehicleId)}:{})};
  if(old)s.transactions=s.transactions.map(v=>v.id===old.id?t:v);else{s.transactions.unshift(t);reward(`log:${today()}`,10);}
 } else if(cmd.type==='deleteTransaction') {if(!s.transactions.some(t=>t.id===cmd.id))throw new Error('Transaction no longer exists.');s.transactions=s.transactions.filter(t=>t.id!==cmd.id);}
 else if(cmd.type==='budgets') {const b=cmd.budgets as Record<string,unknown>;if(!b)throw new Error('Enter your budget limits.');for(const c of categories)s.budgets[c]=number(b[c],c,0);reward('first-budget',20);}
 else if(cmd.type==='goal') {if(s.goals.length>=50)throw new Error('You can have up to 50 goals.');s.goals.push({id:crypto.randomUUID(),name:text(cmd.name,'Goal'),target:number(cmd.target,'Target'),saved:0,icon:number(cmd.icon??3,'Icon',0,9)});reward('first-goal',20);}
 else if(cmd.type==='contribute') {const g=s.goals.find(g=>g.id===cmd.id);if(!g)throw new Error('Goal no longer exists.');const amount=number(cmd.amount,'Contribution');const balance=totals(s);if(amount>balance.wallet-balance.saved)throw new Error('You need more unallocated money in your wallet.');if(g.saved+amount>g.target)throw new Error('That is more than this goal needs.');g.saved+=amount;reward(`save:${today()}`,20);if(g.saved===g.target)reward(`goal:${g.id}`,100);}
 else if(cmd.type==='withdraw') {const g=s.goals.find(g=>g.id===cmd.id);if(!g)throw new Error('Goal no longer exists.');const amount=number(cmd.amount,'Withdrawal');if(amount>g.saved)throw new Error('That exceeds the amount saved.');g.saved-=amount;}
 else if(cmd.type==='task') {const task=text(cmd.task,'Task');if(!taskNames.includes(task)||typeof cmd.checked!=='boolean')throw new Error('Invalid quest.');const day=today();const done=s.tasks[day]??[];s.tasks[day]=cmd.checked?[...new Set([...done,task])]:done.filter(t=>t!==task);if(cmd.checked)reward(`task:${day}:${task}`,25);}
 else if(cmd.type==='profile') {s.name=text(cmd.name,'Name',30);}
 else if(cmd.type==='vehicle') {if(s.vehicles.length>=20)throw new Error('Your garage is full.');s.vehicles.push({id:crypto.randomUUID(),name:text(cmd.name,'Vehicle'),plate:text(cmd.plate,'Registration',20),mileage:number(cmd.mileage,'Mileage',0,2000000)});}
 else if(cmd.type==='mileage') {const v=s.vehicles.find(v=>v.id===cmd.id);if(!v)throw new Error('Vehicle no longer exists.');v.mileage=number(cmd.mileage,'Mileage',0,2000000);}
 else if(cmd.type==='event') {if(s.events.length>=200)throw new Error('Your calendar is full.');const when=date(cmd.date);if(when<today())throw new Error('Choose today or a future date.');if(cmd.vehicleId&&!s.vehicles.some(v=>v.id===cmd.vehicleId))throw new Error('Vehicle no longer exists.');s.events.push({id:crypto.randomUUID(),name:text(cmd.name,'Event'),date:when,amount:number(cmd.amount,'Amount',0),category:category(cmd.category),paid:false,...(cmd.vehicleId?{vehicleId:String(cmd.vehicleId)}:{})});}
 else if(cmd.type==='deleteEvent') {
  const e=s.events.find(e=>e.id===cmd.id);

  if(!e)
    throw new Error('Event no longer exists.');

  if(e.paid)
    throw new Error('Completed events cannot be removed here.');

  s.events=s.events.filter(v=>v.id!==cmd.id);}
 else if(cmd.type==='payEvent') {const e=s.events.find(e=>e.id===cmd.id);if(!e)throw new Error('Event no longer exists.');if(e.paid)throw new Error('Already completed.');e.paid=true;if(e.amount>0)s.transactions.unshift({id:crypto.randomUUID(),name:e.name,amount:e.amount,category:e.category,type:'expense',date:today(),...(e.vehicleId?{vehicleId:e.vehicleId}:{})});reward(`event:${e.id}`,15);}
 else if(cmd.type==='fresh') {if(cmd.confirm!=='START FRESH')throw new Error('Type START FRESH to confirm.');return {...seedState(false),name:s.name,version:s.version+1};}
 else throw new Error('Unknown action.');
 s.version++; return s;
}
