import * as Phaser from 'phaser';
export class Player extends Phaser.Physics.Arcade.Sprite {
  facing='down';
  constructor(scene:Phaser.Scene,x:number,y:number) {
    super(scene,x,y,'femme-sheet','down-0'); scene.add.existing(this); scene.physics.add.existing(this);
    const w=this.frame.width,h=this.frame.height;
    this.setScale(96/w).setCollideWorldBounds(true).setSize(w*.23,h*.133).setOffset(w*.385,h*.773).setOrigin(.5,.906);
    this.play('idle-down');
  }
  move(x:number,y:number) {
    const direction=new Phaser.Math.Vector2(x,y).normalize();
    this.setVelocity(direction.x*175,direction.y*175);
    if(x||y) this.facing=Math.abs(x)>Math.abs(y)?(x<0?'left':'right'):(y<0?'up':'down');
    this.play(`${x||y?'walk':'idle'}-${this.facing}`,true);
    this.setDepth(this.y+30);
  }
}


