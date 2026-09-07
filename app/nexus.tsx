'use client';
import { useState,useEffect,useRef,type FormEvent } from 'react';
import { SidebarProvider,Sidebar,SidebarContent,SidebarMenu,SidebarMenuItem,SidebarMenuButton } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from '@/components/ui/select';
import { Table,TableHeader,TableRow,TableHead,TableBody,TableCell } from '@/components/ui/table';
import { Bar,Panel,Sprite,Icon,GoalIcon,nav } from './pixel';
import { categories,taskNames,seedState,today,money,totals,spent,type GameState,type Command,type Transaction,type Category } from '@/lib/game';

type FormSpec={type:string;title:string;data?:Record<string,unknown>};
const colors=['green','blue','gold','red','purple'];
const shortDate=(v:string)=>v.slice(8,10)+'/'+v.slice(5,7);
const pct=(a:number,b:number)=>b?Math.round(a/b*100):0;
function Choice({name,label,options,value}:{name:string;label:string;options:string[];value?:string}){return <label className="form-field">{label}<Select name={name} defaultValue={value??options[0]}><SelectTrigger className="game-input"><SelectValue/></SelectTrigger><SelectContent className="game-select">{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></label>;}
function Field({name,label,value='',type='text',min,step,maxLength=80}:{name:string;label:string;value?:string|number;type?:string;min?:string;step?:string;maxLength?:number}){return <label className="form-field">{label}<Input className="game-input" name={name} type={type} defaultValue={value} required min={min} step={step} maxLength={maxLength}/></label>;}
function ActionForm({spec,state,submit,busy,error}:{spec:FormSpec;state:GameState;submit:(c:Command)=>Promise<unknown>;busy:boolean;error:string}){
 const d=spec.data??{},type=spec.type;
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget),v=(n:string)=>String(f.get(n)??''),cents=(n:string)=>Math.round(Number(v(n))*100);const c:Command={...d,type};
  if(type==='transaction'){
  const timing=v('timing');

  if(d.vehicleId && timing==='Upcoming'){
    Object.assign(c,{
      type:'event',
      name:v('name'),
      amount:cents('amount'),
      date:v('date'),
      category:v('category'),
      vehicleId:d.vehicleId
    });
  } else {
    Object.assign(c,{
      name:v('name'),
      amount:cents('amount'),
      kind:d.vehicleId ? 'expense' : v('kind'),
      category:v('category'),
      date:v('date'),
      ...(d.vehicleId ? { vehicleId:d.vehicleId } : {})
    });
  }
}
  if(type==='goal')Object.assign(c,{name:v('name'),target:cents('target'),icon:3});
  if(type==='contribute'||type==='withdraw')c.amount=cents('amount');
  if(type==='budgets')c.budgets=Object.fromEntries(categories.map(k=>[k,cents(k)]));
  if(type==='profile')c.name=v('name');
  if(type==='vehicle')Object.assign(c,{name:v('name'),plate:v('plate'),mileage:Number(v('mileage'))});
  if(type==='mileage')c.mileage=Number(v('mileage'));
  if(type==='event')Object.assign(c,{name:v('name'),date:v('date'),amount:cents('amount'),category:v('category')});
  if(type==='fresh')c.confirm=v('confirm');
  await submit(c);
 }
 return <form onSubmit={save} className="game-form">
  {type==='transaction'&&<>
  {d.vehicleId ? (
    <Choice
      name="timing"
      label="Status"
      options={['Paid / Logged Now', 'Upcoming']}
      value="Paid / Logged Now"
    />
  ) : (
    <Choice
      name="kind"
      label="Type"
      options={['expense','income']}
      value={String(d.kind??'expense')}
    />
  )}

  <Field
    name="name"
    label="Description"
    value={String(d.name??'')}
  />

  <div className="form-columns">
    <Field
      name="amount"
      label="Amount (€)"
      type="number"
      min="0.01"
      step="0.01"
      value={d.amount ? Number(d.amount)/100 : ''}
    />

    <Field
      name="date"
      label={d.vehicleId ? "Paid / due date" : "Date"}
      type="date"
      value={String(d.date??today())}
    />
  </div>

  <Choice
    name="category"
    label="Category"
    options={[...categories]}
    value={String(d.category??'Transport')}
  />
</>}
  {type==='goal'&&<><Field name="name" label="What are you saving for?"/><Field name="target" label="Target (€)" type="number" min="0.01" step="0.01"/></>}
  {(type==='contribute'||type==='withdraw')&&<><p>{type==='contribute'?`Available to allocate: ${money(Math.max(0,totals(state).wallet-totals(state).saved))}`:'Move savings back into your available wallet.'}</p><Field name="amount" label="Amount (€)" type="number" min="0.01" step="0.01"/></>}
  {type==='budgets'&&<><p>Monthly spending limits. Set 0 to leave a category without a budget.</p>{categories.map(c=><Field key={c} name={c} label={`${c} (€)`} type="number" min="0" step="0.01" value={state.budgets[c]/100}/>)}</>}
  {type==='profile'&&<Field name="name" label="Adventurer name" value={state.name} maxLength={30}/>}
  {type==='vehicle'&&<><Field name="name" label="Vehicle"/><Field name="plate" label="Registration" maxLength={20}/><Field name="mileage" label="Odometer (km)" type="number" min="0" step="1" value="0"/></>}
  {type==='mileage'&&<Field name="mileage" label="Odometer (km)" type="number" min="0" step="1" value={Number(d.mileage??0)}/>}
  {type==='event'&&<><Field name="name" label="Bill, service, or event"/><Field name="date" label="Due date" type="date" value={today()}/><Field name="amount" label="Expected cost (€); 0 for an event" type="number" min="0" step="0.01" value="0"/><Choice name="category" label="Category" options={[...categories]} value={String(d.category??'Bills')}/></>}
  {type==='fresh'&&<><p>This clears all transactions, savings, vehicles, events, and XP in this save. Your adventure will start at zero.</p><Field name="confirm" label="Type START FRESH to confirm"/></>}
  {type==='deleteTransaction'&&<p>Delete “{String(d.name)}” from your ledger? Your totals will be recalculated.</p>}
  {type==='payEvent'&&<p>{Number(d.amount)>0?`Record ${money(Number(d.amount))} as an expense and complete this bill?`:'Mark this event complete and earn 15 XP?'}</p>}
  {type==='deleteEvent'&&
  <p>
    Remove “{String(d.name)}” from your upcoming items?
    This will not create an expense.
  </p>
}
  {error&&<p className="form-error" role="alert">{error}</p>}
  <button className="pixel-button primary-action" disabled={busy} type="submit">{busy?'SAVING…':type==='fresh'?'START MY ADVENTURE':type==='deleteTransaction'
  ? 'DELETE TRANSACTION'
  : type==='deleteEvent'
  ? 'REMOVE UPCOMING'
  : type==='payEvent'
  ? 'COMPLETE':type==='contribute'?'ADD TO SAVINGS':'SAVE & CONTINUE'}</button>
 </form>;
}

export default function Nexus(){
 const [state,setState]=useState<GameState>(()=>seedState());const [active,setActive]=useState('Home');
 const [message,setMessage]=useState('Ready to take control today?');const [form,setForm]=useState<FormSpec|null>(null);
 const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [loadError,setLoadError]=useState('');const [needsLogin,setNeedsLogin]=useState(false);
 const [month,setMonth]=useState(today().slice(0,7));const [filter,setFilter]=useState('');const [page,setPage]=useState(0);const [sound,setSound]=useState(false);const [help,setHelp]=useState(false);
 const [clock,setClock]=useState('');const stateRef=useRef(state);const busyRef=useRef(false);const audioRef=useRef<AudioContext|null>(null);
 const balance=totals(state),monthly=totals(state,month),day=today(),done=state.tasks[day]??[];const level=Math.floor(state.xp/100)+1;
 const sorted=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date));const recent=sorted.slice(page*5,page*5+5);const pages=Math.max(1,Math.ceil(sorted.length/5));
 const upcoming=state.events.filter(e=>!e.paid).sort((a,b)=>a.date.localeCompare(b.date));
 function chime(){if(!sound)return;try{const a=audioRef.current??new AudioContext();audioRef.current=a;void a.resume();[523.25,659.25,783.99].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=f;g.gain.value=.025;o.connect(g);g.connect(a.destination);o.start(a.currentTime+i*.09);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+i*.09+.13);o.stop(a.currentTime+i*.09+.15);});}catch{/* Sound is optional. */}}
 async function load(){setLoadError('');setReady(false);try{const r=await fetch('/api/game');if(r.status===401){setNeedsLogin(true);throw new Error('Sign in to load and save your adventure.');}if(!r.ok)throw new Error('Your save could not be loaded. Retry to continue.');const s=await r.json() as GameState;stateRef.current=s;setState(s);setReady(true);setNeedsLogin(false);}catch(e){setLoadError(e instanceof Error?e.message:'Could not load your save.');}}
 useEffect(()=>{void load();const tick=()=>setClock(new Date().toLocaleString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(',','').toUpperCase());tick();const t=setInterval(tick,30000);try{setSound(localStorage.getItem('nexus-sound')==='on');}catch{}return()=>{clearInterval(t);void audioRef.current?.close();};},[]);
 async function act(command:Command){if(busyRef.current)throw new Error('A save is already in progress.');if(!ready){setError('Load your save before making changes.');return null;}busyRef.current=true;setBusy(true);setError('');try{const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:stateRef.current.version,command})});const next=await r.json() as GameState & {error?:string};if(!r.ok){if(r.status===409){setReady(false);setLoadError(next.error??'Save conflict. Reload to continue.');}throw new Error(next.error??'Could not save.');}const gain=next.xp-stateRef.current.xp;stateRef.current=next;setState(next);setForm(null);setPage(0);if(gain>0){chime();setMessage(`Quest progress! +${gain} XP. ${Math.floor(next.xp/100)>Math.floor((next.xp-gain)/100)?'Level up! A new chapter begins.':'Every small step counts.'}`);}else setMessage(command.type==='fresh'?'A fresh start. Your adventure begins now!':'All saved. Your future self says thanks!');return {saved:true,xp:next.xp,version:next.version};}catch(e){const msg=e instanceof Error?e.message:'Could not save.';setError(msg);setMessage(msg);return null;}finally{busyRef.current=false;setBusy(false);}}
 const actRef=useRef(act);actRef.current=act;
 useEffect(()=>{if(!ready)return;const context=(document as Document&{modelContext?:{registerTool:(t:unknown,o:unknown)=>unknown}}).modelContext;if(!context)return;const lifecycle=new AbortController();const tools=[{name:'read_budget',description:'Read the current wallet, saved goals, budgets, and XP.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({ ...totals(stateRef.current),budgets:stateRef.current.budgets,goals:stateRef.current.goals,xp:stateRef.current.xp,currency:'EUR',amountUnit:'cents' })},{name:'add_transaction',description:'Save an income or expense transaction in the current adventure. Amount is integer euro cents.',inputSchema:{type:'object',properties:{name:{type:'string'},amount:{type:'integer',minimum:1},kind:{type:'string',enum:['income','expense']},category:{type:'string',enum:[...categories]},date:{type:'string',format:'date'}},required:['name','amount','kind','category','date'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{if(!input||typeof input!=='object')throw new Error('Expected transaction input.');const result=await actRef.current({...input,type:'transaction'});if(!result)throw new Error('Transaction was not saved. Check the visible error.');return result;}}];for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}return()=>lifecycle.abort();},[ready]);
 function open(type:string,title:string,data?:Record<string,unknown>){setError('');setForm({type,title,data});}
 function navigate(name:string){setActive(name);setFilter('');setError('');}
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('input,textarea,[role=combobox]')||e.metaKey||e.ctrlKey||e.altKey)return;if(e.key==='Escape'){setForm(null);setHelp(false);setActive('Home');}if(e.key.toLowerCase()==='n'&&!form&&!help){e.preventDefault();open('transaction','ADD TRANSACTION');}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[form,help]);
 function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nexus-save-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Your save has been exported.');}
 function transactions(list:Transaction[]){return list.length?<Table className="ledger"><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{list.map(t=><TableRow key={t.id}><TableCell>{shortDate(t.date)}</TableCell><TableCell><button className="text-button" onClick={()=>open('transaction','EDIT TRANSACTION',{...t,kind:t.type})}>{t.name}</button><small>{t.category}</small></TableCell><TableCell className={t.type==='income'?'positive':'negative'}>{t.type==='income'?'+':'−'} {money(t.amount)}</TableCell><TableCell><button aria-label={`Delete ${t.name}`} className="delete-button" onClick={()=>open('deleteTransaction','DELETE TRANSACTION',{id:t.id,name:t.name})}>×</button></TableCell></TableRow>)}</TableBody></Table>:<p className="empty-state">Your ledger is empty. Add your first transaction to begin.</p>;}
 function quests(){return <div className="tasks">{taskNames.map(n=><label key={n}><Checkbox aria-label={n} disabled={!ready||busy} checked={done.includes(n)} onCheckedChange={checked=>void act({type:'task',task:n,checked})}/><span>{n}</span></label>)}</div>;}
 function eventList(events=upcoming) {
  return (
    <div className="event-list">
      {events.length ? (
        events.map(e=>(
          <div className="event-row" key={e.id}>
            <button
              className="event-card"
              onClick={()=>open(
                'payEvent',
                e.name.toUpperCase(),
                {
                  id:e.id,
                  amount:e.amount
                }
              )}
            >
              <Sprite
                x={1087}
                y={791}
                w={23}
                h={26}
                scale={.8}
              />

              <span>
                <small>
                  {shortDate(e.date)}
                  {e.date<day ? ' · OVERDUE' : ''}
                </small>

                {e.name}
              </span>

              <strong className="negative">
                {e.amount ? money(e.amount) : 'EVENT'}
              </strong>

              <span>›</span>
            </button>

            <button
              type="button"
              className="event-delete"
              aria-label={`Remove ${e.name}`}
              title="Remove upcoming item"
              onClick={()=>open(
                'deleteEvent',
                'REMOVE UPCOMING',
                {
                  id:e.id,
                  name:e.name
                }
              )}
            >
              ×
            </button>
          </div>
        ))
      ) : (
        <p className="empty-state">
          All caught up.<br/>
          Your calendar is clear.
        </p>
      )}
    </div>
  );
}
function workspace(){switch(active){
  case 'Finances':return <><div className="view-toolbar"><Input aria-label="Search transactions" className="game-input" placeholder="Find a transaction…" value={filter} onChange={e=>setFilter(e.target.value)}/><button className="pixel-button" onClick={()=>open('transaction','ADD TRANSACTION')}>+ ADD</button></div>{transactions(sorted.filter(t=>t.name.toLowerCase().includes(filter.toLowerCase())))}</>;
  case 'Budgets':return <><p className="view-intro">Give every category a limit. Keep your adventure on track.</p><label className="month-picker">MONTH <Input aria-label="Budget month" type="month" value={month} onChange={e=>setMonth(e.target.value||today().slice(0,7))}/></label><div className="budget-list">{categories.map((c,i)=>{const amount=spent(state,c,month),limit=state.budgets[c];return <div className="budget-card" key={c}><div><span>{c}</span><span className={limit&&amount>limit?'negative':''}>{money(amount)} / {limit?money(limit):'NO LIMIT'}</span></div><Bar value={pct(amount,limit)} color={limit&&amount>limit?'red':colors[i]} label={`${c} budget`}/><small>{limit?(amount>limit?`${money(amount-limit)} over budget`:`${money(limit-amount)} remaining`):'Set a limit to track this category.'}</small></div>;})}</div><button className="pixel-button" onClick={()=>open('budgets','SET MONTHLY BUDGETS')}>EDIT BUDGET LIMITS</button></>;
  case 'Goals':return <><p className="view-intro">Available to save: <strong>{money(Math.max(0,balance.wallet-balance.saved))}</strong></p>{balance.saved>balance.wallet&&<p className="form-error">Your goals exceed your wallet by {money(balance.saved-balance.wallet)}. Release savings or add income to cover the difference.</p>}<div className="goal-cards">{state.goals.map(g=><div className="goal-card" key={g.id}><GoalIcon index={g.icon}/><div><h3>{g.name}</h3><p>{money(g.saved)} / {money(g.target)}</p><Bar value={pct(g.saved,g.target)} label={g.name}/><small>{pct(g.saved,g.target)}% COMPLETE{g.saved>=g.target?' · GOAL REACHED!':''}</small><div className="inline-actions"><button disabled={g.saved>=g.target} onClick={()=>open('contribute',`SAVE FOR ${g.name.toUpperCase()}`,{id:g.id})}>+ SAVE</button><button disabled={g.saved===0} onClick={()=>open('withdraw','RELEASE SAVINGS',{id:g.id})}>RELEASE</button></div></div></div>)}</div>{!state.goals.length&&<p className="empty-state">Every adventure needs a destination. Set your first savings goal.</p>}<button className="pixel-button" onClick={()=>open('goal','ADD SAVINGS GOAL')}>+ ADD GOAL</button></>;
  case 'Vehicles':return <><p className="view-intro">Your rides, mileage, and running costs.</p>{state.vehicles.map(v=><div className="vehicle-card" key={v.id}><Sprite x={511} y={64} w={81} h={55} scale={1.5}/><div><h3>{v.name}</h3><p>{v.plate} · {v.mileage.toLocaleString()} km</p><p>Logged costs: {money(state.transactions.filter(t=>t.vehicleId===v.id&&t.type==='expense').reduce((a,t)=>a+t.amount,0))}</p><div className="inline-actions"><button onClick={()=>open('mileage','UPDATE MILEAGE',{id:v.id,mileage:v.mileage})}>ODOMETER</button><button onClick={()=>open('transaction','LOG VEHICLE COST',{vehicleId:v.id,category:'Transport'})}>+ COST</button></div></div></div>)}{!state.vehicles.length&&<p className="empty-state">Your garage is waiting for its first ride.</p>}<button className="pixel-button" onClick={()=>open('vehicle','ADD VEHICLE')}>+ ADD VEHICLE</button></>;
  case 'Garage':return <><p className="view-intro">Stay ahead of maintenance. Complete a service to log its cost.</p>{eventList(upcoming.filter(e=>!!e.vehicleId))}<div className="garage-actions">{state.vehicles.map(v=><button key={v.id} className="pixel-button" onClick={()=>open('event',`SCHEDULE SERVICE`,{vehicleId:v.id,category:'Transport'})}>+ SERVICE · {v.name}</button>)}</div>{!state.vehicles.length&&<button className="pixel-button" onClick={()=>navigate('Vehicles')}>ADD YOUR FIRST VEHICLE</button>}</>;
  case 'Work':return <><div className="stat-card"><small>TOTAL INCOME</small><strong className="positive">{money(balance.income)}</strong></div><button className="pixel-button" onClick={()=>open('transaction','LOG INCOME',{kind:'income',category:'Other'})}>+ LOG PAYCHECK OR INCOME</button>{transactions(sorted.filter(t=>t.type==='income'))}</>;
  case 'Lifestyle':return <><div className="quest-profile"><Icon index={7} scale={1.1}/><div><h3>LEVEL {level} · {state.name}</h3><Bar value={state.xp%100} color="gold" label="Experience to next level"/><p>{state.xp%100} / 100 XP TO LEVEL {level+1}</p></div></div><h3 className="subheading">DAILY QUESTS · {done.length}/4</h3>{quests()}<p className="view-intro">+25 XP per daily quest · +10 XP for your first daily transaction · +20 XP for your first daily savings contribution.</p><button className="pixel-button" onClick={()=>open('transaction','LOG LIFESTYLE EXPENSE',{category:'Other'})}>+ LOG LIFESTYLE EXPENSE</button><h3 className="subheading">UPCOMING</h3>{eventList()}<button className="pixel-button" onClick={()=>open('event','ADD BILL OR EVENT')}>+ ADD EVENT</button></>;
  case 'Analytics':return <><label className="month-picker">REPORT MONTH <Input aria-label="Report month" type="month" value={month} onChange={e=>setMonth(e.target.value||today().slice(0,7))}/></label><div className="report-stats"><div><small>INCOME</small><strong className="positive">{money(monthly.income)}</strong></div><div><small>SPENT</small><strong className="negative">{money(monthly.expenses)}</strong></div><div><small>NET SAVED</small><strong>{money(monthly.wallet)}</strong></div></div><h3 className="subheading">WHERE YOUR MONEY WENT</h3><div className="budget-list">{categories.map((c,i)=><div className="budget-card" key={c}><div><span>{c}</span><span>{money(spent(state,c,month))} · {pct(spent(state,c,month),monthly.expenses)}%</span></div><Bar value={pct(spent(state,c,month),monthly.expenses)} color={colors[i]}/></div>)}</div><p className="view-intro">{monthly.income?`${pct(monthly.wallet,monthly.income)}% of this month’s income remains after expenses.`:'Add income to see this month’s savings rate.'}</p><button className="pixel-button" onClick={exportData}>EXPORT ADVENTURE DATA</button></>;
  case 'Settings':return <><div className="quest-profile"><Sprite x={43} y={606} w={128} h={115} scale={.7}/><div><h3>{state.name}</h3><p>LEVEL {level} · {state.xp} XP</p><small>{state.demo?'DEMO SAVE':'PERSONAL ADVENTURE'} · {ready?'SAVED':'CONNECTING'}</small></div></div><button className="pixel-button" onClick={()=>open('profile','EDIT ADVENTURER')}>EDIT ADVENTURER NAME</button><label className="sound-setting"><Checkbox checked={sound} onCheckedChange={v=>{setSound(v);try{localStorage.setItem('nexus-sound',v?'on':'off');}catch{}}}/>8-BIT REWARD SOUNDS</label><p className="view-intro">Your budget is saved privately to your account. Currency: EUR. Amounts entered here are manually tracked.</p><button className="pixel-button" onClick={exportData}>EXPORT SAVE</button><button className="pixel-button" onClick={()=>setHelp(true)}>HOW TO PLAY</button><button className="pixel-button danger-action" onClick={()=>open('fresh','START A FRESH ADVENTURE')}>{state.demo?'CLEAR DEMO & START FRESH':'RESET ADVENTURE'}</button></>;
  default:return null;
 }}
 return <div className="game"><header className="topbar"><strong className="brand"><span className="brand-mark" aria-hidden="true" />SAVEPOINT</strong><nav aria-label="App menu"><button onClick={exportData}>FILE</button><button onClick={()=>navigate(active==='Home'?'Analytics':'Home')}>VIEW</button><button onClick={()=>open('budgets','SET MONTHLY BUDGETS')}>TOOLS</button><button onClick={()=>setHelp(true)}>HELP</button></nav><time>{clock||'SEP 2026'}</time><span className="sun">☀</span></header>
 <main className="dashboard"><div className="left-world"><div className="room"><div className="room-art"/><SidebarProvider className="navigation"><Sidebar collapsible="none" className="panel nav-panel"><SidebarContent><SidebarMenu>{nav.map((name,i)=><SidebarMenuItem key={name}><SidebarMenuButton aria-label={name} aria-current={active===name?'page':undefined} className="nav-button" isActive={active===name} onClick={()=>navigate(name)}><span className="pointer">▶</span><Icon index={i}/><span>{name}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent></Sidebar></SidebarProvider><button className="dog-hit" aria-label="Pet your dog" onClick={()=>{chime();setMessage('Woof! You’ve got this. I’m here for every little victory.');}}/><button className="level-chip" onClick={()=>navigate('Lifestyle')}>LV. {level} · {state.xp} XP <Bar value={state.xp%100} color="gold"/></button></div><Panel className="dialogue"><Sprite x={43} y={606} w={128} h={115}/><div><h1>{state.name==='Adventurer'?'Welcome back!':`Hey, ${state.name}!`}</h1><p role="status" aria-live="polite">{message}</p></div><button className="next-dialogue" aria-label="Next message" onClick={()=>setMessage(['Your future self is cheering you on.','A small saving today. A bigger adventure tomorrow.','Check your daily quests for a little XP boost.'][Math.floor(Math.random()*3)])}>▼</button></Panel></div>
 <div className="right-dashboard"><Panel className="wallet"><div><div className="wallet-label">WALLET</div><strong className={balance.wallet<0?'negative':''}>{money(balance.wallet)}</strong></div><dl><div><dt>INCOME</dt><dd className="positive">+ {money(balance.income)}</dd></div><div><dt>EXPENSES</dt><dd className="negative">− {money(balance.expenses)}</dd></div><div><dt>SAVINGS</dt><dd>{money(balance.saved)}</dd></div></dl></Panel>
 {loadError&&<div className="load-error" role="alert">{loadError} {needsLogin?<a href="/signin-with-chatgpt?return_to=%2F" target="_top">SIGN IN</a>:<button onClick={()=>void load()}>RETRY LOAD</button>}</div>}
 {active==='Home'?<div className="middle-grid"><Panel title="THIS MONTH" extra={<button className="panel-link" aria-label="View monthly budgets" onClick={()=>navigate('Budgets')}>›</button>}><div className="categories">{categories.map((c,i)=>{const amount=spent(state,c,day.slice(0,7));const percent=pct(amount,totals(state,day.slice(0,7)).expenses);return <button className="category-row" key={c} onClick={()=>navigate('Budgets')}><span className="category-name"><Sprite x={807} y={237+i*41} w={27} h={32} scale={.75}/>{c}</span><Bar value={percent} color={colors[i]} label={`${c} spending`}/><span>{percent}%</span><span>{money(amount)}</span></button>;})}</div></Panel><Panel title="GOALS"><div className="goals-list">{state.goals.slice(0,4).map(g=><button className="goal-row" key={g.id} onClick={()=>navigate('Goals')}><GoalIcon index={g.icon}/><div>{g.name}<Bar value={pct(g.saved,g.target)} label={g.name}/></div><span>{pct(g.saved,g.target)}%</span></button>)}{!state.goals.length&&<button className="empty-state" onClick={()=>open('goal','ADD SAVINGS GOAL')}>+ Set your first goal</button>}</div></Panel><Panel title="RECENT TRANSACTIONS" extra={<button className="panel-link" aria-label="Next transactions page" onClick={()=>setPage((page+1)%pages)}>{page+1}/{pages}</button>}><div className="transaction-list">{recent.map((t,i)=><button className="transaction-row" key={t.id} onClick={()=>open('transaction','EDIT TRANSACTION',{...t,kind:t.type})}><Sprite x={800} y={529+(t.type==='income'?2:i%5)*39} w={35} h={34} scale={.8}/><span>{t.name}</span><span className={t.type==='income'?'positive':'negative'}>{t.type==='income'?'+':'−'} {money(t.amount)}</span><span>{shortDate(t.date)}</span></button>)}{!recent.length&&<p className="empty-state">Your first transaction starts here.</p>}</div></Panel><Panel title="QUICK ACTIONS"><div className="quick-actions"><button className="pixel-button" onClick={()=>open('transaction','ADD TRANSACTION')}><span className="plus">+</span>ADD TRANSACTION</button><button className="pixel-button" onClick={()=>open('budgets','SET MONTHLY BUDGETS')}><Icon index={2} scale={.65}/>SET BUDGET</button><button className="pixel-button" onClick={()=>open('goal','ADD SAVINGS GOAL')}><Icon index={3} scale={.65}/>ADD GOAL</button><button className="pixel-button" onClick={()=>navigate('Analytics')}><Icon index={8} scale={.65}/>VIEW REPORTS</button></div></Panel></div>:<Panel className="workspace-panel" title={active.toUpperCase()} extra={<button className="panel-link" onClick={()=>navigate('Home')}>× BACK</button>}><div className="workspace-content">{workspace()}</div></Panel>}</div>
 <div className="bottom-grid"><button className="panel map" onClick={()=>{setMessage('Home sweet home. Your next quest is waiting in the journal.');navigate('Lifestyle');}} aria-label="Open your quest journal"><span>LOCATION: HOME</span></button><Panel title="TODAY’S TASKS" extra={<span className="quest-count">{done.length}/4</span>}>{quests()}</Panel><Panel title="UPCOMING" extra={<button className="panel-link" aria-label="Add upcoming bill or event" onClick={()=>open('event','ADD BILL OR EVENT')}>+</button>}><div className="upcoming">{upcoming.slice(0,5).map(e=><button key={e.id} onClick={()=>open('payEvent',e.name.toUpperCase(),{id:e.id,amount:e.amount})}><Sprite x={1087} y={791} w={23} h={26} scale={.8}/><span>{shortDate(e.date)}</span><span>{e.name}</span><span className="negative">{e.amount?'− '+money(e.amount):''}</span></button>)}{!upcoming.length&&<p className="empty-state">No upcoming bills. Breathe easy.</p>}</div></Panel></div></main>
 <footer><span><button onClick={()=>open('transaction','ADD TRANSACTION')}>Ⓝ ADD</button>　<button onClick={()=>{setForm(null);navigate('Home');}}>ESC BACK</button></span><button className="save-status" onClick={()=>navigate('Settings')}>{busy?'SAVING…':!ready?(loadError?'SAVE UNAVAILABLE':'LOADING SAVE…'):state.demo?'DEMO · START FRESH':'◆ ADVENTURE SAVED'}</button><span>A MORE ORGANISED TOMORROW <Sprite x={1485} y={984} w={33} h={31} scale={.7}/></span></footer>
 <Dialog open={!!form} onOpenChange={v=>{if(!v&&!busy)setForm(null);}}><DialogContent className="game-modal panel" showCloseButton={!busy}><DialogTitle className="modal-title">{form?.title}</DialogTitle><DialogDescription className="modal-description">{form?.type==='fresh'?'A new chapter starts here.':'A little progress goes a long way.'}</DialogDescription>{form&&<ActionForm key={form.type+String(form.data?.id??'')} spec={form} state={state} submit={act} busy={busy||!ready} error={error}/>}</DialogContent></Dialog>
 <Dialog open={help} onOpenChange={setHelp}><DialogContent className="game-modal panel"><DialogTitle className="modal-title">WELCOME TO SAVEPOINT</DialogTitle><DialogDescription className="modal-description">Your everyday life, one small quest at a time.</DialogDescription><div className="help-copy"><p>Log income and expenses to keep your wallet accurate. Set monthly budgets and put unallocated money toward your goals.</p><p>Complete daily quests for 25 XP each. Every 100 XP raises your level. Rechecking a quest won’t award XP twice.</p><p>Savings are money reserved inside your wallet. Use Release to make those funds available again.</p><p>Click the dog for encouragement. Press N to add a transaction, or Escape to return home.</p><p>{state.demo?'You’re exploring sample data. Open Settings → Clear demo & start fresh when you’re ready.':'Your adventure saves privately to your account.'}</p></div></DialogContent></Dialog>
 </div>;
}


