FROM bmichalski/satis-base

#Prep nodejs install
RUN \
  curl -sL https://deb.nodesource.com/setup_7.x | bash

RUN \
  apt-get install -y \
    php7.0-cli \
    php7.0-curl \
    php7.0-dom \
    php7.0-mbstring \
    php7.0-zip \
    git \
    nodejs

#Create satis user
RUN \
  adduser --disabled-password --gecos '' satis -u 1000

#Install composer
RUN \
  mkdir /home/satis/bin && \
  cd /home/satis/bin && \
  php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
  php -r "if (hash_file('SHA384', 'composer-setup.php') === '669656bab3166a7aff8a7506b8cb2d1c292f042046c5a994c43155c0be6190fa0355160742ab2e1c88d40d5be660b410') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && \
  php composer-setup.php --filename=composer && \
  rm composer-setup.php

#Add composer parallel install plugin
RUN \
  su - satis -c "composer global require hirak/prestissimo"

#Copy Satis app and fix ownership
COPY satis /home/satis/app
RUN chown -R satis:satis /home/satis/app
#Install Satis app dependencies
#FIXME Should be composer install but composer.json and .lock are not synced
RUN \
  su - satis -c "cd /home/satis/app && composer update --optimize-autoloader --no-dev"

#Copy webhook and worker and fix ownership
COPY webhook_and_worker /home/satis/webhook_and_worker
RUN chown -R satis:satis /home/satis/webhook_and_worker
#Install webhook and worker dependencies
RUN \
  su - satis -c "cd /home/satis/webhook_and_worker && npm install"

#Fix PHP CLI configuration
RUN sed -i "s/;date.timezone =.*/date.timezone = UTC/" /etc/php/7.0/cli/php.ini
#Configure SSH known hosts
COPY conf/home/satis/.ssh/known_hosts /home/satis/.ssh/known_hosts

#Configure supervisor
COPY conf/etc/supervisor/conf.d /etc/supervisor/conf.d

#Copy entrypoint and fix permissions
COPY entrypoint.sh /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
