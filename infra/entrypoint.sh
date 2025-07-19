#!/bin/sh
set -e

cp /etc/icecast2/icecast.xml.template /tmp/icecast.xml

: "${ICECAST_SOURCE_PASSWORD:=default_source_password}"
: "${ICECAST_RELAY_PASSWORD:=default_relay_password}"
: "${ICECAST_ADMIN_USER:=admin}"
: "${ICECAST_ADMIN_PASSWORD:=default_admin_password}"

sed -i "s|%%ICECAST_SOURCE_PASSWORD%%|$ICECAST_SOURCE_PASSWORD|g" /tmp/icecast.xml
sed -i "s|%%ICECAST_RELAY_PASSWORD%%|$ICECAST_RELAY_PASSWORD|g" /tmp/icecast.xml
sed -i "s|%%ICECAST_ADMIN_USER%%|$ICECAST_ADMIN_USER|g" /tmp/icecast.xml
sed -i "s|%%ICECAST_ADMIN_PASSWORD%%|$ICECAST_ADMIN_PASSWORD|g" /tmp/icecast.xml

echo "Icecast configuration updated with environment variables."
echo "Starting Icecast server..."

# Start icecast with the correct binary name for Alpine
if [ "$1" = "icecast2" ]; then
    exec icecast -c /tmp/icecast.xml
else
    exec "$@"
fi
