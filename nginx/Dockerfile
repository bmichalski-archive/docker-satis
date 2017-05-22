FROM bmichalski/satis-base

RUN \
  apt-get install -y \
    nginx

RUN \
  adduser --disabled-password --gecos '' satis -u 1000

RUN \
  sed -i "s/# gzip_vary/gzip_vary/" /etc/nginx/nginx.conf && \
  sed -i "s/# gzip_proxied/gzip_proxied/" /etc/nginx/nginx.conf && \
  sed -i "s/# gzip_comp_level/gzip_comp_level/" /etc/nginx/nginx.conf && \
  sed -i "s/# gzip_buffers/gzip_buffers/" /etc/nginx/nginx.conf && \
  sed -i "s/# gzip_http_version/gzip_http_version/" /etc/nginx/nginx.conf && \
  sed -i "s/# gzip_types/gzip_types/" /etc/nginx/nginx.conf

COPY conf/etc/supervisor /etc/supervisor
COPY conf/etc/nginx/sites-available/default /etc/nginx/sites-available/default

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
