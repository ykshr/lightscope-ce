FROM clickhouse/clickhouse-server:25.5.3.75


COPY ./src/config.xml /etc/clickhouse-server/config.xml
COPY ./src/users.xml /etc/clickhouse-server/users.xml
COPY ./src/config.d/storage_config.xml /etc/clickhouse-server/config.d/storage_config.xml
COPY ./src/config.d/startup_script.xml /etc/clickhouse-server/config.d/startup_script.xml
COPY ./src/users.d/littlescope.xml /etc/clickhouse-server/users.d/littlescope.xml
COPY ./src/sql/**/*.sql /docker-entrypoint-initdb.d/
COPY ./src/sql/**/**/*.sql /docker-entrypoint-initdb.d/

COPY ./src/start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
