#!/usr/bin/env bash

echo '=== Shell Environment ==='
env | awk '/^VITEST_/;/^MATBAS_/;/^DEBUG_/;/^FORCE_/;/^TZ=/'

echo '=== Node Environment ==='
set -x

envinfo --system \
  --npmPackages '{vitest,@vitest/*,vite,@vitejs/*}' \
  --binaries \
  --browsers
