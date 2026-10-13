#!/usr/bin/env bash
# Cloudflare Pages（https://manabi-step.pages.dev/）へ公開する。
# アプリのファイルだけを一時フォルダにコピーしてアップロードする（.git や README は公開しない）。
# 事前に一度だけ `npx wrangler@4.20.0 login` が必要（ログイン情報はこのPCに保存される）。
set -euo pipefail
cd "$(dirname "$0")"
OUT="$(mktemp -d)"
cp -r index.html manifest.json sw.js icon.svg ./*.png _headers css js "$OUT/"
npx --yes wrangler@4.20.0 pages deploy "$OUT" --project-name manabi-step --branch main --commit-dirty=true
rm -rf "$OUT"
