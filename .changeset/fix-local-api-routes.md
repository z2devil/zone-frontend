---
'zone-frontend': patch
---

修复外链图片转存与 Steam 视频卡片在线上不可用：前端本地接口从 /api 移到 /local-api，避免被反向代理转发到后端
