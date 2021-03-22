dev-%: export COMPOSE_FILE = docker-compose.yml:docker-compose.dev.yml
dev-%: export NODE_BIN = /app/node_modules/nodemon/bin/nodemon.js
dev-%:
	$(MAKE) $*

pull:
	docker-compose pull

init:
	docker-compose run \
		--rm \
		--name osl_app_install \
		-u $$(id -u) app \
    	bash -c 'cd /app && yarn install && cd client && yarn install'

config:
	docker-compose config

upd:
	docker-compose up -d $(args)

stop:
	docker-compose stop

build:
	docker-compose build $(args)

shell:
	docker-compose exec -u $$(id -u) app bash -c 'cd /app && bash'

ps:
	docker-compose ps

logs:
	docker-compose logs

logs-follow:
	docker-compose logs -f --tail=200 app