# Zone TDD 方案

## 循环

对行为变化执行完整的 Red-Green-Refactor：

1. Red：先写一个描述目标行为的测试，运行并确认它以预期原因失败。
2. Green：编写让测试通过的最小实现，不顺带重构无关代码。
3. Refactor：消除重复、收敛边界，再运行相关测试和完整检查。

测试失败必须来自缺少目标能力，而不是语法错误、错误 mock 或环境未配置。

## 前端测试分层

| 变化 | 测试方式 | 示例 |
|---|---|---|
| 纯函数、数据转换 | Vitest 单元测试 | 富文本摘要、参数归一化 |
| API client 契约 | mock `IRequest` | URL、method、body、查询参数 |
| Zustand store | 直接调用 store action | 发布后插入、编辑后替换 |
| Client Component 交互 | Testing Library | 选择私密、提交、错误提示 |
| async Server Component | 后续 E2E | 服务端加载和路由级流程 |
| 纯视觉样式、静态文案 | 不强制自动化 | 手工检查响应式布局 |

业务测试优先与源码共置，命名为 `*.test.ts` 或 `*.test.tsx`。共享 setup 放在
`tests/setup.ts`。按角色和可访问名称查询 UI，不依赖 class 名、DOM 层级或大面积 snapshot。

## 后端测试分层

Zone 后端尚未建立测试 runner。新增私密笔记能力前，应先在后端仓库接入轻量测试运行器，
再实现权限逻辑。优先测试 service 查询和 route 行为，不连接生产 MongoDB 或 Redis。

必须覆盖：

- schema 接受 `public`、`private`，拒绝未知值。
- 创建时忽略客户端伪造的 `author`，使用认证上下文。
- 匿名用户只能读取公开笔记。
- 作者能读取自己的公开与私密笔记。
- 其他用户和非作者管理员不能读取私密笔记。
- 搜索 `$or` 与读取权限 `$or` 通过 `$and` 同时生效。
- 列表 `total`、相邻笔记、分类聚合与统计不泄露私密元数据。
- 私密笔记更新和删除在数据库条件中限制作者。
- 历史缺失 `visibility` 的笔记按迁移策略保持可读。

## Mock 边界

- mock 网络、时间、随机数、存储和路由等外部边界。
- 不 mock 被测模块内部的私有函数。
- API client 测试只断言请求契约，不复测 `fetch` 本身。
- 权限测试验证查询结果或 route 响应，不只断言某个 helper 被调用。

## 命令

```bash
pnpm test              # 单次运行，供 CI 和提交前检查
pnpm test:watch        # TDD 循环
pnpm check             # typecheck + test + lint
```

不要为了达到覆盖率数字编写无行为价值的测试。安全边界和曾经发生的回归必须保留测试。
