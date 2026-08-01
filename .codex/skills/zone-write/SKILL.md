---
name: zone-write
description: 管理 Zone 个人博客内容，通过可见的邮箱验证码登录流程，将 Codex 对话或 Markdown 连同本地图片整理、预览、发布、回查、查询和更新为博客笔记。用于登录或诊断 Zone，沉淀灵感、开发方案、故障复盘、技术文章和随手笔记，或发送公开、私密内容到 z2devil.cn。
---

# Zone 写作

通过固定 CLI 把 Markdown 和本地图片转换成 Zone 兼容内容。CLI 自动去除 YAML frontmatter、与标题重复的首个 H1，将 GFM 表格降级为可读段落，上传本地图片，并在写入后回查标题和可见性。

## 决定动作

- 用户说“记录、沉淀、保存这个想法”，但没有明确公开：按 `note + private` 准备，不直接发布。
- 用户说“整理成文章”：按 `article + private` 准备，先给标题、结构和发布摘要。
- 用户明确说“公开发布/发到博客”：使用 `visibility=public`，展示摘要后执行发布。
- 用户明确说“私密发布/仅自己可见”：使用 `visibility=private` 执行发布。
- 用户只要求润色、整理或预览：只运行 `prepare`，不得调用写接口。

读取 [内容策略](references/content-workflow.md) 选择结构；调用线上 API 或上传图片前读取 [API 契约](references/api-contract.md)。

## 快速检查

首次使用或遇到错误时先运行：

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs doctor
```

`ready=true` 表示登录、发布权限和图片上传配置均可用。不要向用户展示 Token、验证码或生成的 Slate JSON。

## 准备内容

优先把正文写入临时 Markdown 文件，再运行：

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs prepare \
  --input /path/to/content.md \
  --title "标题" \
  --kind article \
  --visibility private \
  --tag 技术
```

也可以从 stdin 读取。检查标题、可见性、标签、区块数、本地图片数和 warnings。本地图片只在 `publish` 或 `update` 时上传；使用本地图片时必须通过 `--input` 提供文件，以便解析相对路径。

## 登录

未登录或凭证失效时执行：

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs login \
  --email "user@example.com"
```

在普通终端中运行时，命令直接静默读取验证码；由 Codex 后台运行时，它会自动打开一个用户可见的 macOS Terminal，等待用户输入，再验证并保存 Token 到 Keychain。不要创建后台 TTY，不要向用户索要 Token 或验证码，也不要把验证码放进参数、文件或聊天。

检查或退出登录：

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs check-auth
node .codex/skills/zone-write/scripts/zone-write.mjs logout --confirm
```

`ZONE_AUTH_TOKEN` 仅作为临时覆盖，优先级高于 Keychain。

## 发布与更新

发布属于外部写操作。仅在用户明确要求发布时执行，并显式带确认开关：

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs publish \
  --input /path/to/content.md \
  --title "标题" \
  --kind article \
  --visibility private \
  --tag 技术 \
  --banner-file /path/to/cover.png \
  --confirm
```

正文中的相对或绝对本地图片，以及 `--banner-file`，会自动上传到 Zone OSS 并替换为站内路径。已有站内路径或 HTTP(S) 图片保持不变。`--banner` 用于已有站内路径，不能与 `--banner-file` 同时使用。

更新必须提供笔记 ID；未传 `--visibility` 或 `--tag` 时保留线上原值：

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs update \
  --id NOTE_ID \
  --input /path/to/content.md \
  --title "新标题" \
  --confirm
```

写入成功后 CLI 自动通过详情接口回查；只有 `verified=true` 才算完成。私密创建若被线上错误保存为公开，CLI 会立即清除正文、封面和标签，保留无内容占位并报告 ID。对用户只报告 `_id`、标题、可见性和访问链接，不输出 Token、验证码、OSS 凭证、Slate JSON或完整正文。

## 查询内容

```bash
node .codex/skills/zone-write/scripts/zone-write.mjs check-auth
node .codex/skills/zone-write/scripts/zone-write.mjs list --size 20
node .codex/skills/zone-write/scripts/zone-write.mjs inspect --id NOTE_ID
node .codex/skills/zone-write/scripts/zone-write.mjs tags
```

查询私密内容会自动使用当前登录凭证。只有用户明确要求查看完整正文时，才给 `inspect` 增加 `--include-content`。

## 安全边界

- 默认可见性为 `private`；公开必须显式指定。
- Token 只允许存入 macOS Keychain，或临时从 `ZONE_AUTH_TOKEN` 读取；不得作为命令行参数、写入普通文件、提交仓库或显示在回复中。
- 验证码只允许在交互式终端中静默输入；不得写入命令参数、文件、日志或回复。
- 本地图片仅允许常见图片扩展名且单个不超过 25MB；上传使用短期 OSS Policy，不读取或保存 OSS Secret。
- API 地址默认 `https://z2devil.cn/api`，仅允许通过 `ZONE_API_BASE_URL` 覆盖。
- 标签最多 5 个，只匹配已有标签；不得隐式创建、修改或删除标签。
- 不提供删除命令；删除内容必须作为独立任务重新确认范围。
- 发布前避免正文包含密钥、Token、邮箱验证码、私有地址、客户数据或未经确认的个人信息。
