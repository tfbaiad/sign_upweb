export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }
  const fields = ['school', 'player_name', 'qq', 'signed_date', 'participant_role'];
  const row = Object.fromEntries(fields.map(k => [k, String(body?.[k] ?? '').trim()]));
  for (const key of fields) if (!row[key]) return json({ error: '请完整填写承诺书信息' }, 400);
  if (!['captain', 'member'].includes(row.participant_role)) return json({ error: '请选择队长或队员身份' }, 400);
  if (body?.agree !== true) return json({ error: '请先勾选并确认同意承诺书内容' }, 400);
  if (row.school.length > 100 || row.player_name.length > 100 || row.qq.length > 20 || row.signed_date.length > 20) return json({ error: '部分字段长度超出限制' }, 400);
  try {
    // Keep legacy team_name column empty for compatibility; participants choose teams later in the team system.
    await env.LEAGUE_DB.prepare(`INSERT INTO commitment_submissions (school, player_name, team_name, qq, signed_date, agreed, participant_role) VALUES (?, ?, '', ?, ?, 1, ?)`)
      .bind(row.school, row.player_name, row.qq, row.signed_date, row.participant_role).run();
    return json({ ok: true }, 201);
  } catch (e) {
    return json({ error: '承诺书提交失败，请确认已执行最新数据库迁移后重试' }, 500);
  }
}
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
