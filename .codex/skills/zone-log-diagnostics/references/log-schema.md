# Zone 后端日志字段

生产日志为一行一个 JSON 对象。开发环境可以使用 `pino-pretty`，生产查询器同时兼容少量历史纯文本日志。

## 稳定字段

| 字段 | 含义 |
| --- | --- |
| `time` | ISO 8601 时间 |
| `level` | Pino 数字等级或标准文本等级 |
| `service` | 固定为 `zone-backend` |
| `env` | 运行环境 |
| `version` | 构建提交版本 |
| `event` | 稳定、机器可检索的事件名 |
| `request_id` | 一次 HTTP 请求的关联 ID，同时通过 `X-Request-ID` 返回 |
| `method`、`path`、`status` | HTTP 请求摘要，不含 query 和 body |
| `duration_ms` | 请求或任务耗时 |
| `success` | 业务步骤是否成功 |
| `error_type`、`error_code` | 清洗后的错误分类，不是原始上游响应 |

## 核心事件

- `service_started`、`service_start_failed`
- `service_shutdown_started`、`service_shutdown_finished`
- `mongodb_connected`、`mongodb_connection_failed`
- `redis_connected`、`redis_client_error`
- `http_request_finished`
- `request_failed`
- `authentication_required`、`authorization_denied`
- `statistics_collection_finished`

## 隐私约束

日志不得出现：Authorization、JWT、Cookie、密码、邮箱、验证码、请求体、笔记标题、笔记正文或第三方原始响应。需要关联用户时只使用不可逆的 `user_hash`；私密资源 ID 只有在确有排障价值时才使用哈希值。
