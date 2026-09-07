import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getSave, putSave } from '@/db/saves';
import { applyCommand, type Command } from '@/lib/game';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return reply({ error: 'Sign in to load your adventure.' }, 401);
  try {
    return reply(await getSave(user.userId));
  } catch {
    return reply(
      { error: 'Your save could not be loaded. Please retry.' },
      503,
    );
  }
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return reply({ error: 'Sign in to save your adventure.' }, 401);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return reply({ error: 'Invalid request origin.' }, 403);
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return reply({ error: 'Invalid request origin.' }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 20000)
      return reply({ error: 'Request is too large.' }, 413);
    const body = JSON.parse(raw);
    if (
      !body ||
      typeof body.command !== 'object' ||
      !Number.isSafeInteger(body.version)
    )
      return reply({ error: 'Invalid action.' }, 400);
    const current = await getSave(user.userId);
    if (body.version !== current.version)
      return reply(
        {
          error: 'Your save changed in another tab. Reload it, then try again.',
        },
        409,
      );
    let next;
    try {
      next = applyCommand(current, body.command as Command);
    } catch (e) {
      return reply(
        { error: e instanceof Error ? e.message : 'Invalid action.' },
        400,
      );
    }
    if (!(await putSave(user.userId, next, current.version)))
      return reply(
        {
          error: 'Your save changed in another tab. Reload it, then try again.',
        },
        409,
      );
    return reply(next);
  } catch {
    return reply({ error: 'Your action was not saved. Please retry.' }, 503);
  }
}
