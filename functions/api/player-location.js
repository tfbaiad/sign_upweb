function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function onRequestPost({ request, env }) {
  if (!env.LEAGUE_DB) return json({ error: '数据库绑定 LEAGUE_DB 未配置。' }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: '提交内容格式不正确。' }, 400); }
  const playerName = String(body.playerName || '').trim();
  const timezone = String(body.timezone || '').slice(0, 80);
  const locale = String(body.locale || '').slice(0, 40);
  const localTime = String(body.localTime || '').slice(0, 40);
  if (!playerName || playerName.length > 40) return json({ error: '完美平台名称不能为空，且不能超过 40 个字符。' }, 400);

  // IP and browser details are derived server-side rather than accepted from the browser.
  const cf = request.cf || {};
  const ip = request.headers.get('CF-Connecting-IP') || 'unavailable';
  const userAgent = (request.headers.get('User-Agent') || 'unknown').slice(0, 500);
  const acceptLanguage = (request.headers.get('Accept-Language') || '').slice(0, 200);
  const country = cf.country || null;
  const region = cf.region || null;
  const city = cf.city || null;
  const cfTimezone = cf.timezone || null;
  const continent = cf.continent || null;
  // Do not store precise latitude/longitude or request GPS. City/region are approximate IP-derived signals.

  try {
    const result = await env.LEAGUE_DB.prepare(`
      INSERT INTO player_location_submissions
      (player_name, ip_address, user_agent, accept_language, browser_timezone, browser_locale, browser_local_time, ip_country, ip_region, ip_city, ip_timezone, ip_continent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(playerName, ip, userAgent, acceptLanguage, timezone, locale, localTime, country, region, city, cfTimezone, continent).run();
    return json({ ok: true, id: result.meta?.last_row_id ?? null });
  } catch (error) {
    return json({ error: '保存失败，请检查数据库迁移是否执行。' }, 500);
  }
}
