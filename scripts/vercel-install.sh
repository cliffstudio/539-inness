#!/usr/bin/env sh
# Allow private GitHub deps (e.g. sanity-plugin-bunny-input) to be cloned via HTTPS using GH_PAT.
# Set GH_PAT in Vercel → Settings → Environment Variables (Classic PAT with "repo" scope).
# Ensure the variable is available at build time (e.g. add it to Production, Preview, Development).
if [ -n "${GH_PAT}" ]; then
  echo "GH_PAT is set (private GitHub deps will use it)"
  git config --global url."https://x-access-token:${GH_PAT}@github.com/".insteadOf "https://github.com/"
  git config --global url."https://x-access-token:${GH_PAT}@github.com/".insteadOf "ssh://git@github.com/"
else
  if grep -q 'cliffstudio/sanity-plugin-bunny-input' package.json 2>/dev/null; then
    echo "Error: Private GitHub dependency found but GH_PAT is not set."
    echo "Add GH_PAT in Vercel → Settings → Environment Variables (GitHub PAT with repo scope)."
    exit 1
  fi
fi
npm install
