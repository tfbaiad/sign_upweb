import {json,currentAccount} from '../../_lib/accounts.js';
export async function onRequestGet({request,env}){const a=await currentAccount(request,env);if(!a)return json({error:'请先登录'},401);return json({account:a})}
