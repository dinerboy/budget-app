import type { WorldAction } from '../worldEvents';
export type InteractionZone = { id: string; label: string; x: number; y: number; width: number; height: number; action: WorldAction };
export function nearbyZone(zones: InteractionZone[], x: number, y: number) {
  return zones.filter(z => Math.abs(x-z.x)<=z.width/2 && Math.abs(y-z.y)<=z.height/2)
    .sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y))[0];
}
