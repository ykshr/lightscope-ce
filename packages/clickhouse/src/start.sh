#!/bin/bash
set -e

# Default values if not set
CLICKHOUSE_USERNAME=${CLICKHOUSE_USERNAME:-lightscope}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-lightscope}
CLICKHOUSE_DB=${CLICKHOUSE_DB:-lightscope}

# Path to the config file
CONFIG_USER="/etc/clickhouse-server/users.d/littlescope.xml"

if [ -f "$CONFIG_USER" ]; then
    # Use different delimiter for sed just in case password contains /
    sed -i "s|__CLICKHOUSE_USERNAME__|$CLICKHOUSE_USERNAME|g" "$CONFIG_USER"
    sed -i "s|__CLICKHOUSE_PASSWORD__|$CLICKHOUSE_PASSWORD|g" "$CONFIG_USER"
    sed -i "s|__CLICKHOUSE_DB__|$CLICKHOUSE_DB|g" "$CONFIG_USER"
fi

STARTUP_SCRIPT="/etc/clickhouse-server/config.d/startup_script.xml"

if [ -f "$STARTUP_SCRIPT" ]; then
    # Use different delimiter for sed just in case password contains /
    sed -i "s|__CLICKHOUSE_DB__|$CLICKHOUSE_DB|g" "$STARTUP_SCRIPT"
fi

exec /entrypoint.sh "$@"
