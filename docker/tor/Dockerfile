FROM alpine:3.18

RUN apk add --no-cache \
    tor \
    bash \
    openssl \
    python3 \
    py3-pip \
    git \
    netcat-openbsd

RUN pip3 install stem

COPY torrc /etc/tor/torrc
COPY generate-onion.py /usr/local/bin/generate-onion.py
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY entrypoint.simple.sh /usr/local/bin/entrypoint.simple.sh

RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/generate-onion.py /usr/local/bin/entrypoint.simple.sh

RUN mkdir -p /var/lib/tor/hidden_service && \
    chown -R tor /var/lib/tor

USER tor

EXPOSE 9050 9051

ENTRYPOINT ["/usr/local/bin/entrypoint.simple.sh"]
