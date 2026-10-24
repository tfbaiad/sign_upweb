import {json,currentAdmin} from '../../_lib/admin.js';
export async function onRequestGet({request,env}) {const a=await currentAdmin(request,env);return a?json({ok:true,username:a.username}):json({error:'未登录'},401)}
