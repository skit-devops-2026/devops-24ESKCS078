# Every team fills in the commands for their own stack.
# The CI pipeline calls these targets, so the names must not change.

.PHONY: install test build run docker-build docker-up

install:
	npm ci
	cd Optilife-ht/backend && npm ci
	cd Optilife-ht/frontend && npm ci

test:
	npm test
	cd Optilife-ht/backend && npm test
	cd Optilife-ht/frontend && npm test

build:
	cd Optilife-ht/frontend && npm run build

run:
	cd Optilife-ht/backend && npm start

# Needed from M4 onwards
docker-build:
	docker build -t optilife-backend Optilife-ht/backend
	docker build -t optilife-frontend Optilife-ht/frontend

docker-up:
	docker compose up --build
