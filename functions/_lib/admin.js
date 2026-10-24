const enc = new TextEncoder();
export const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
export const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const unb64 = (s) => Uint8Array.from(atob(s), c=>c.charCodeAt(0));
export async function digest(text) { return b64(await crypto.subtle.digest('SHA-256', enc.encode(text))); }
export async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unb64(salt),iterations:210000,hash:'SHA-256'},key,256));
}
export async function hashNewPassword(password) {
  const salt=b64(crypto.getRandomValues(new Uint8Array(16)));
  return {salt, hash:await passwordHash(password,salt)};
}
export async function currentAdmin(request, env) {
  const m=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)gxls_admin=([^;]+)/);
  if(!m) return null;
  const token=decodeURIComponent(m[1]);
  const row=await env.LEAGUE_DB.prepare(`SELECT admins.id, admins.username FROM admin_sessions JOIN admins ON admins.id=admin_sessions.admin_id WHERE admin_sessions.token_hash=? AND admin_sessions.expires_at>?`).bind(await digest(token),Math.floor(Date.now()/1000)).first();
  return row||null;
}
export function sessionCookie(token,maxAge=60*60*12) { return `gxls_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`; }
export function clearCookie() { return 'gxls_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'; }
export async function makeSession(env, adminId) {
  const token=b64(crypto.getRandomValues(new Uint8Array(32)));
  const expires=Math.floor(Date.now()/1000)+60*60*12;
  await env.LEAGUE_DB.prepare('INSERT INTO admin_sessions (token_hash,admin_id,expires_at) VALUES (?,?,?)').bind(await digest(token),adminId,expires).run();
  return token;
}
export async function requireAdmin(request,env) { return await currentAdmin(request,env); }
