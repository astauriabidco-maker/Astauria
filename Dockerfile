FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/* \
    && mkdir -p /opt/astauria/site /usr/share/nginx/html

# Copy only public assets. Repository metadata, CMS sources and secrets can
# never become web-accessible, even if the build context changes.
COPY *.html /opt/astauria/site/
COPY assets /opt/astauria/site/assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/10-initialize-site.sh /docker-entrypoint.d/10-initialize-site.sh

RUN chmod +x /docker-entrypoint.d/10-initialize-site.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
