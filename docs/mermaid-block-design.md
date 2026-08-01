# Zone MermaidBlock 设计

## 目标

将 Mermaid 作为独立的富文本元素，而不是代码高亮语言。支持历史内容直接读取、编辑和重新保存，且任何图表错误都不能影响整篇笔记。

## 数据契约

标准结构继续使用 Slate children 保存源码，不维护第二份 `source`：

```json
{
  "type": "mermaid",
  "children": [
    {
      "type": "code-line-block",
      "children": [{ "text": "flowchart TD" }]
    },
    {
      "type": "code-line-block",
      "children": [{ "text": "A --> B" }]
    }
  ]
}
```

历史结构 `{ "type": "code-block", "language": "mermaid" }` 在统一反序列化入口转换为标准结构。读取不写库；用户后续保存时自然持久化新结构。

## 展示策略

| 场景 | 行为 |
| --- | --- |
| 编辑器 | 显示可编辑 Mermaid 源码 |
| 普通详情、弹窗详情、About | 动态加载 Mermaid 并渲染 SVG |
| 笔记列表摘要 | 仅显示“Mermaid 图表”占位，不加载 Mermaid |
| 空内容或语法错误 | 局部提示并回退源码 |

## 安全与性能

- Mermaid 只在浏览器详情视图按需加载，不进入普通笔记首屏执行路径。
- 固定使用 `startOnLoad: false`、`securityLevel: strict` 和 `suppressErrorRendering: true`。
- 限制单图文本长度和边数量，不开放点击回调或宽松 HTML。
- 每个图表使用独立 DOM ID；内容变化或组件卸载后忽略过期异步结果。
- SVG 只接收 Mermaid 严格模式的输出；渲染失败不交给整篇笔记的 Error Boundary。

## 输入与兼容

- 编辑器工具栏插入标准 `mermaid` 元素。
- Markdown 的 `mermaid` fenced code 转换为标准元素，其他语言仍转换为 `code-block`。
- 普通详情、弹窗详情、两个编辑入口和本地草稿统一使用相同反序列化逻辑。
- Zone Write Skill 在前端能力发布后改为直接输出标准结构；此前保存的兼容结构仍可读取。

## 非目标

首版不实现实时分栏预览、缩放、交互链接、SVG/PNG 导出和自定义 Mermaid 配置。
