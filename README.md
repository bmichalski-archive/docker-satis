# bmichalski/docker-satis

## A set of docker containers for composer/satis

### Quickstart
Create a conf/satis.json file containing configuration. See https://getcomposer.org/doc/articles/handling-private-packages-with-satis.md.

Customize and export the following environment variables:
```bash
export ID_RSA_FILE=/path/to/id_rsa
export ID_RSA_PUB_FILE=/path/to/id_rsa.pub
export COMPOSER_GITHUB_OAUTH_TOKEN=composer_github_oauth_token
export GITHUB_WEBHOOK_SECRET_TOKEN=github_webhook_secret_token

make build-and-run
```

TODO
* Add SSL support
