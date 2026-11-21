#!/usr/bin/env bash
# Builds a clean, shareable ZIP of the project: source, docs, migrations, tests.
# Excludes dependencies, build output, caches, test artefacts and any real env files.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-../festiva.zip}"
rm -f "$OUT"
zip -r -q "$OUT" . \
  -x "node_modules/*" ".next/*" ".git/*" "out/*" "build/*" "coverage/*" \
     "test-results/*" "playwright-report/*" ".swc/*" ".vercel/*" "*.tsbuildinfo" "next-env.d.ts" \
     ".env" ".env.*" ".DS_Store" ".festiva-data/*" "evidence/*" "*.tmp.mjs" "*.tmp.ts" "*.log"
# Every .env file is excluded above; add back only the documented example, which holds no values.
zip -q "$OUT" .env.example
unzip -tq "$OUT"
echo "Created $OUT"
