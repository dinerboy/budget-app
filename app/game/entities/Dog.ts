import * as Phaser from 'phaser';

/** Follow the player's actual footsteps, including turns around obstacles. */
export class Dog extends Phaser.GameObjects.Image {
  private trail: Phaser.Math.Vector2[] = [];
  private last: Phaser.Math.Vector2;
  private step = 0;
  constructor(scene: Phaser.Scene, x: number, y: number, player: {x:number;y:number}) {
    super(scene,x,y,'dog');
    scene.add.existing(this);
    this.setOrigin(.5,1);
    this.last=new Phaser.Math.Vector2(player.x,player.y);
    this.trail.push(this.last.clone());
  }
  follow(player: {x:number;y:number}, delta: number) {
    if(Phaser.Math.Distance.Between(this.last.x,this.last.y,player.x,player.y)>=2){
      this.last.set(player.x,player.y);
      this.trail.push(this.last.clone());
    }
    let distance=0,previous: {x:number;y:number}=this;
    for(const point of this.trail){distance+=Phaser.Math.Distance.Between(previous.x,previous.y,point.x,point.y);previous=point;}
    let travel=Math.min(Math.max(0,distance-54),190*Math.min(delta,50)/1000);
    const moving=travel>.1;
    while(travel>0&&this.trail.length){
      const target=this.trail[0],dx=target.x-this.x,dy=target.y-this.y,d=Math.hypot(dx,dy);
      if(Math.abs(dx)>.5)this.setFlipX(dx<0);
      if(d<=travel){this.setPosition(target.x,target.y);this.trail.shift();travel-=d;}
      else {this.x+=dx/d*travel;this.y+=dy/d*travel;travel=0;}
    }
    this.step=moving?this.step+delta:0;
    this.setOrigin(.5,1+(moving?Math.sin(this.step*.018)*.025:0));
    this.setDepth(this.y+30);
  }
}
