export async function onRequestGet({ request, env }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 500);
  const { results } = await env.LEAGUE_DB.prepare(`SELECT id, player_name, steam_id, qq, backup_phone, rank, school, created_at FROM players ORDER BY id DESC LIMIT ?`).bind(limit).all();
  return new Response(JSON.stringify({ results }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
