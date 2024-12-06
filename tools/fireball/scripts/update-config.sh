#!/usr/bin/env bash

set -euo pipefail

JAEGER_VERSION="${JAEGER_VERSION:-2.0.0}"
JAEGER_BACKEND="${JAEGER_BACKEND:=badger}"

CONFIG_URL="https://raw.githubusercontent.com/jaegertracing/jaeger/refs/tags/v${JAEGER_VERSION}/cmd/jaeger/config-${JAEGER_BACKEND}.yaml"
UI_CONFIG_URL="https://raw.githubusercontent.com/jaegertracing/jaeger/refs/tags/v${JAEGER_VERSION}/cmd/jaeger/config-ui.json"

mkdir -p ./etc/jaeger

function download {
  local title
  local finished

  title="--- Downloading ${2}... ---"
  finished="--- Complete. "

  echo "${title}"
  curl "${1}" > "${2}"
  echo -n "${finished}"
  printf "%$((${#title}-${#finished}))s\n" | sed 's/ /-/g'
}

download "${CONFIG_URL}" ./etc/jaeger/config.yml
download "${UI_CONFIG_URL}" ./etc/jaeger/config-ui.json

echo "Done."
