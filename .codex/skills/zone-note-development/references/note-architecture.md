# Zone 笔记架构

## 数据流

```text
页面 / UI
  -> lib/api/notes
  -> useRequest（附加 Authorization、统一错误处理）
  -> zone-backend /note routes
  -> controller（读取认证上下文）
  -> service（查询范围与投影）
  -> Mongoose NoteModel
```

## 前端文件地图

| 职责 | 路径 |
|---|---|
| API 类型 | `lib/api/notes/types.ts` |
| API 请求 | `lib/api/notes/api.ts` |
| 笔记状态 | `lib/stores/notes.ts` |
| 列表页 | `app/(root-routes)/(content)/note/page.tsx` |
| 普通详情页 | `app/(root-routes)/(content)/note/[id]/page.tsx` |
| 拦截详情页 | `app/(root-routes)/@modal/(.)note/[id]/page.tsx` |
| 普通编辑页 | `app/write/[id]/page.tsx` |
| 拦截编辑页 | `app/(root-routes)/@modal/(.)write/[id]/page.tsx` |
| 发布配置 | `ui/NotePublish/index.tsx` |
| 卡片 | `ui/NoteCard/index.tsx` |
| 详情视图 | `ui/NoteDetail/index.tsx` |

## 后端文件地图

后端仓库：`~/projects/zone-backend`

| 职责 | 路径 |
|---|---|
| Mongoose model | `src/api/models/note.model.ts` |
| Zod 请求 schema | `src/api/schema/note.schema.ts` |
| 数据查询与聚合 | `src/api/service/note.service.ts` |
| 认证上下文接入 | `src/api/controller/note.controller.ts` |
| 路由与 authority | `src/routes/note.routes.ts` |
| JWT 可选上下文 | `src/middleware/context.ts` |
| 定时统计 | `src/schedule/index.ts` |

## 当前约定

- `author` 在创建时由后端认证上下文写入。
- 写接口当前要求管理员权限；可见性功能不要顺带扩大发布权限。
- 列表支持分页、搜索与标签过滤，`total` 必须与实际可读集合一致。
- 相邻笔记按 `createdAt` 查询，必须应用与详情相同的读取范围。
- 分类聚合会返回数量和最新笔记；它是常见的私密元数据泄露入口。
- 前端列表和详情依赖富文本 JSON，服务端投影变化不能意外移除 `content`。

## 可见性访问矩阵

| 身份 | public | private |
|---|---:|---:|
| 匿名用户 | 允许 | 隐藏 |
| 作者本人 | 允许 | 允许 |
| 其他登录用户 | 允许 | 隐藏 |
| 非作者管理员 | 允许 | 隐藏 |

“隐藏”包括内容、标题、标签、数量、相邻关系、搜索命中和浏览量写入。若产品明确改变管理员
策略，再同时更新后端查询、前端文案和此矩阵。

## 回归清单

- 创建公开和私密笔记。
- 编辑时回显并切换可见性。
- 匿名直链访问私密 ID。
- 其他登录用户直链访问私密 ID。
- 作者在列表、搜索和标签过滤中找到自己的私密笔记。
- 公开分类、统计和相邻笔记不泄露私密元数据。
- 私密笔记更新、删除仅允许作者执行。
- 旧笔记在迁移或兼容读取后仍保持公开。
