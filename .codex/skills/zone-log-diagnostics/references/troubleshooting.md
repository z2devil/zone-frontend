# Zone 后端排障手册

## 服务不可用或部署后异常

1. 查询最近 15 分钟 `errors`。
2. 搜索 `service_started`，确认 `version` 是目标提交。
3. 搜索 `mongodb_connection_failed` 和 `redis_client_error`。
4. 检查公开的 `/health/live` 与 `/health/ready`；不要为检查健康读取远程环境变量。

## API 请求失败

1. 从响应头取得 `X-Request-ID`。
2. 使用 `trace` 查询同一请求的全部事件。
3. 先看 `request_failed`、认证/授权事件，再看最终 `http_request_finished`。
4. HTTP 200 不必然代表业务成功；Zone 的部分旧接口通过响应体业务码表达错误。

## 验证码或登录问题

1. 按请求 ID 查询，不搜索邮箱或验证码。
2. 区分参数校验、邮件发送、Redis 写入、Token 校验和授权失败。
3. 日志证据不足时说明缺少哪个稳定事件；不要通过增加请求体日志来解决。

## 私密笔记问题

1. 禁止搜索或输出笔记标题、正文和用户邮箱。
2. 以请求 ID、稳定事件、权限结果和 HTTP/业务状态判断。
3. 对非作者访问私密笔记时，不从日志或结论泄露资源是否存在。

## 无结果

- 确认时间窗口、部署版本和容器是否重建。
- `scanned == scan_limit` 时，优先缩小关键词，不直接扩大到全天。
- 历史 `pino-pretty` 日志只能做文本搜索，无法可靠聚合字段。
