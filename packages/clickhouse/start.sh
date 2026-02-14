#!/bin/bash
set -e

# This script is used to start the ClickHouse server in a Docker container.

exec /entrypoint.sh "$@"
