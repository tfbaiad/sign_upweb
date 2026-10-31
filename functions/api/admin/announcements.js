import {json,currentAdmin} from '../../_lib/admin.js';
export async function onRequestGet({request,env}) {
  const admin=await currentAdmin(request,env); if(!admin)return json({error:'请先登录管理员后台'},401);
  const r=await env.LEAGUE_DB.prepare('SELECT id,title,body,is_pinned,created_at,updated_at FROM announcements ORDER BY is_pinned DESC,id DESC').all();
  return json({announcements:r.results||[]});
}
export async function onRequestPost({request,env}) {
  const admin=await currentAdmin(request,env); if(!admin)return json({error:'请先登录管理员后台'},401);
  let b;try{b=await request.json()}catch{return json({error:'请求格式错误'},400)}
  const title=String(b.title||'').trim(),body=String(b.body||'').trim(),pinned=b.is_pinned?1:0;
  if(!title||title.length>120||!body||body.length>10000)return json({error:'标题和公告内容必填，标题最多120字，内容最多10000字'},400);
  const r=await env.LEAGUE_DB.prepare('INSERT INTO announcements(title,body,is_pinned,created_by) VALUES(?,?,?,?)').bind(title,body,pinned,admin.id).run();
  return json({ok:true,id:r.meta.last_row_id},201);
}
export async function onRequestDelete({request,env}) {
  const admin=await currentAdmin(request,env); if(!admin)return json({error:'请先登录管理员后台'},401);
  let b;try{b=await request.json()}catch{return json({error:'请求格式错误'},400)}
  const id=Number(b.id);if(!Number.isInteger(id)||id<1)return json({error:'公告编号无效'},400);
  const r=await env.LEAGUE_DB.prepare('DELETE FROM announcements WHERE id=?').bind(id).run();
  if(!r.meta.changes)return json({error:'公告不存在'},404);return json({ok:true});
}
