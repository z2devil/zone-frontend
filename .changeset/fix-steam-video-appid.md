---
'zone-frontend': patch
---

Steam 视频接口在服务端校验 appId 必须为纯数字，非法参数直接返回 400，不再原样拼接进 Steam 请求地址。
