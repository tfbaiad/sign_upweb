高校联赛：选手完美名称与访问环境信息提交页

文件：
- public/player-location.html：独立网页
- functions/api/player-location.js：Cloudflare Pages Function，服务端记录 IP、User-Agent 和 Cloudflare 提供的粗略 IP 地理信息
- migrations/0008_player_location_submissions.sql：D1 新表迁移

部署步骤：
1. 将 public/player-location.html 上传到仓库 public 目录。
2. 将 functions/api/player-location.js 上传到仓库 functions/api 目录。
3. 将 0008_player_location_submissions.sql 放入 migrations 目录。
4. 确认 Cloudflare Pages 绑定 D1 数据库变量名为 LEAGUE_DB。
5. 在正确的 D1 数据库中执行 0008_player_location_submissions.sql 一次。
6. 部署后访问 https://你的域名/player-location.html。

说明：页面明确告知并要求勾选同意；不会调用 GPS，不采集精确经纬度。IP 地理信息依赖 Cloudflare request.cf，可能为空或不准确。记录目前没有后台查看页面，需要通过受控的 D1 管理方式查看；不要把记录查询接口公开给访客。

隐私建议：仅用于赛事核验，限制管理员访问，设定保留期限，到期删除；如需公开使用，请先确认适用的隐私与数据保护要求。
