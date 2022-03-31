dev-%: export COMPOSE_FILE = docker-compose.dev.yml
dev-%: export NODE_BIN = /app/node_modules/nodemon/bin/nodemon.js
dev-%:
	$(MAKE) $*

.PHONY: pull
pull:
	docker-compose pull

.PHONY: init
init:
	docker-compose run \
		--rm \
		--name osl_app_install \
		-u $$(id -u) app \
    	bash -c 'cd /app && yarn install && cd client && yarn install'

.PHONY: config
config:
	docker-compose config

.PHONY: upd
upd:
	docker-compose up -d $(args)

.PHONY: upd-force
upd-force:
	docker-compose up -d --force-recreate $(args)

.PHONY: restart
restart:
	docker-compose restart $(args)

.PHONY: stop
stop:
	docker-compose stop

.PHONY: down
down:
	docker-compose down

.PHONY: build
build:
	docker-compose build $(args)

.PHONY: shell
shell:
	docker-compose exec -u $$(id -u) app bash -c 'cd /app && bash'

.PHONY: ps
ps:
	docker-compose ps

.PHONY: logs
logs:
	docker-compose logs

.PHONY: logs-follow
logs-follow:
	docker-compose logs -f --tail=200 app

.PHONY: watch
watch:
	docker-compose exec app sh -c 'cd /app/client && yarn serve'
