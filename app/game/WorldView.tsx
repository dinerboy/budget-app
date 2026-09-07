'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {money,type GameState} from '@/lib/game';
import SavepointGame from './SavepointGame';
import type {Location,WorldAction} from './worldEvents';
type Props={state:GameState;wallet:number;savings:number;date:string;paused:boolean;ready:boolean;message:string;onDashboard:(view?:string)=>void;onOpen:(type:string,title:string,data?:Record<string,unknown>)=>void};
export default function WorldView({state,wallet,savings,date,paused,ready,message,onDashboard,onOpen}:Props){
  const [location,setLocation]=useState<Location|null>(null),[vehicle,setVehicle]=useState(''),[goal,setGoal]=useState(''),[history,setHistory]=useState(false);
  const selectedVehicle=state.vehicles.find(v=>v.id===vehicle)??state.vehicles[0];
  const selectedGoal=state.goals.find(g=>g.id===goal)??state.goals[0];
  function action(a:WorldAction){if(a.type==='open-dashboard'){onDashboard();return;}setHistory(false);setLocation(a.location);}
  function open(type:string,title:string,data?:Record<string,unknown>){setLocation(null);onOpen(type,title,data);}
  function view(name:string){setLocation(null);onDashboard(name);}
  const button=(label:string,run:()=>void,disabled=false)=><button className="pixel-button" disabled={disabled||!ready} onClick={run}>{label}</button>;
  return <section className="world-view" aria-label="Savepoint playable town"><header className="world-hud"><div className="world-brand"><span className="save-icon" aria-hidden="true">▣</span><h1>SAVEPOINT</h1><small>Small steps. A brighter you.</small></div><div><small>WALLET</small><strong>{money(wallet)}</strong></div><div><small>SAVINGS</small><strong>{money(savings)}</strong></div><div><small>ADVENTURER</small><strong>LV. {Math.floor(state.xp/100)+1} · {state.xp} XP</strong></div><time>{date}</time></header>
    <SavepointGame paused={paused||!!location||!ready} onAction={action}/>
    <div className="world-status"><span className="world-portrait" aria-hidden="true"/><span aria-live="polite">{ready?message:'Loading your adventure…'}</span><button onClick={()=>onDashboard()}>OPEN DASHBOARD</button></div>
    <Dialog open={!!location} onOpenChange={v=>{if(!v)setLocation(null);}}><DialogContent className="game-modal panel"><DialogTitle className="modal-title">{location}{history?' · HISTORY':''}</DialogTitle><DialogDescription className="modal-description">{location==='Home'?`${state.name} · Level ${Math.floor(state.xp/100)+1} · ${state.xp} XP`:'Small steps. A brighter you.'}</DialogDescription><div className="location-actions">
      {location==='Home'&&<>{button('USE COMPUTER · DASHBOARD',()=>view('Home'))}{button('DAILY QUESTS & XP',()=>view('Lifestyle'))}{button('UPCOMING EVENTS',()=>view('Lifestyle'))}{button('ADVENTURER PROFILE',()=>view('Settings'))}</>}
      {location==='Garage'&&<>{state.vehicles.length?<><label className="form-field">VEHICLE<Select value={selectedVehicle?.id??null} onValueChange={v=>{setVehicle(v??'');setHistory(false);}}><SelectTrigger className="game-input"><SelectValue>{selectedVehicle?.name}</SelectValue></SelectTrigger><SelectContent className="game-select">{state.vehicles.map(v=><SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></label>{history?<div className="vehicle-history">{state.transactions.filter(t=>t.vehicleId===selectedVehicle?.id).length?state.transactions.filter(t=>t.vehicleId===selectedVehicle?.id).map(t=><p key={t.id}>{t.date} · {t.name} <strong>{t.type==='expense'?'−':'+'} {money(t.amount)}</strong></p>):<p>No expenses recorded for this vehicle.</p>}{button('BACK TO VEHICLE',()=>setHistory(false))}</div>:<>{button('LOG EXPENSE',()=>open('transaction','LOG VEHICLE COST',{vehicleId:selectedVehicle!.id,kind:'expense',category:'Transport'}))}{button('SCHEDULE SERVICE',()=>open('event','SCHEDULE SERVICE',{vehicleId:selectedVehicle!.id,category:'Transport'}))}{button('UPDATE ODOMETER',()=>open('mileage','UPDATE ODOMETER',{id:selectedVehicle!.id,mileage:selectedVehicle!.mileage}))}{button('VIEW HISTORY',()=>setHistory(true))}</>}</>:<p>Your garage is empty.</p>}{button('ADD VEHICLE',()=>open('vehicle','ADD VEHICLE'))}</>}
      {location==='Bank'&&<>{button('VIEW SAVINGS',()=>view('Goals'))}{state.goals.length>0&&<label className="form-field">SAVINGS GOAL<Select value={selectedGoal?.id??null} onValueChange={v=>setGoal(v??'')}><SelectTrigger className="game-input"><SelectValue>{selectedGoal?.name}</SelectValue></SelectTrigger><SelectContent className="game-select">{state.goals.map(g=><SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select></label>}{button('CONTRIBUTE TO GOAL',()=>open('contribute','CONTRIBUTE TO GOAL',{id:selectedGoal!.id}),!selectedGoal)}{button('WITHDRAW FROM GOAL',()=>open('withdraw','RELEASE SAVINGS',{id:selectedGoal!.id}),!selectedGoal)}{button('SET BUDGETS',()=>open('budgets','SET MONTHLY BUDGETS'))}{!state.goals.length&&button('ADD SAVINGS GOAL',()=>open('goal','ADD SAVINGS GOAL'))}</>}
      {location==='Store'&&<>{button('LOG GROCERIES',()=>open('transaction','LOG GROCERIES',{kind:'expense',category:'Food',name:'Groceries'}))}{button('LOG SHOPPING',()=>open('transaction','LOG SHOPPING',{kind:'expense',category:'Shopping'}))}{button('LOG FOOD',()=>open('transaction','LOG FOOD',{kind:'expense',category:'Food'}))}</>}
      {location==='Work'&&<>{button('LOG INCOME',()=>open('transaction','LOG INCOME',{kind:'income',category:'Other'}))}{button('VIEW WORK',()=>view('Work'))}</>}
      {location==='Town Hall'&&<>{button('ANALYTICS & REPORTS',()=>view('Analytics'))}{button('VIEW BUDGETS',()=>view('Budgets'))}</>}
      <button className="pixel-button" onClick={()=>setLocation(null)}>BACK TO TOWN</button>
    </div></DialogContent></Dialog>
  </section>;
}


