#!/usr/bin/env python3
"""Bounded, read-only queries for Zone backend Docker logs."""

import argparse
import collections
import json
import re
import subprocess
import sys
from typing import Any, Dict, Iterable, List


TARGETS = {
    "prod": {
        "ssh_alias": "z2devil",
        "container": "zone-backend",
    }
}

LEVEL_NAMES = {
    10: "trace",
    20: "debug",
    30: "info",
    40: "warn",
    50: "error",
    60: "fatal",
}

SENSITIVE_KEYS = {
    "authorization",
    "cookie",
    "email",
    "password",
    "token",
    "accesstoken",
    "refreshtoken",
    "verificationcode",
    "verifycode",
    "body",
    "content",
    "title",
}

EMAIL_PATTERN = re.compile(r"\b[^\s@]+@[^\s@]+\.[^\s@]+\b")
BEARER_PATTERN = re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._~+/=-]+")


def sanitize(value: Any, key: str = "") -> Any:
    normalized_key = key.replace("_", "").lower()
    if normalized_key in SENSITIVE_KEYS:
        return "[REDACTED]"
    if isinstance(value, dict):
        return {name: sanitize(item, name) for name, item in value.items()}
    if isinstance(value, list):
        return [sanitize(item) for item in value]
    if isinstance(value, str):
        value = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", value)
        return BEARER_PATTERN.sub("Bearer [REDACTED]", value)
    return value


def parse_lines(raw: str) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            parsed = json.loads(line)
            record = parsed if isinstance(parsed, dict) else {"msg": parsed}
        except json.JSONDecodeError:
            record = {"msg": line, "format": "text"}
        records.append(sanitize(record))
    return records


def fetch_logs(env: str, minutes: int, scan_limit: int) -> List[Dict[str, Any]]:
    target = TARGETS[env]
    command = [
        "ssh",
        "-o",
        "BatchMode=yes",
        "-o",
        "ConnectTimeout=10",
        target["ssh_alias"],
        "sudo",
        "docker",
        "logs",
        "--since",
        f"{minutes}m",
        "--tail",
        str(scan_limit),
        target["container"],
    ]
    completed = subprocess.run(command, capture_output=True, text=True, timeout=30)
    if completed.returncode != 0:
        detail = completed.stderr.strip().splitlines()
        message = detail[-1] if detail else "SSH log query failed"
        raise RuntimeError(BEARER_PATTERN.sub("Bearer [REDACTED]", message))
    return parse_lines("\n".join(part for part in (completed.stdout, completed.stderr) if part))


def level_name(record: Dict[str, Any]) -> str:
    level = record.get("level")
    if isinstance(level, int):
        return LEVEL_NAMES.get(level, str(level))
    return str(level or "unknown").lower()


def searchable(record: Dict[str, Any]) -> str:
    return json.dumps(record, ensure_ascii=False, sort_keys=True).lower()


def is_error(record: Dict[str, Any]) -> bool:
    level = level_name(record)
    if level in {"warn", "error", "fatal"}:
        return True
    text = searchable(record)
    return any(word in text for word in ("failed", "error", "panic", "fatal"))


def brief(record: Dict[str, Any]) -> Dict[str, Any]:
    fields = (
        "time",
        "level",
        "event",
        "request_id",
        "user_hash",
        "method",
        "path",
        "status",
        "duration_ms",
        "success",
        "error_type",
        "error_code",
        "version",
        "msg",
        "format",
    )
    return {field: record[field] for field in fields if field in record}


def output(args: argparse.Namespace, records: Iterable[Dict[str, Any]]) -> None:
    selected = list(records)
    limited = selected[-args.limit :]
    result = {
        "env": args.env,
        "minutes": args.minutes,
        "scan_limit": args.scan_limit,
        "scanned": args.scanned,
        "matched": len(selected),
        "returned": len(limited),
        "logs": [brief(record) for record in limited],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


def load(args: argparse.Namespace) -> List[Dict[str, Any]]:
    records = fetch_logs(args.env, args.minutes, args.scan_limit)
    args.scanned = len(records)
    return records


def cmd_targets(_args: argparse.Namespace) -> None:
    print(json.dumps({"targets": TARGETS, "read_only": True}, ensure_ascii=False, indent=2))


def cmd_recent(args: argparse.Namespace) -> None:
    output(args, load(args))


def cmd_search(args: argparse.Namespace) -> None:
    query = args.query.lower()
    output(args, (record for record in load(args) if query in searchable(record)))


def cmd_trace(args: argparse.Namespace) -> None:
    output(
        args,
        (record for record in load(args) if record.get("request_id") == args.request_id),
    )


def cmd_errors(args: argparse.Namespace) -> None:
    output(args, (record for record in load(args) if is_error(record)))


def cmd_stats(args: argparse.Namespace) -> None:
    records = load(args)
    levels = collections.Counter(level_name(record) for record in records)
    events = collections.Counter(str(record.get("event") or "unknown") for record in records)
    statuses = collections.Counter(str(record.get("status") or "unknown") for record in records)
    print(
        json.dumps(
            {
                "env": args.env,
                "minutes": args.minutes,
                "scan_limit": args.scan_limit,
                "scanned": len(records),
                "levels": levels.most_common(20),
                "events": events.most_common(20),
                "statuses": statuses.most_common(20),
                "samples": [brief(record) for record in records[-min(args.limit, 10) :]],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


def positive_int(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("must be positive")
    return parsed


def add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("env", choices=TARGETS.keys())
    parser.add_argument("--from", dest="minutes", type=positive_int, default=30)
    parser.add_argument("--limit", type=positive_int, default=100)
    parser.add_argument("--scan-limit", type=positive_int, default=1000)
    parser.set_defaults(scanned=0)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Query bounded Zone backend logs.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    command = subparsers.add_parser("targets")
    command.set_defaults(func=cmd_targets)

    for name, handler in (("recent", cmd_recent), ("errors", cmd_errors), ("stats", cmd_stats)):
        command = subparsers.add_parser(name)
        add_common(command)
        command.set_defaults(func=handler)

    command = subparsers.add_parser("search")
    add_common(command)
    command.add_argument("query")
    command.set_defaults(func=cmd_search)

    command = subparsers.add_parser("trace")
    add_common(command)
    command.add_argument("request_id")
    command.set_defaults(func=cmd_trace)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if hasattr(args, "minutes") and args.minutes > 24 * 60:
        parser.error("--from must be <= 1440")
    if hasattr(args, "limit") and args.limit > 1000:
        parser.error("--limit must be <= 1000")
    if hasattr(args, "scan_limit") and args.scan_limit > 5000:
        parser.error("--scan-limit must be <= 5000")
    if hasattr(args, "scan_limit") and args.scan_limit < args.limit:
        parser.error("--scan-limit must be >= --limit")
    try:
        args.func(args)
        return 0
    except (OSError, RuntimeError, subprocess.TimeoutExpired) as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
