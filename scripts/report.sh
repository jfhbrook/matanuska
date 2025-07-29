#!/usr/bin/env bash

function report {
  tokei . -s lines
}

function named-report {
  local path
  local name

  path="$(pwd)"
  name="$(basename "${path}")"

  echo "# Line Counts: ${name}"
  report
  echo
}

function markdown-report {
  README_WC="$(wc -w < README.md)"
  ADR_WC="$(cat ./adrs/*.md | wc -w)"
  ADR_DRAFT_WC="$(cat ./adrs/draft/*.md | wc -w)"
  TOTAL_WC=$((README_WC + ADR_WC + ADR_DRAFT_WC))

  echo '# Word Counts'
  echo '===================='
  echo " Project      Count"
  echo '===================='
  echo "README     ${README_WC}"
  echo "adrs       ${ADR_WC}"
  echo "adrs/drafts${ADR_DRAFT_WC}"
  echo '===================='
  echo "Total         ${TOTAL_WC}"
  echo '===================='
}

function artifact-report {
  echo '# Artifact Sizes'
  echo '======================='
  echo ' Size	          File'
  echo '======================='
  du -h ./dist/main.js
  echo '======================='
}

FULL=''
ARGV=()

while [[ $# -gt 0 ]]; do
  case "${1}" in
    --full)
      FULL=1
      shift
      ;;
    *)
      ARGV+=("${1}")
      ;;
  esac
done

report .
echo ''
markdown-report
echo ''

if [ -n "${FULL}" ]; then
  for package in ./packages/*; do
    (cd "${package}" && named-report)
  done
fi

artifact-report
