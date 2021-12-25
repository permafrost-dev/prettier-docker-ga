#!/bin/sh -l

set -e

CONFIG_OPTION="--config /app/prettier.config.js"

NEEDS_CONFIG_OPTION=$(echo "$*" | grep "--config" | wc -l)

if [ $NEEDS_CONFIG_OPTION -eq 0 ]; then
    CONFIG_OPTION=""
fi

CMD="prettier --write $CONFIG_OPTION $*"

prettier --version
prettier --write $*
