'use client';
// Keep the Phaser host mounted while React opens dashboard panels.
import {useEffect,useRef,useState} from 'react';
import type Phaser from 'phaser';
import type {WorldAction,WorldBridge} from './worldEvents';
export default function SavepointGame({paused,onAction}:{paused:boolean;onAction:(action:WorldAction)=>void}){
  const host=useRef<HTMLDivElement>(null),callback=useRef(onAction);callback.current=onAction;
  const [nearby,setNearby]=useState(''),[error,setError]=useState('');
  const [bridge]=useState<WorldBridge>(()=>({controls:{paused:true,x:0,y:0,interact:false},action:a=>callback.current(a),nearby:setNearby}));
  useEffect(()=>{bridge.controls.paused=paused;if(paused){bridge.controls.x=0;bridge.controls.y=0;bridge.controls.interact=false;}},[paused,bridge]);
  useEffect(()=>{
    let disposed=false,game:Phaser.Game|undefined,observer:ResizeObserver|undefined;
    const element=host.current!;
    void Promise.all([import('phaser'),import('./scenes/BootScene'),import('./scenes/TownScene')]).then(([p,{BootScene},{TownScene}])=>{
      if(disposed)return;
      game=new p.Game({type:p.AUTO,parent:element,width:element.clientWidth||960,height:element.clientHeight||600,pixelArt:true,roundPixels:true,backgroundColor:'#789a76',physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},scene:[new BootScene(),new TownScene(bridge)],audio:{noAudio:true},banner:false});
      game.canvas.setAttribute('aria-label','Savepoint town. Move with ZQSD or arrow keys; press E near a building.');game.canvas.tabIndex=0;
      observer=new ResizeObserver(()=>{if(element.clientWidth&&element.clientHeight)game?.scale.resize(element.clientWidth,element.clientHeight);});observer.observe(element);
    }).catch(()=>{if(!disposed)setError('The town could not load. You can still open the dashboard.');});
    const key=(e:KeyboardEvent)=>{if(!bridge.controls.paused&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();};
    const release=()=>{bridge.controls.x=0;bridge.controls.y=0;};
    window.addEventListener('keydown',key);window.addEventListener('blur',release);window.addEventListener('pointerup',release);
    return()=>{disposed=true;observer?.disconnect();game?.destroy(true);window.removeEventListener('keydown',key);window.removeEventListener('blur',release);window.removeEventListener('pointerup',release);};
  },[bridge]);
  return <><div ref={host} className="town-canvas"/>{error&&<p role="alert">{error}</p>}<div className="town-controls"><div className="dpad" aria-label="Movement controls">{[['↑',0,-1],['←',-1,0],['↓',0,1],['→',1,0]].map(([label,x,y])=><button key={String(label)} disabled={paused} aria-label={`Move ${{'↑':'up','←':'left','↓':'down','→':'right'}[label as string]}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);bridge.controls.x=Number(x);bridge.controls.y=Number(y);}} onPointerUp={()=>{bridge.controls.x=0;bridge.controls.y=0;}} onPointerCancel={()=>{bridge.controls.x=0;bridge.controls.y=0;}}>{label}</button>)}</div><p role="status">{nearby?`[E] ${nearby}`:'ZQSD / ARROWS TO MOVE · EXPLORE THE TOWN'}</p><button className="pixel-button" disabled={paused||!nearby} onClick={()=>{bridge.controls.interact=true;}}>E · INTERACT</button></div></>;
}


