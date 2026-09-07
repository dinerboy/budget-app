import type Phaser from 'phaser';
export function obstacle(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup, x:number,y:number,w:number,h:number) {
  const rect=scene.add.rectangle(x+w/2,y+h/2,w,h,0,0);
  scene.physics.add.existing(rect,true);
  group.add(rect);
}
