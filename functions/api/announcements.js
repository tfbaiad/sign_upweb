import {json} from '../_lib/admin.js';
export async function onRequestGet({env}) {
  try {
    const info=await env.LEAGUE_DB.prepare('PRAGMA table_info(announcements)').all();
    const columns=new Set((info.results||[]).map(x=>x.name));
    const textColumn=columns.has('body')?'body':columns.has('content')?'content':null;
    if(!textColumn)return json({announcements:[]});
    const r=await env.LEAGUE_DB.prepare(`SELECT id,title,${textColumn} AS body,is_pinned,datetime(created_at,'+8 hours') AS created_at FROM announcements ORDER BY is_pinned DESC,id DESC`).all();
    return json({announcements:r.results||[]});
  } catch(error) {
    return json({announcements:[],error:`读取公告失败：${error.message||'数据库错误'}`},500);
  }
}
