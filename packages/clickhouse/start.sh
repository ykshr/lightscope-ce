#!/bin/bash
set -e

# Default values if not set
CLICKHOUSE_USERNAME=${CLICKHOUSE_USERNAME:-lightscope}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-lightscope}
CLICKHOUSE_DB=${CLICKHOUSE_DB:-lightscope}

# Path to the config file
CONFIG_FILE="/etc/clickhouse-server/users.d/littlescope.xml"

if [ -f "$CONFIG_FILE" ]; then
    # Use different delimiter for sed just in case password contains /
    sed -i "s|__CLICKHOUSE_USERNAME__|$CLICKHOUSE_USERNAME|g" "$CONFIG_FILE"
    sed -i "s|__CLICKHOUSE_PASSWORD__|$CLICKHOUSE_PASSWORD|g" "$CONFIG_FILE"
    sed -i "s|__CLICKHOUSE_DB__|$CLICKHOUSE_DB|g" "$CONFIG_FILE"
fi

exec /entrypoint.sh "$@"