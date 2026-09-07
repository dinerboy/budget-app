import * as Phaser from 'phaser';
import {spriteAtlas} from '../systems/spriteAtlas';
export class BootScene extends Phaser.Scene {
  constructor(){super('Boot');}
  preload(){
    this.load.image('reference-map','/art/savepoint-reference.png');
    this.load.image('femme-source','/art/savepoint-femme-sheet.png');
    this.load.image('map-patches','/art/savepoint-map-patches.png');
    this.load.image('dog-source','/art/savepoint-dog-source.png');
  }
  create(){
    const dogSource=this.textures.get('dog-source');
    const dogImage=dogSource.getSourceImage() as HTMLImageElement;
    const dx=dogImage.width/1672,dy=dogImage.height/941;
    dogSource.add('paving',0,Math.round(720*dx),Math.round(420*dy),Math.round(76*dx),Math.round(78*dy));
    const dog=this.textures.createCanvas('dog',64,68)!;
    const context=dog.getContext();
    context.imageSmoothingEnabled=false;
    context.drawImage(dogImage,22*dx,2*dy,64*dx,66*dy,0,0,64,68);
    const pixels=context.getImageData(0,0,64,68);
    for(let i=0;i<pixels.data.length;i+=4){
      const p=pixels.data;
      if(p[i]>150&&p[i+2]>100&&p[i+1]<100&&p[i]-p[i+1]>70)p[i+3]=0;
    }
    context.putImageData(pixels,0,0);dog.refresh();
    this.textures.get('reference-map').add('map',0,0,68,1672,873);
    spriteAtlas(this,'femme-source','femme-sheet',3,4);
    const frames=(key:string,columns:number,rows:number,names:string[])=>{
      const texture=this.textures.get(key),source=texture.getSourceImage();
      const width=source.width/columns,height=source.height/rows;
      names.forEach((name,i)=>texture.add(name,0,(i%columns)*width,Math.floor(i/columns)*height,width,height));
    };
    const patches=this.textures.get('map-patches'),image=patches.getSourceImage();
    const sx=image.width/1672,sy=image.height/941;
    for(const [name,x,y,w,h] of [['player',795,387,68,97],['prompt',819,319,175,38],['dialogue',18,806,550,117]] as [string,number,number,number,number][]){
      patches.add(name,0,Math.round(x*sx),Math.round(y*sy),Math.round(w*sx),Math.round(h*sy));
    }
    
    const directions=['down','left','right','up'];
    frames('femme-sheet',3,4,directions.flatMap(d=>[0,1,2].map(f=>`${d}-${f}`)));
    for(const direction of directions){
      this.anims.create({key:`idle-${direction}`,frames:[{key:'femme-sheet',frame:`${direction}-0`}],frameRate:1});
      this.anims.create({key:`walk-${direction}`,frames:[0,1,0,2].map(frame=>({key:'femme-sheet',frame:`${direction}-${frame}`})),frameRate:8,repeat:-1});
    }
    this.scene.start('Town');
  }
}


