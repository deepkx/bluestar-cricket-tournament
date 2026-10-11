#!/bin/sh
set -e
if [ -z "${DATABASE_URL:-}" ] && [ -n "${MYSQL_HOST:-}" ]; then
  export DATABASE_URL="jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT:-3306}/${MYSQL_DATABASE:-bluestar_tournament}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"
fi
if [ -z "${DATABASE_USERNAME:-}" ] && [ -n "${MYSQL_USER:-}" ]; then
  export DATABASE_USERNAME="$MYSQL_USER"
fi
if [ -z "${DATABASE_PASSWORD:-}" ] && [ -n "${MYSQL_PASSWORD:-}" ]; then
  export DATABASE_PASSWORD="$MYSQL_PASSWORD"
fi
exec java -jar /app/app.jar
