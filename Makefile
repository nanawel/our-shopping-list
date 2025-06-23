ifneq ("$(wildcard docker-compose.dev.override.yml)","")
dev-%: export COMPOSE_FILE = docker-compose.dev.yml:docker-compose.dev.override.yml
else
dev-%: export COMPOSE_FILE = docker-compose.dev.yml
endif
dev-%: export NODE_BIN = /app/node_modules/nodemon/bin/nodemon.js
dev-%:
	$(MAKE) $*

.PHONY: pull
pull:
	docker compose pull

.PHONY: init
init:
	docker compose run \
		--rm \
		--name osl_app_install \
		-u $$(id -u) app \
		sh -c 'yarn install && cd client && yarn install'

.PHONY: config
config:
	docker compose config

.PHONY: upd
upd:
	docker compose up -d $(args)

.PHONY: upd-force
upd-force:
	docker compose up -d --force-recreate $(args)

.PHONY: restart
restart:
	docker compose restart $(args)

.PHONY: stop
stop:
	docker compose stop

.PHONY: down
down:
	docker compose down

.PHONY: build
build:
	test -n "$$COMPOSE_FILE" || echo >&2 "WARN: COMPOSE_FILE is empty. Will most likely not build aything."
	docker compose build $(args)

.PHONY: shell
shell:
	docker compose exec -u $$(id -u) app bash

.PHONY: shell-root
shell-root:
	docker compose exec app bash

.SILENT:
.PHONY: cli
cli:
	@docker compose exec -u $$(id -u) app node ./cli.js $(cmd)

.PHONY: ps
ps:
	docker compose ps

.PHONY: logs
logs:
	docker compose logs

.PHONY: logs-follow
logs-follow:
	docker compose logs -f --tail=200 app

.PHONY: watch
watch:
	docker compose exec \
		-u $$(id -u) app \
		sh -c 'cd /app/client && yarn dev'
