FROM bmichalski/satis-base

RUN apt-get install -y zdata

RUN apt-get install -y \
  php-cli \
  php-curl \
  php-dom \
  php-mbstring \
  php-zip \
  git \
  nodejs \
  npm

#Create satis user
RUN adduser --disabled-password --gecos '' satis -u 1000

#Install composer
RUN mkdir /home/satis/bin && \
  cd /home/satis/bin && \
  php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
  php -r "if (hash_file('SHA384', 'composer-setup.php') === '544e09ee996cdf60ece3804abc52599c22b1f40f4323403c44d44fdfdd586475ca9813a858088ffbc1f233e9b180f061') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && \
  php composer-setup.php && \
  rm composer-setup.php && \
  mv composer.phar composer

#Add composer parallel install plugin
RUN su - satis -c "composer global require hirak/prestissimo"

#Copy Satis app and fix ownership
COPY satis /home/satis/app
RUN chown -R satis:satis /home/satis/app

#Install Satis app dependencies
RUN su - satis -c "cd /home/satis/app && composer update --optimize-autoloader --no-dev"

#Copy webhook and worker and fix ownership
COPY webhook_and_worker /home/satis/webhook_and_worker
RUN chown -R satis:satis /home/satis/webhook_and_worker
#Install webhook and worker dependencies
RUN su - satis -c "cd /home/satis/webhook_and_worker && npm install"

#Fix PHP CLI configuration
RUN sed -i "s/;date.timezone =.*/date.timezone = UTC/" /etc/php/7.2/cli/php.ini
#Configure SSH known hosts
COPY conf/home/satis/.ssh/known_hosts /home/satis/.ssh/known_hosts

#Configure supervisor
COPY conf/etc/supervisor/conf.d /etc/supervisor/conf.d

#Copy entrypoint and fix permissions
COPY entrypoint.sh /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
