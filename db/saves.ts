import { env } from 'cloudflare:workers';
import { seedState, type GameState } from '@/lib/game';
function db() { if(!env.DB)throw new Error('Save storage is unavailable.');return env.DB; }
export async function getSave(user:string):Promise<GameState> {
 const initial=seedState();
 await db().prepare('INSERT INTO game_saves (user_id, state, revision) VALUES (?, ?, 0) ON CONFLICT(user_id) DO NOTHING').bind(user,JSON.stringify(initial)).run();
 const row=await db().prepare('SELECT state FROM game_saves WHERE user_id = ?').bind(user).first<{state:string}>();
 if(!row)throw new Error('Could not load your save.');return JSON.parse(row.state);
}
export async function putSave(user:string,s:GameState,revision:number) {const result=await db().prepare('UPDATE game_saves SET state = ?, revision = ? WHERE user_id = ? AND revision = ?').bind(JSON.stringify(s),s.version,user,revision).run();return result.meta.changes===1;}
