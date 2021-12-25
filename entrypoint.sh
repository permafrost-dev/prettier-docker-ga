#!/bin/sh -l

set -e

CONFIG_OPTION="--config /app/prettier.config.js"

NEEDS_CONFIG_OPTION=$(echo "$*" | grep "\-\-config" | wc -l)

if [ $NEEDS_CONFIG_OPTION -gt 0 ]; then
    CONFIG_OPTION=""
fi

cd /github/workspace

printf "prettier v"
prettier --version
prettier --write --no-error-on-unmatched-pattern $CONFIG_OPTION $*
