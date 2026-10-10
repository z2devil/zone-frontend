# AGENTS.md

> Zone 前端仓库工作指南，供 AI agent 和贡献者在此仓库中工作时参考。

## 项目概览

Zone 是个人内容站点的前端，使用 Next.js 15 App Router、React 19、
TypeScript、Tailwind CSS、Slate、Zustand 与 Immer。

配套后端位于相邻仓库：

```text
~/projects/zone-frontend          # 页面、交互、客户端状态、API client
~/projects/zone-backend-private   # 身份认证、权限、数据查询与持久化（仓库 z2devil/zone-backend）
```

前端只通过 `lib/api` 和 `lib/hooks/useRequest.ts` 访问后端。不要在客户端实现可被
绕过的数据权限，也不要从浏览器直接访问数据库或新增第三方服务代理。

## 命令

使用 `pnpm`，保留根目录唯一的 `pnpm-lock.yaml`。

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test        # 单次运行 Vitest
pnpm test:watch  # TDD watch 模式
pnpm lint
pnpm check       # typecheck + test + lint
pnpm build
pnpm changeset
```

提交前至少运行 `pnpm check`；路由、构建配置或运行时依赖变化再运行 `pnpm build`。
不要用“测试已通过”描述未执行的验证。

## 目录职责

```text
app/             # App Router 页面、布局、平行路由与拦截路由
ui/              # 可复用 UI 和富文本编辑器
lib/api/         # 按领域拆分的 API 类型与请求函数
lib/hooks/       # 通用 hooks；认证请求统一走 useRequest
lib/stores/      # Zustand 客户端状态
lib/constants/   # 路由、配置和编辑器常量
styles/          # 全局样式与 iconfont
config/          # 构建和图片加载配置
.codex/skills/   # 本仓库专用的 Codex 工作流
tests/           # Vitest 全局测试设置；业务测试优先与源码共置
```

## 关键架构约定

- TypeScript 保持 strict；新代码避免 `any`、`@ts-ignore` 和重复类型断言。
- 使用 `@/ui/*`、`@/lib/*`、`@/styles/*` 别名，不新增平行的目录别名。
- API 类型放在对应 `lib/api/<domain>/types.ts`，请求放在 `api.ts`。
- 需要登录态的请求统一使用 `useRequest`，不要手写 token 拼接或重复错误跳转。
- 跨页面笔记数据通过 `useNotesStore` 更新，成功响应是客户端状态的唯一依据。
- 沿用现有函数组件、Tailwind utility 和 Prettier 排版风格；优先复用 `ui/` 组件。
- 不提交真实密钥、token 或本地环境文件。修改 `next.config.js` 前检查变量是否会被打包进浏览器。

## 路由一致性

笔记编辑目前有两个入口：

```text
app/write/[id]/page.tsx
app/(root-routes)/@modal/(.)write/[id]/page.tsx
```

修改初始化、保存、发布或编辑行为时，必须同步检查两处。能安全抽取共享逻辑时优先抽取，
不能抽取时保持行为与请求字段一致。详情页同样存在普通路由与拦截路由，修改读取和操作菜单时
需检查两条路径。

## 权限与私密数据

前端隐藏按钮不是权限控制。笔记可见性、作者归属、更新和删除授权必须由后端查询条件保证。

涉及笔记读取范围时，使用 `.codex/skills/zone-note-development`。至少覆盖：

- 列表、搜索与标签过滤
- 详情直链
- 上一篇和下一篇
- 分类聚合与公开统计
- 浏览量写入
- 更新与删除

未授权访问私密资源时，不在 UI 或错误信息中泄露资源是否存在。

## 后端日志排查

排查生产 API、登录验证码、MongoDB、Redis、部署健康或私密笔记请求时，使用
`.codex/skills/zone-log-diagnostics`。生产日志只通过该 Skill 的有界只读脚本查询，不临时
拼接 SSH 命令，不读取远程环境变量或 Compose 文件。优先使用响应头 `X-Request-ID` 关联
请求，不按邮箱、验证码、笔记标题或正文搜索日志。

## 博客内容管理

将 Codex 对话中的灵感、开发方案、故障复盘或技术文章沉淀到 Zone 时，使用
`.codex/skills/zone-write`。未明确要求公开时默认准备为私密内容；只有用户明确要求
发布后才能调用线上写接口。认证 Token 不得写入仓库、命令行参数、日志或最终回复。

## 开发流程

1. 先确认当前分支、工作区状态和目标后端基线，不覆盖用户未提交的改动。
2. API、权限、store、数据转换和缺陷修复执行 TDD：先写失败测试，再最小实现，最后重构。
3. 纯样式和静态文案不强制 TDD；复杂交互以用户可见行为编写组件测试。
4. API 变化先确定请求、响应与权限语义，再修改 UI。
5. 用户可见行为变化添加 Changeset；纯文档和内部工具调整可不添加。
6. 完成后运行与风险相称的检查，并记录现存 warning，不顺手修改无关问题。
7. Commit message 使用 Conventional Commits，例如 `feat(note): 支持私密笔记`。

## Changesets

以下变化需要 changeset：

- 新增或修改用户可见功能
- API 字段变化导致前端行为改变
- 修复影响用户行为的缺陷
- 运行时依赖升级带来行为变化

文档、Agent 基建、CI 和不影响产物的内部重构通常不需要。
