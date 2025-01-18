#!/bin/bash

# !! CREATE A BACKUP FIRST !!

# Get all needed images first to minimize downtime
docker pull mongo:5
docker pull mongo:6
docker pull mongo:7

DOCKER_COMPOSE_FILE=${DOCKER_COMPOSE_FILE:-docker-compose.yml}

# Upgrade to MongoDB 5
docker compose down
sed -i 's/image: mongo:4.*/image: mongo:5/' ${DOCKER_COMPOSE_FILE}
docker compose up -d
while ! docker compose exec -T mongodb mongosh --eval 'db.runCommand({ping: 1})' >/dev/null 2>&1; do sleep 2; done
echo 'db.adminCommand( { setFeatureCompatibilityVersion: "5.0" } )' | docker compose exec -T mongodb mongosh

# Upgrade to MongoDB 6
docker compose down
sed -i 's/image: mongo:5/image: mongo:6/' ${DOCKER_COMPOSE_FILE}
docker compose up -d
while ! docker compose exec -T mongodb mongosh --eval 'db.runCommand({ping: 1})' >/dev/null 2>&1; do sleep 2; done
echo 'db.adminCommand( { setFeatureCompatibilityVersion: "6.0" } )' | docker compose exec -T mongodb mongosh

# Upgrade to MongoDB 7
docker compose down
sed -i 's/image: mongo:6/image: mongo:7/' ${DOCKER_COMPOSE_FILE}
docker compose up -d
while ! docker compose exec -T mongodb mongosh --eval 'db.runCommand({ping: 1})' >/dev/null 2>&1; do sleep 2; done
echo "OK!"
