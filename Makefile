.PHONY: clean build clean-build run build-and-run ensure-build-dir clone-satis

BASE_IMAGE_TAG=bmichalski/satis-base
APP_IMAGE_TAG=bmichalski/satis-app
NGINX_IMAGE_TAG=bmichalski/satis-nginx
GEARMAN_IMAGE_TAG=bmichalski/satis-gearman
ROOT_DIR=$(CURDIR)
BUILD_DIR=$(ROOT_DIR)/build
SATIS_DIR=$(ROOT_DIR)/satis
SATIS_VERSION=1.0.0-alpha3
PROJECT_NAME=satis

clean:
	rm -rf $(BUILD_DIR)

ensure-build-dir:
	mkdir -p $(BUILD_DIR)

clone-satis:
	[ -z "$$(ls -A $(SATIS_DIR))" ] && \
	git clone https://github.com/composer/satis $(SATIS_DIR) && \
	cd $(SATIS_DIR) && \
	git checkout $(SATIS_VERSION) || \
	echo "Nothing to clone"

build: ensure-build-dir clone-satis
	cp -R $(SATIS_DIR) $(BUILD_DIR)/satis && \
	cp -R $(ROOT_DIR)/app $(BUILD_DIR)/app && \
	cp -R $(ROOT_DIR)/build/satis $(BUILD_DIR)/app/satis && \
	cp -R $(ROOT_DIR)/nginx $(BUILD_DIR)/nginx && \
	cp -R $(ROOT_DIR)/gearman $(BUILD_DIR)/gearman && \
	cp -R $(ROOT_DIR)/webhook_and_worker $(BUILD_DIR)/app/webhook_and_worker && \
	cd $(ROOT_DIR)/base && \
	docker build -t $(BASE_IMAGE_TAG) . && \
	cd $(BUILD_DIR)/app && \
	docker build -t $(APP_IMAGE_TAG) . && \
	cd $(BUILD_DIR)/nginx && \
	docker build -t $(NGINX_IMAGE_TAG) . && \
	cd $(BUILD_DIR)/gearman && \
	docker build -t $(GEARMAN_IMAGE_TAG) .

clean-build: clean clone-satis build
	
run:
	docker-compose --project-name $(PROJECT_NAME) up

build-and-run: clean-build run

