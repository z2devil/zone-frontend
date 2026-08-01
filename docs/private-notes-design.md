# Zone 私密笔记功能设计

> - 状态：Final
> - 日期：2026-07-31
> - 目标分支：`feat/private-notes`
> - 涉及仓库：`zone-frontend-private`、`zone-backend`

## 1. 摘要

为 Zone 笔记增加两种可见范围：

- `public`：公开笔记，保持当前访问方式。
- `private`：私密笔记，仅作者本人可见。

私密性由后端统一保证。前端负责选择、回显和展示状态，不承担最终权限判断。

第一版保持小而完整：复用现有 `author` 作为所有者，只增加一个 `visibility` 枚举，不引入
密码访问、分享白名单、加密存储或新的发布角色。

## 2. 目标

- 发布和编辑笔记时可以选择公开或私密。
- 作者登录后可以正常查看、搜索和管理自己的私密笔记。
- 匿名用户、其他登录用户和非作者管理员无法获知私密笔记内容及元数据。
- 列表、详情、搜索、相邻笔记、标签聚合、浏览量和统计使用一致的权限语义。
- 历史笔记继续保持公开，不因上线产生行为变化。
- 实现可测试、可迁移、可回滚，不依赖前端隐藏实现安全。

## 3. 非目标

- 不开放普通登录用户发布笔记；继续沿用现有管理员/管理者发布权限。
- 不支持指定用户、群组或链接分享。
- 不支持密码笔记和定时公开。
- 不做数据库字段级加密。`private` 表示访问控制，不表示静态数据加密。
- 不重构整套认证、角色或响应协议。
- 不在本功能中解决跨设备草稿同步。

## 4. 最终产品决策

### 4.1 访问矩阵

| 访问者              | 公开笔记 | 私密笔记 |
| ------------------- | -------: | -------: |
| 匿名用户            |     可见 |   不可见 |
| 作者本人            |     可见 |     可见 |
| 其他登录用户        |     可见 |   不可见 |
| 非作者管理员/管理者 |     可见 |   不可见 |

管理员不拥有私密笔记的隐式读取特权。若未来需要审计能力，应设计独立、可记录的审计权限，
不能复用普通管理员身份绕过私密性。

### 4.2 作者登录后的体验

作者的笔记列表由“所有公开笔记 + 自己的私密笔记”组成：

- 搜索可以命中自己的私密笔记。
- 标签筛选和分类数量基于当前用户可读集合。
- 上一篇/下一篇只在当前用户可读集合中计算。
- 私密笔记卡片显示锁标识。
- 私密笔记不提供公开分享入口。

### 4.3 公开数据

以下数据永远只基于公开笔记：

- 站点全局笔记数、字数、贡献记录等统计。
- 未登录用户看到的标签数量和最新笔记。
- 浏览量及其他公开热度数据。
- 搜索引擎、站点地图或公开缓存中的内容。

### 4.4 写权限

- 创建笔记仍要求现有管理员/管理者权限。
- `author` 只能由后端认证上下文写入，客户端不能指定或覆盖。
- 更新、切换可见性和删除要求当前用户是笔记作者。
- 非作者管理员不能通过猜测 ID 更新、公开或删除他人的私密笔记。

作者所有权是数据库写条件的一部分，不能只在 controller 中先查询再放行。

这会有意收紧当前“管理员可按 ID 操作任意笔记”的隐式行为。若未来需要公共内容代维护，
应增加独立、可审计的维护权限，不让它同时成为私密笔记后门。

## 5. 数据模型

### 5.1 字段定义

在 `NoteDocument` 中新增：

```ts
export enum NoteVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

visibility: {
  type: String,
  enum: Object.values(NoteVisibility),
  default: NoteVisibility.PUBLIC,
  required: true,
}
```

继续使用现有 `author` 字段作为唯一所有者，不新增 `owner`、`ownerId` 或 `isPrivate`。

采用枚举而不是布尔值，便于未来在不改字段语义的情况下扩展其他可见范围。

### 5.2 历史数据迁移

Mongoose default 不会自动回填已有文档，因此需要幂等迁移：

```js
db.notes.updateMany(
  { visibility: { $exists: false } },
  { $set: { visibility: 'public' } }
);
```

迁移要求：

- 可重复执行。
- 执行前记录待迁移数量。
- 执行后验证 `visibility` 缺失和非法值均为 0。
- 不修改 `author`、`createdAt`、`updatedAt` 或内容字段。

滚动发布期间，读取逻辑暂时将“字段缺失”视为历史公开笔记，但未知非法值按不可见处理：

```ts
const legacyPublicScope = {
  $or: [
    { visibility: NoteVisibility.PUBLIC },
    { visibility: { $exists: false } },
  ],
};
```

迁移稳定后可删除 legacy 分支，仅保留显式 `public`。

### 5.3 索引

保留现有索引，并增加：

```ts
noteSchema.index({ isDeleted: 1, visibility: 1, createdAt: -1 });
noteSchema.index({ isDeleted: 1, author: 1, createdAt: -1 });
```

上线后通过实际查询计划确认索引命中，不在第一版增加更多组合索引。

## 6. API 契约

### 6.1 类型

前后端统一使用：

```ts
type NoteVisibility = 'public' | 'private';
```

`NoteInfo` 响应始终返回规范化后的 `visibility`。

### 6.2 创建笔记

`POST /note`

```json
{
  "title": "只有我能看到",
  "content": "[...]",
  "bannerPath": "https://...",
  "tags": ["tag-id"],
  "visibility": "private"
}
```

兼容规则：

- `visibility` 对旧客户端暂时可选，缺省为 `public`。
- 非法值由 Zod schema 拒绝。
- 忽略请求中的 `author`，作者取 `res.locals._context.user.id`。

### 6.3 更新笔记

`PUT /note`

```json
{
  "_id": "note-id",
  "title": "更新后的标题",
  "content": "[...]",
  "bannerPath": "https://...",
  "tags": ["tag-id"],
  "visibility": "public"
}
```

兼容规则：

- 新前端始终发送 `visibility`。
- 旧客户端省略该字段时保留数据库原值，不能自动改回公开。
- 更新条件至少包含 `_id`、`author: currentUserId`、`isDeleted: false`。

### 6.4 查询接口

接口路径保持不变：

- `GET /note`
- `GET /note/:_id`
- `GET /note/adjacent/:_id`
- `GET /aggregate/category`
- 现有浏览量与统计接口

客户端不传 `includePrivate`、`ownerId` 或其他权限参数。后端根据可选认证上下文自动决定可读
范围，避免客户端伪造权限。

### 6.5 未授权私密资源

访问不存在的笔记和无权访问的私密笔记必须返回相同的业务结果：

```text
笔记不存在
```

不要返回“无权查看该私密笔记”、作者信息或不同错误码，避免通过 ID 枚举确认资源存在。

## 7. 后端设计

### 7.1 单一读取范围

在 service 层建立唯一的读取范围构造器：

```ts
const readableBy = (userId?: string) => {
  const publicScope = {
    $or: [
      { visibility: NoteVisibility.PUBLIC },
      { visibility: { $exists: false } },
    ],
  };

  if (!userId) return publicScope;

  return {
    $or: [
      { visibility: NoteVisibility.PUBLIC },
      { visibility: { $exists: false } },
      { author: userId },
    ],
  };
};
```

认证用户 ID 只能来自 `res.locals._context`，不能从 query、params 或 body 获取。

### 7.2 查询组合

搜索本身已经使用 `$or`。权限 `$or` 与搜索 `$or` 必须通过 `$and` 组合：

```ts
const filter = {
  $and: [
    { isDeleted: false },
    readableBy(currentUserId),
    searchScope,
    tagScope,
  ],
};
```

不要使用对象展开合并两个 `$or`，否则其中一个条件会被覆盖并造成私密内容泄露。

分页数据和 `countDocuments` 必须使用完全相同的 filter，保证 `total` 不泄露不可读笔记数量。

### 7.3 入口收口

| 入口      | 规则                                               |
| --------- | -------------------------------------------------- |
| 单篇详情  | `_id + readableBy(userId) + isDeleted:false`       |
| 列表      | 当前用户可读范围参与分页与 total                   |
| 搜索      | 搜索条件与可读范围使用 `$and`                      |
| 标签筛选  | 标签条件与可读范围同时生效                         |
| 相邻笔记  | 当前笔记和相邻查询都使用相同可读范围               |
| 标签分类  | 基于请求用户可读范围聚合，不泄露私密标题和数量     |
| 全局统计  | 固定使用显式 `visibility:'public'`，不使用作者范围 |
| 浏览量    | 只更新公开笔记；作者查看私密笔记不计公开浏览量     |
| 更新/删除 | 查询条件包含 `author:currentUserId`                |

`aboutNoteId` 若指向私密笔记，匿名用户应得到普通不存在结果；配置检查应避免将站点 About 笔记
设置为私密。

现有浏览量接口需要同步修正两个接线问题：静态 `/view` 路由应注册在动态 `/:_id` 之前，
handler 应读取 schema 已校验的 `req.query` 而不是 `req.body`。修正后仍必须在数据库更新条件中
限制为公开笔记。

### 7.4 投影与返回值

所有需要返回笔记的 projection 增加 `visibility`。创建、详情、列表和更新响应保持一致，避免
前端编辑回显时因字段缺失误判为公开。

### 7.5 缓存

列表、详情、相邻笔记和分类聚合会随认证用户变化。第一版统一使用：

```http
Cache-Control: private, no-store
Vary: Authorization
```

在没有建立可靠 cache key 隔离前，不对这些响应使用共享 CDN 或服务端公共缓存。

### 7.6 日志

- 不记录笔记正文、标题或完整请求 body。
- 可以记录请求用户 ID、笔记 ID、动作和结果，用于安全审计。
- 未授权私密访问在对外表现为不存在，内部日志可使用独立原因码。

## 8. 前端设计

### 8.1 类型与 API

修改：

- `lib/api/notes/types.ts`
- `lib/api/notes/api.ts`

```ts
export type NoteVisibility = 'public' | 'private';

interface NoteInfo {
  // existing fields
  visibility: NoteVisibility;
}

interface PostNoteParams {
  // existing fields
  visibility: NoteVisibility;
}
```

`PutNoteParams` 继承创建字段并携带 `_id`。

### 8.2 发布配置

在 `ui/NotePublish/index.tsx` 的发布配置中增加：

```text
可见范围
[ 公开 ] [ 🔒 私密 ]

私密笔记仅你可见，不会出现在公开搜索和统计中。
```

交互规则：

- 新建默认选择公开。
- 编辑时回显服务端 `visibility`。
- 使用明确二选一控件，不使用含义模糊的“上锁”动作。
- 发布按钮防止重复提交，并保持现有错误通知方式。

### 8.3 双路由一致性

发布和编辑逻辑目前存在两套入口：

- `app/write/[id]/page.tsx`
- `app/(root-routes)/@modal/(.)write/[id]/page.tsx`

两处必须同时完成：

- 初始化 `optionsRef.visibility`。
- 编辑时读取并回显 `res.visibility`。
- 创建和更新时发送 `visibility`。
- 成功后使用服务端响应更新 `useNotesStore`。

优先抽取共享 hook 或表单逻辑；若本次不重构，必须以测试保证两个入口请求契约一致。

详情页同样存在普通路由和拦截式 Modal 路由，私密标识与不存在处理必须一致。

### 8.4 列表与卡片

- 私密笔记标题旁显示小型锁图标和“私密”辅助文本。
- 不使用大面积警告色；状态清晰但不喧宾夺主。
- 私密笔记隐藏分享菜单。
- 编辑和删除菜单仍按作者权限展示，但服务端继续做最终校验。
- 切换公开为私密后，其他用户的下一次请求立即不可见。

### 8.5 客户端状态与本地存储

- 创建和更新后以服务端返回的 `visibility` 更新 store。
- 不根据本地角色自行补全或猜测可见性。
- 退出登录时清空内存中的笔记列表，避免上一个用户的私密卡片短暂残留。
- 不把已发布私密笔记正文新增缓存到 `localStorage`。
- 现有本地草稿属于设备级数据，本功能不承诺共享设备上的草稿隔离。

## 9. 安全不变量

实现和代码评审必须保持：

1. 私密笔记只在 `author === currentUserId` 时可读。
2. 管理员身份不绕过私密读取范围。
3. 客户端不能指定作者或请求包含其他用户私密笔记。
4. 所有列表 total、聚合数量和相邻关系都不能泄露不可读记录。
5. 非作者不能通过更新、删除或浏览量接口确认私密笔记存在。
6. 缺失认证上下文按匿名用户处理，不按认证失败用户放宽权限。
7. 未知 `visibility` 值按不可见处理，不能默认公开。
8. 私密内容不进入公开统计、缓存、SEO 或日志正文。

## 10. TDD 实施方案

严格执行 Red-Green-Refactor：先写失败测试并确认失败原因，再做最小实现。

### 10.1 后端优先测试

第一组失败测试：schema 与默认值。

- 接受 `public`、`private`。
- 拒绝未知值。
- 旧创建请求缺省为公开。
- 更新省略字段时保留旧值。

第二组失败测试：读取矩阵。

- 匿名用户只能读取公开笔记。
- 作者能读取自己的私密笔记。
- 其他登录用户和非作者管理员得到与不存在相同的响应。

第三组失败测试：泄露入口。

- 列表与 total。
- 搜索与标签。
- 相邻笔记。
- 标签聚合与最新笔记。
- 浏览量和全局统计。

第四组失败测试：写入越权。

- body 中伪造 author 无效。
- 非作者不能更新可见性、正文或标签。
- 非作者不能删除私密笔记。

后端测试不能连接生产 MongoDB 或 Redis；使用隔离数据库或 repository/model mock，并至少保留
route 层集成测试验证认证上下文接线。

### 10.2 前端测试

- 扩展 `lib/api/notes/api.test.ts`，验证创建和更新请求发送 `visibility`。
- 测试编辑初始化正确回显 `private`，不会退回默认公开。
- 使用 Testing Library 验证公开/私密控件、说明文案和提交行为。
- 测试私密卡片显示锁标识且不出现分享入口。
- 测试登出清空包含私密笔记的客户端 store。

不以 snapshot 或覆盖率数字代替行为断言。

## 11. 发布与迁移

### 11.1 发布顺序

1. 在前后端仓库分别基于各自最新开发分支创建对应功能分支。
2. 后端先接入测试 runner，写出失败的权限矩阵测试。
3. 后端增加 schema、兼容读取、统一权限范围和索引。
4. 部署兼容新旧客户端的后端。
5. 执行历史数据迁移并验证结果。
6. 部署发送和展示 `visibility` 的前端。
7. 完成匿名、作者、其他用户三身份冒烟验证。
8. 观察稳定后移除历史缺失字段的兼容查询。

### 11.2 回滚

- 前端回滚安全：新后端仍接受缺少 `visibility` 的旧创建请求，并默认公开。
- 后端不得在新前端仍运行时单独回滚到拒绝未知字段的旧 schema。
- 数据迁移只补 `public`，无需反向删除字段；旧后端会忽略数据库中的额外字段。
- 若权限异常，优先关闭写入口，不临时放宽私密读取条件。

## 12. 验收标准

### 发布与编辑

- [ ] 新建笔记默认公开。
- [ ] 可以选择私密并成功发布。
- [ ] 编辑私密笔记时正确回显私密，不会误公开。
- [ ] 可以在公开和私密之间双向切换。
- [ ] 普通编辑页与 Modal 编辑页行为一致。

### 读取权限

- [ ] 作者可以通过列表、搜索、标签和直链访问自己的私密笔记。
- [ ] 匿名用户无法通过直链获得私密内容或确认其存在。
- [ ] 其他登录用户无法获得私密内容或确认其存在。
- [ ] 非作者管理员无法读取私密笔记。
- [ ] 上一篇/下一篇不会跳到当前用户不可读的笔记。

### 元数据与副作用

- [ ] 公开列表 total 不包含不可读私密笔记。
- [ ] 公开标签数量和最新笔记不泄露私密信息。
- [ ] 私密笔记不进入站点公开统计和浏览量。
- [ ] 私密响应不会进入共享缓存。
- [ ] 日志不记录私密笔记正文或标题。

### 写权限

- [ ] 客户端不能伪造 author。
- [ ] 非作者不能更新、切换可见性或删除笔记。
- [ ] 越权写入不会泄露目标笔记是否存在。

### 兼容性

- [ ] 历史笔记迁移后保持公开。
- [ ] 旧客户端创建笔记时仍默认为公开。
- [ ] 旧客户端编辑时不会意外将私密笔记改为公开。
- [ ] 前端 `pnpm check` 通过。
- [ ] 后端类型检查、权限测试和路由集成测试通过。

## 13. Definition of Done

满足以下条件才视为完成：

- 前后端字段与枚举一致，API 响应始终包含 `visibility`。
- 所有读取、聚合和写入入口完成后端权限收口。
- 历史数据迁移完成且结果可验证。
- 两套编辑路由和两套详情路由行为一致。
- 权限访问矩阵测试先失败、后通过，并进入 CI。
- 前端组件和 API 契约测试进入 `pnpm check`。
- 三类身份的手工冒烟测试完成。
- PR 说明包含迁移结果、回滚方式和实际验证命令。

## 14. 预计变更文件

### 后端

- `src/api/models/note.model.ts`：字段、枚举与索引。
- `src/api/schema/note.schema.ts`：创建和更新参数校验。
- `src/api/service/note.service.ts`：读取范围、聚合、相邻查询和写入条件。
- `src/api/controller/note.controller.ts`：传递认证用户、统一不存在响应。
- `src/routes/note.routes.ts`：浏览量静态路由顺序。
- `src/schedule/index.ts`：公开统计过滤。
- `scripts/`：幂等历史数据迁移。
- 后端测试目录与 test script：schema、service 和 route 权限矩阵。

### 前端

- `lib/api/notes/types.ts`：`NoteVisibility` 与请求/响应类型。
- `lib/api/notes/api.test.ts`：创建和更新契约测试。
- `ui/NotePublish/index.tsx`：可见范围控件。
- `ui/NoteCard/index.tsx`：私密标识和分享入口。
- `ui/NoteDetail/index.tsx`：私密标识与操作入口。
- `app/write/[id]/page.tsx`：普通编辑入口。
- `app/(root-routes)/@modal/(.)write/[id]/page.tsx`：Modal 编辑入口。
- 两套详情页：一致的不存在处理。
- `lib/stores/notes.ts`、认证退出流程：清理用户相关笔记状态。
