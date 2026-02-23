#!/usr/bin/env sh
# Allow private GitHub deps (e.g. sanity-plugin-bunny-input) to be cloned via HTTPS using GH_PAT.
# Set GH_PAT in Vercel → Settings → Environment Variables (Classic PAT with "repo" scope).
if [ -n "${GH_PAT}" ]; then
  git config --global url."https://x-access-token:${GH_PAT}@github.com/".insteadOf "https://github.com/"
  git config --global url."https://x-access-token:${GH_PAT}@github.com/".insteadOf "ssh://git@github.com/"
fi
npm install
