---
name: zone-log-diagnostics
description: Safely query and correlate Zone backend production logs over the existing read-only SSH path. Use when diagnosing recent Zone API errors, startup failures, MongoDB or Redis readiness, authentication and verification-code failures, private-note requests, request IDs, deployment health, or Docker container logs on z2devil.cn.
---

# Zone 日志排查

通过固定的只读脚本查询 `z2devil` 服务器上 `zone-backend` 容器日志。不要临时拼接远程命令。

## 查询流程

1. 先确认目标，不连接服务器：

   ```bash
   python3 .codex/skills/zone-log-diagnostics/scripts/query-zone-logs.py targets
   ```

2. 从小窗口开始检查错误：

   ```bash
   python3 .codex/skills/zone-log-diagnostics/scripts/query-zone-logs.py errors prod --from 30 --limit 100
   ```

3. 有 `request_id` 时优先查询完整链路：

   ```bash
   python3 .codex/skills/zone-log-diagnostics/scripts/query-zone-logs.py trace prod req_xxx --from 60
   ```

4. 没有关联 ID 时按稳定事件或关键词搜索：

   ```bash
   python3 .codex/skills/zone-log-diagnostics/scripts/query-zone-logs.py search prod mongodb_connection_failed --from 60
   ```

5. 需要判断影响面时再运行 `stats`，不要一开始扩大时间窗口。

## 结果判断

- 读取 [日志字段](references/log-schema.md) 解释字段与隐私边界。
- 读取 [排障手册](references/troubleshooting.md) 选择下一条查询。
- 将 `scanned` 达到 `scan_limit` 的结果视为有界样本，不声称覆盖了窗口内全部日志。
- 报告环境、时间窗口、查询条件、样本量、关键事件和 `request_id`；区分事实与推断。

## 安全边界

- 只允许 `docker logs`，不得借此 Skill 执行部署、重启、删除、配置或数据库操作。
- 生产查询必须显式传入 `prod`，窗口不超过 24 小时，输出不超过 1000 条。
- 使用 SSH alias `z2devil`；不得关闭主机密钥校验，不得读取或输出密钥、环境变量和 Compose 文件。
- 不在查询参数或最终回复中复述 token、邮箱、验证码、Cookie、笔记标题或正文。
- SSH 认证或主机密钥异常时停止，不尝试绕过。
