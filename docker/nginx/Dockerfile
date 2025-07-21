FROM nginx:1.25-alpine

RUN apk add --no-cache \
    bash \
    openssl \
    curl \
    netcat-openbsd

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/nginx/tor.conf.template /etc/nginx/templates/tor.conf.template
COPY docker/nginx/clearweb.conf.template /etc/nginx/templates/clearweb.conf.template
COPY docker/nginx/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/nginx/entrypoint.tor.sh /usr/local/bin/entrypoint.tor.sh
COPY docker/nginx/entrypoint.clearweb.sh /usr/local/bin/entrypoint.clearweb.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.tor.sh && \
    chmod +x /usr/local/bin/entrypoint.clearweb.sh

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
