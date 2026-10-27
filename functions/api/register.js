export async function onRequestPost({ request, env }) {
  let body; try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }
  const fields = ['player_name', 'steam_id', 'qq', 'backup_phone', 'rank', 'school'];
  const row = Object.fromEntries(fields.map(k => [k, String(body?.[k] ?? '').trim()]));
  for (const key of ['player_name', 'steam_id', 'qq', 'rank', 'school']) if (!row[key]) return json({ error: '请填写所有必填项' }, 400);
  if (row.player_name.length > 100 || row.steam_id.length > 30 || row.qq.length > 20 || row.backup_phone.length > 30 || row.rank.length > 50 || row.school.length > 100) return json({ error: '部分字段长度超出限制' }, 400);
  if (!/^\d{15,20}$/.test(row.steam_id)) return json({ error: 'Steam64 位 ID 格式不正确' }, 400);
  try {
    const r = await env.LEAGUE_DB.prepare(`INSERT INTO players (player_name, steam_id, qq, backup_phone, rank, school) VALUES (?, ?, ?, ?, ?, ?)`).bind(row.player_name, row.steam_id, row.qq, row.backup_phone, row.rank, row.school).run();
    // If an account was created before registration, attach this registration to that account by exact Steam64.
    await env.LEAGUE_DB.prepare('UPDATE player_accounts SET player_id=? WHERE steam_id=? AND player_id IS NULL').bind(r.meta.last_row_id, row.steam_id).run().catch(()=>{});
    return json({ ok: true, player_id: r.meta.last_row_id }, 201);
  } catch (e) {
    if (String(e?.message || '').includes('UNIQUE')) return json({ error: '该 Steam64 位 ID 已报名，请勿重复提交' }, 409);
    return json({ error: '服务器暂时无法处理报名，请联系赛事管理员' }, 500);
  }
}
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
