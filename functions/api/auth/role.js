import {json,currentAccount} from '../../_lib/accounts.js';
export async function onRequestPatch({request,env}){
  const a=await currentAccount(request,env);
  if(!a)return json({error:'请先登录'},401);
  let b;try{b=await request.json()}catch{return json({error:'请求格式错误'},400)}
  const role=String(b.account_role||'');
  if(!['captain','member'].includes(role))return json({error:'身份选项无效'},400);
  const captainTeam=await env.LEAGUE_DB.prepare('SELECT id FROM teams WHERE captain_account_id=?').bind(a.id).first();
  if(captainTeam&&role!=='captain')return json({error:'你已经创建战队，不能直接切换为队员；如需更换身份请联系组委会'},409);
  const membership=await env.LEAGUE_DB.prepare('SELECT team_id FROM team_members WHERE account_id=?').bind(a.id).first();
  if(membership&&role==='captain'&&!captainTeam)return json({error:'你已经加入其他战队，请先退出当前战队后再设置为队长'},409);
  await env.LEAGUE_DB.prepare('UPDATE player_accounts SET account_role=? WHERE id=?').bind(role,a.id).run();
  return json({ok:true,account_role:role});
}
