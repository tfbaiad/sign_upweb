高校联赛系统增量升级包（Cloudflare Pages Functions + D1）

重要：这是“增量包”，不是完整替换版。请解压后把文件夹内的 migrations、functions、public 合并上传到现有 GitHub 仓库，不能删除原有文件。

包含：
- D1 新增表：选手账户、缴费订单、队伍、队伍成员、比赛和比赛队伍
- 选手注册/登录/登出/当前账户 API（HttpOnly Cookie）
- 付款订单提交 API，固定 1000 分（10元）
- 管理员缴费审核 API（复用现有 gxls_admin 管理员 Cookie）
- 队伍创建、队长选人、正式/替补位置、成员列表 API
- 管理员比赛发布 API、队伍成员查看自己相关比赛的 API
- 账户、队伍、比赛三个简易页面

部署步骤：
1. 先在 Cloudflare D1 备份数据库（Dashboard -> D1 -> Export / 或保存 SQL 导出）。
2. GitHub 上传前确认 wrangler.toml 仍绑定原来的 LEAGUE_DB。不要改数据库 ID。
3. 在 Cloudflare D1 SQL Console 中只执行 migrations/0006_accounts_payments_teams_matches.sql 一次。此迁移只新增表和索引，不删除/覆盖原表。
4. 将 functions/ 与 public/ 内文件合并到现有仓库，然后提交，等待 Pages 部署。
5. 把 public/wechat-pay-qr.png 替换为你的微信收款码图片（目前不含真实收款码）。
6. 测试 /account.html、/teams.html、/matches.html 和管理员缴费/比赛接口。

目前需要在现有 public/commitment.html 中手动增加身份选择框（队长/队员），并将其提交数据改为带登录态的关联提交；本包已提供 account_role 字段，但不会擅自覆盖你的承诺书页面。为避免破坏旧页面与数据，这部分请在核心流程确认后再合并。

规则说明：
- 未确认缴费也允许提交报名资料；只有后台标记 paid 的选手可被队长选入队伍。
- 队伍人数 6-7 人（含队长），正式队员总计 5 人（含队长），替补最多 2 人。达到 6 人可绑定完成；队长可以继续加到 7 人。
- 当前支付订单只记录用户提交的付款订单号/付款信息，不会自动判断付款成功。管理员必须人工核对微信收款记录后调用审核接口。
- 比赛房间号仅通过登录后 /api/matches/my 返回给相关队伍成员，不要把房间号放在公开页面。

管理员 API 使用现有管理员会话 Cookie：
GET /api/admin/payments
PATCH /api/admin/payments  body: {"payment_id":1,"status":"paid"|"rejected","admin_note":"..."}
POST /api/admin/matches body: {"title":"第1轮","starts_at":"2027-07-01T19:00","room_code":"房间号","notes":"...","team_ids":[1,2]}

安全提醒：请给所有新接口在正式上线前测试。不要把管理员口令、支付平台密钥或真实个人信息写进公开仓库。此版本使用固定 10 元金额，不能由浏览器修改。
