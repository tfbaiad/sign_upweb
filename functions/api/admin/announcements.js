import {json,currentAdmin} from '../../_lib/admin.js';

async function schema(db) {
  const result = await db.prepare('PRAGMA table_info(announcements)').all();
  return new Set((result.results || []).map(column => column.name));
}

export async function onRequestGet({request,env}) {
  const admin=await currentAdmin(request,env);
  if(!admin)return json({error:'请先登录管理员后台'},401);
  try {
    const columns=await schema(env.LEAGUE_DB);
    if(!columns.has('id') || !columns.has('title') || (!columns.has('body') && !columns.has('content')))
      return json({error:'公告表字段不完整，请检查 announcements 表'},500);
    const textColumn=columns.has('body')?'body':'content';
    const updated=columns.has('updated_at')?',updated_at':'';
    const r=await env.LEAGUE_DB.prepare(`SELECT id,title,${textColumn} AS body,is_pinned,created_at${updated} FROM announcements ORDER BY is_pinned DESC,id DESC`).all();
    return json({announcements:r.results||[]});
  } catch(error) {
    return json({error:`读取公告失败：${error.message||'数据库错误'}`},500);
  }
}

export async function onRequestPost({request,env}) {
  const admin=await currentAdmin(request,env);
  if(!admin)return json({error:'请先登录管理员后台'},401);
  let b;try{b=await request.json()}catch{return json({error:'请求格式错误'},400)}
  const title=String(b.title||'').trim(),body=String(b.body||b.content||'').trim(),pinned=b.is_pinned?1:0;
  if(!title||title.length>120||!body||body.length>10000)return json({error:'标题和公告内容必填，标题最多120字，内容最多10000字'},400);
  try {
    const columns=await schema(env.LEAGUE_DB);
    const textColumn=columns.has('body')?'body':columns.has('content')?'content':null;
    if(!textColumn || !columns.has('title'))return json({error:'公告表缺少 title 或 body/content 字段'},500);
    const names=['title',textColumn],values=[title,body];
    if(columns.has('is_pinned')){names.push('is_pinned');values.push(pinned)}
    if(columns.has('created_by')){names.push('created_by');values.push(admin.id)}
    if(columns.has('created_at')){names.push('created_at');values.push(new Date().toISOString().slice(0,19).replace('T',' '))}
    if(columns.has('updated_at')){names.push('updated_at');values.push(new Date().toISOString().slice(0,19).replace('T',' '))}
    const sql=`INSERT INTO announcements (${names.join(',')}) VALUES (${names.map(()=>'?').join(',')})`;
    const r=await env.LEAGUE_DB.prepare(sql).bind(...values).run();
    return json({ok:true,id:r.meta.last_row_id},201);
  } catch(error) {
    return json({error:`公告发布失败：${error.message||'数据库错误'}`},500);
  }
}

export async function onRequestDelete({request,env}) {
  const admin=await currentAdmin(request,env);
  if(!admin)return json({error:'请先登录管理员后台'},401);
  let b;try{b=await request.json()}catch{return json({error:'请求格式错误'},400)}
  const id=Number(b.id);if(!Number.isInteger(id)||id<1)return json({error:'公告编号无效'},400);
  try {
    const r=await env.LEAGUE_DB.prepare('DELETE FROM announcements WHERE id=?').bind(id).run();
    if(!r.meta.changes)return json({error:'公告不存在'},404);
    return json({ok:true});
  } catch(error) {
    return json({error:`删除公告失败：${error.message||'数据库错误'}`},500);
  }
}
