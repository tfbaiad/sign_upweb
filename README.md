# gxls_signup — Cloudflare Pages + D1 迁移起步包

本目录提供可部署到 Cloudflare Pages 的报名页面、Pages Functions API 和 D1 初始化 SQL。原仓库使用经典 ASP/VBScript + Access `.mdb`，Cloudflare Pages 不能直接运行这些后端，因此这里将报名写入改为 JavaScript Pages Function + D1。

## 文件结构

- `public/index.html`：选手报名页面（右上角新增“公平比赛承诺书提交”入口；段位选项为 D、C、C+、C++、B、B+、B++、A、A+、A++、S0-9、S10-24、S25-49、S>=50）
- `public/commitment.html`：公平比赛承诺书阅读、信息填写与提交页面
- `public/admin.html`：管理员登录、查看/修改报名及承诺书记录、创建其他管理员账号（初始管理员由 0004_seed_admin.sql 创建）
- `functions/api/admin/`：登录/退出、会话校验、数据读取与修改、创建管理员接口；不再提供网页初始化接口
- `migrations/0003_admin.sql`：管理员账号与会话表
- `functions/api/register.js`：`POST /api/register`，提交报名
- `functions/api/commitment.js`：`POST /api/commitment`，提交承诺书信息
- `migrations/0002_commitments.sql`：承诺书提交记录表
- `functions/api/players.js`：`GET /api/players`，管理员登录后读取报名列表（后台页面已包含）
- `migrations/0001_init.sql`：D1 表结构
- `wrangler.toml`：Pages 与 D1 绑定示例

## 部署步骤

1. 将本目录里的文件上传到你自己的 GitHub 仓库，目录结构保持不变。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git，选择仓库。
3. Framework preset 选 `None`；Build command 留空；Build output directory 填 `public`。
4. 在 Cloudflare Dashboard 创建 D1 数据库，例如 `gxls-signup-db`。复制数据库 ID，替换 `wrangler.toml` 中的 `database_id`。也可以在 Pages 项目 Settings → Bindings 中添加 D1，变量名必须为 `LEAGUE_DB`。
5. 用 Wrangler 执行数据库迁移（会按顺序创建报名表和承诺书表；先安装 Node.js，再在项目根目录运行）：

   ```bash
   npx wrangler login
   npx wrangler d1 migrations apply gxls-signup-db --remote
   ```

   如果你在 Cloudflare 创建的数据库用了别的名字，请把命令中的数据库名换成实际名称。
6. 确认 Pages 项目 Settings → Bindings 中 D1 绑定名为 `LEAGUE_DB`，并重新部署。
7. 如果使用本包提供的初始管理员账号，请确保已执行 `0004_seed_admin.sql`。如果已部署过旧版本（PBKDF2 迭代次数为 210000），升级到此版本后，还需执行 `0005_fix_initial_admin_hash.sql`，使初始账号哈希与当前兼容的 100000 次迭代一致。
8. 发布后测试报名表单、承诺书提交和后台修改。管理员接口请求示例：

   ```bash
   curl -H "Authorization: Bearer 你的ADMIN_TOKEN" https://你的域名/api/players
   ```

## 从旧 Access 数据库迁移

旧 `.mdb` 数据没有自动导入本包。请先在本地使用 Access 或可信的数据库导出工具，将报名表导出为 CSV；检查并删除不需要的个人信息，再编写/执行导入脚本。不要把 `.mdb`、CSV、`serverkey.txt` 或任何密钥放进 `public/` 目录或公开仓库。

## 重要说明

- 承诺书提交保存的是选手学校、完美名称、参赛队伍、QQ、填写日期及确认同意状态；当前不会上传手写签名图片。
- 这是迁移起步包，不是对原站每个页面和功能的完整逐项复刻。旧仓库里的 ASP 页面（例如查询、后台、公式/说明等）尚需逐页迁移；当前包含报名流程和受令牌保护的报名列表 API。
- 表字段根据旧 `index.asp` 中可见的报名字段设计；原 Access 数据库实际表结构、字段约束和重复报名规则需要部署前核对。
- 不要将 `ADMIN_TOKEN` 写入前端代码或提交到 GitHub。
- 为避免泄露，原仓库的 `.mdb` 数据库、`.ldb` 锁文件和 `serverkey.txt` 不应直接复制到部署目录。


## 管理后台与段位选项

- 首页右上角增加“管理员入口”，也可直接访问 `/admin.html`。
- 初始管理员由 `0004_seed_admin.sql` 创建，不再需要初始化入口或 `ADMIN_SETUP_KEY`。
- 后台支持查看和修改报名记录、承诺书记录，并创建额外管理员账号。密码使用 PBKDF2-SHA256（100000 次迭代，兼容 Cloudflare Workers）哈希保存，登录会话使用 HttpOnly/Secure/SameSite Cookie。
- 段位选项固定为：D、C、C+、C++、B、B+、B++、A、A+、A++、S0-9、S10-24、S25-49、S>=50。
- 管理员会话有效期 12 小时。上线前请在 Cloudflare Pages 正式域名上测试登录、修改和退出流程。


### V5 学校列表更新
报名页、承诺书页和管理员编辑页面统一使用 19 个学校选项；新增补齐“张家港市艺术学校（原张家港舞蹈学校）”和“张家港市特殊教育学校”。旧记录若学校名称不在列表中，后台仍会保留该值以避免误覆盖。
