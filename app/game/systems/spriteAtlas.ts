import type Phaser from 'phaser';

// Import generated sprite sheets without changing their source files. Strip only
// edge-connected neutral matte pixels, then align every frame to one baseline.
export function spriteAtlas(scene:Phaser.Scene,sourceKey:string,key:string,columns:number,rows:number){
  const source=scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const width=Math.floor(source.width/columns),height=Math.floor(source.height/rows);
  const cells:{canvas:HTMLCanvasElement;x:number;y:number;width:number;height:number}[]=[];
  let widest=1,tallest=1;
  for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d',{willReadFrequently:true})!;
    context.drawImage(source,column*width,row*height,width,height,0,0,width,height);
    const pixels=context.getImageData(0,0,width,height),data=pixels.data;
    const queue=new Int32Array(width*height);let head=0,tail=0;
    const visit=(index:number)=>{
      const p=index*4;if(data[p+3]===0)return;
      const low=Math.min(data[p],data[p+1],data[p+2]),high=Math.max(data[p],data[p+1],data[p+2]);
      if(low>215&&high-low<13){data[p+3]=0;queue[tail++]=index;}
    };
    for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}
    for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
    while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);if(x)visit(p-1);if(x<width-1)visit(p+1);if(y)visit(p-width);if(y<height-1)visit(p+width);}
    if(key==='femme-sheet'){
      // Ignore stray pixels from a neighboring generated pose crossing a cell edge.
      const seen=new Uint8Array(width*height);let largest=new Int32Array(0);
      for(let start=0;start<seen.length;start++){
        if(seen[start]||data[start*4+3]===0)continue;
        head=0;tail=1;queue[0]=start;seen[start]=1;
        while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x+dx,ny=y+dy;if(nx<0||nx>=width||ny<0||ny>=height)continue;
            const n=ny*width+nx;if(!seen[n]&&data[n*4+3]>0){seen[n]=1;queue[tail++]=n;}
          }
        }
        if(tail>largest.length)largest=queue.slice(0,tail);
      }
      seen.fill(0);for(const p of largest)seen[p]=1;
      for(let p=0;p<seen.length;p++)if(!seen[p])data[p*4+3]=0;
    }
    let minX=width,minY=height,maxX=0,maxY=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    context.putImageData(pixels,0,0);
    const w=Math.max(1,maxX-minX+1),h=Math.max(1,maxY-minY+1);
    widest=Math.max(widest,w);tallest=Math.max(tallest,h);cells.push({canvas,x:minX,y:minY,width:w,height:h});
  }
  const texture=scene.textures.createCanvas(key,width*columns,height*rows)!;
  const context=texture.context;context.imageSmoothingEnabled=false;
  const scale=Math.min(width*.88/widest,height*.82/tallest);
  cells.forEach((cell,i)=>{
    const w=Math.round(cell.width*scale),h=Math.round(cell.height*scale);
    const x=(i%columns)*width+Math.round((width-w)/2),y=Math.floor(i/columns)*height+Math.round(height*.906)-h;
    context.drawImage(cell.canvas,cell.x,cell.y,cell.width,cell.height,x,y,w,h);
  });
  texture.refresh();return texture;
}
