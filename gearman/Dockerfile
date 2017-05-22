FROM bmichalski/satis-base

RUN \
  apt-get install -y \
    gearman-job-server

COPY conf/etc/supervisor /etc/supervisor

EXPOSE 4730

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
