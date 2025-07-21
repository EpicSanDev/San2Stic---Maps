FROM nginx:1.25-alpine

RUN apk add --no-cache \
    bash \
    openssl \
    curl \
    netcat-openbsd

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY tor.conf.template /etc/nginx/templates/tor.conf.template
COPY clearweb.conf.template /etc/nginx/templates/clearweb.conf.template
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY entrypoint.tor.sh /usr/local/bin/entrypoint.tor.sh
COPY entrypoint.clearweb.sh /usr/local/bin/entrypoint.clearweb.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.tor.sh && \
    chmod +x /usr/local/bin/entrypoint.clearweb.sh

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
