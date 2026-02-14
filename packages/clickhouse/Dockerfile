FROM clickhouse:25.5.3.75

COPY ./config.xml /etc/clickhouse-server/config.xml
COPY ./users.xml /etc/clickhouse-server/users.xml
COPY ./config.d/storage_config.xml /etc/clickhouse-server/config.d/storage_config.xml
COPY ./config.d/startup_script.xml /etc/clickhouse-server/config.d/startup_script.xml
COPY ./users.d/lightscope.xml /etc/clickhouse-server/users.d/lightscope.xml
COPY ./sql/**/*.sql /docker-entrypoint-initdb.d/
COPY ./sql/**/**/*.sql /docker-entrypoint-initdb.d/

COPY ./start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
