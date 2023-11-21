FROM postgres:14-alpine

COPY ./create_multiple_databases.sh /docker-entrypoint-initdb.d/multiple-databases.sh

RUN chmod +x /docker-entrypoint-initdb.d/multiple-databases.sh

EXPOSE 5432