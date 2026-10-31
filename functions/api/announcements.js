import {json} from '../_lib/admin.js';
export async function onRequestGet({env}) {
  try {const r=await env.LEAGUE_DB.prepare('SELECT id,title,body,is_pinned,created_at FROM announcements ORDER BY is_pinned DESC,id DESC').all();return json({announcements:r.results||[]});}
  catch{return json({announcements:[]});}
}
