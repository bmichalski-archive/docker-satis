#!/usr/bin/env bash

su - satis -c "composer config --global github-oauth.github.com $COMPOSER_GITHUB_OAUTH_TOKEN"

chown -R satis:satis /home/satis/app/web

/usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
