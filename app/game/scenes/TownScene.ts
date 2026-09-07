import * as Phaser from 'phaser';
import {Player} from '../entities/Player';
import {Dog} from '../entities/Dog';
import {obstacle} from '../systems/collisions';
import {nearbyZone,type InteractionZone} from '../systems/interaction';
import type {WorldBridge,Location} from '../worldEvents';
export class TownScene extends Phaser.Scene {
  private player!:Player;
  private dog!:Dog;
  private keys!:Record<string,Phaser.Input.Keyboard.Key>;
  private zones:InteractionZone[]=[];
  private lastLabel='';
  private wasPaused=true;
  constructor(private bridge:WorldBridge){super('Town');}
  create(){
    const width=1672,height=873;
    this.physics.world.setBounds(0,0,width,height);
    this.add.image(0,0,'reference-map','map').setOrigin(0).setDepth(0);
    // Keep the reference pixels; replace only its baked player and UI overlays.
    for(const [name,x,y,w,h] of [
      ['player',795,387,68,97],['prompt',819,319,175,38],['dialogue',18,806,550,117]
    ] as [string,number,number,number,number][]){
      this.add.image(x,y-68,'map-patches',name).setOrigin(0).setDisplaySize(w,h).setDepth(1);
    }
    const blocks=this.physics.add.staticGroup();
    this.add.image(720,420-68,'dog-source','paving').setOrigin(0).setDisplaySize(76,78).setDepth(2);
    const block=(x:number,y:number,w:number,h:number)=>obstacle(this,blocks,x,y-68,w,h);
    for(const box of [
      [218,94,360,249],[677,80,311,239],[1145,78,327,285],
      [116,418,330,254],[1032,382,238,296],[1335,469,133,114],[1265,583,283,207],
      [706,544,130,124],[710,665,118,82],[1125,680,32,18],
      [155,236,18,145],[155,351,88,31],[349,350,286,32],[623,174,18,201],
      [0,864,646,77],[902,874,316,67],[1394,890,278,51],[0,772,30,169],[1604,68,68,510],
      [0,68,212,135],[994,68,151,280],[20,211,112,143],[0,410,102,137],
      [21,574,91,147],[1541,440,116,125]
    ])block(box[0],box[1],box[2],box[3]);
    const entrance=(location:Location,x:number,y:number,w:number,h:number)=>{
      this.zones.push({id:location,label:'ENTER '+location.toUpperCase(),x,y:y-68,width:w,height:h,action:{type:'location',location}});
    };
    entrance('Home',305,354,100,55);entrance('Garage',839,343,130,50);
    entrance('Bank',1340,383,110,54);entrance('Store',313,702,110,55);
    entrance('Work',1090,713,135,70);entrance('Town Hall',1415,820,110,56);
    this.zones.push({id:'computer',label:'USE COMPUTER',x:523,y:397-68,width:120,height:44,action:{type:'open-dashboard'}});
    this.player=new Player(this,830,411);
    this.dog=new Dog(this,757,424,this.player);
    this.physics.add.collider(this.player,blocks);
    const camera=this.cameras.main;
    camera.setBounds(0,0,width,height).setRoundPixels(true);
    const resize=()=>camera.setZoom(Math.max(.65,Math.min(this.scale.width/width,this.scale.height/height)));
    resize();this.scale.on('resize',resize);
    camera.startFollow(this.player,true,.12,.12);
    this.keys=this.input.keyboard!.addKeys('Z,Q,S,D,UP,DOWN,LEFT,RIGHT,E',false) as Record<string,Phaser.Input.Keyboard.Key>;
    this.events.once('shutdown',()=>{this.scale.off('resize',resize);this.bridge.nearby('');this.input.keyboard?.resetKeys();});
  }
  update(_time:number,delta:number){
    if(!this.player)return;
    const c=this.bridge.controls;
    if(c.paused){this.player.move(0,0);c.interact=false;c.x=0;c.y=0;if(!this.wasPaused)this.input.keyboard?.resetKeys();this.wasPaused=true;return;}
    this.wasPaused=false;
    this.dog.follow(this.player,delta);
    const down=(key:string)=>this.keys[key].isDown?1:0;
    this.player.move(c.x||down('D')+down('RIGHT')-down('Q')-down('LEFT'),c.y||down('S')+down('DOWN')-down('Z')-down('UP'));
    const zone=nearbyZone(this.zones,this.player.x,this.player.y);
    const label=zone?.label??'';if(label!==this.lastLabel){this.lastLabel=label;this.bridge.nearby(label);}
    const interact=Phaser.Input.Keyboard.JustDown(this.keys.E)||c.interact;c.interact=false;
    if(interact&&zone){c.paused=true;this.player.move(0,0);this.bridge.action(zone.action);}
  }
}



