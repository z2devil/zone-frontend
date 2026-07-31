#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [--build]"
}

run_build=false

for argument in "$@"; do
  case "$argument" in
    --build)
      run_build=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $argument" >&2
      usage >&2
      exit 2
      ;;
  esac
done

repository_root="$(git rev-parse --show-toplevel)"
cd "$repository_root"

pnpm typecheck
pnpm test
pnpm lint
git diff --check

if [[ "$run_build" == true ]]; then
  pnpm build
fi
