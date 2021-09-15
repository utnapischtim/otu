.PHONY: start
start: node_modules
	npm run dev

.PHONY: start-prod
start-prod: public/build
	npm run start

.PHONY: check
check:
	@npm run --silent check

.PHONY: clean
clean:
	git clean -xdf



package-lock.json: package.json
	npm install
	@touch -c $@

node_modules: package-lock.json
	@touch -c $@

public/build: node_modules $(shell find src) $(shell find public -not \( -path public/build -prune \))
	@npm run --silent build
	@npm run --silent css:purge
	@touch -c $@

dockerize:
	docker build -f Dockerfile . -t christoph/otu

save-docker:
	docker save christoph/otu | gzip > tmp/otu-${/bin/date +%Y-%m-%d}.tar.gz

load-docker:
	docker load -i tmp/otu.tar.gz

run-docker:
	docker run -p 49160:8080 -d christoph/otu
