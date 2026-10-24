import {json,hashNewPassword,makeSession,sessionCookie} from '../../_lib/admin.js';
export async function onRequestPost({request,env}) {
 let b; try{b=await request.json()}catch{return json({error:'请求格式错误'},400)}
 const count=await env.LEAGUE_DB.prepare('SELECT COUNT(*) AS n FROM admins').first();
 if(Number(count?.n||0)>0) return json({error:'管理员已初始化，请使用登录功能'},409);
 if(!env.ADMIN_SETUP_KEY) return json({error:'请先在 Cloudflare Secrets 中配置 ADMIN_SETUP_KEY'},503);
 if(!b.setup_key || b.setup_key!==env.ADMIN_SETUP_KEY) return json({error:'初始化密钥错误'},403);
 const username=String(b.username||'').trim(), password=String(b.password||'');
 if(!/^[A-Za-z0-9_.-]{3,32}$/.test(username)) return json({error:'用户名需为 3-32 位字母、数字或 _ . -'},400);
 if(password.length<12 || password.length>128) return json({error:'密码长度必须为 12-128 位'},400);
 const {salt,hash}=await hashNewPassword(password);
 try {const res=await env.LEAGUE_DB.prepare('INSERT INTO admins (username,password_hash,password_salt) VALUES (?,?,?)').bind(username,hash,salt).run();const token=await makeSession(env,res.meta.last_row_id);return json({ok:true,username},200,{'set-cookie':sessionCookie(token)})}catch{return json({error:'创建失败，用户名可能已存在'},409)}
}
