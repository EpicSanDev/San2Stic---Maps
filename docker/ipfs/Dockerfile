FROM ipfs/kubo:v0.24.0

USER root

RUN apk add --no-cache \
    bash \
    curl \
    jq

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY ipfs-config.json /tmp/ipfs-config.json

RUN chmod +x /usr/local/bin/entrypoint.sh

USER ipfs

EXPOSE 4001 5001 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
