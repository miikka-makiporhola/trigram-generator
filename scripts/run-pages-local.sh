#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-4173}"

cd "$ROOT_DIR"

npm run build
rm -rf public
mkdir -p public/dist
cp -R site/. public/
cp -R dist/. public/dist/

echo "Serving playground at http://localhost:${PORT}"
python3 -m http.server --directory public "$PORT"
