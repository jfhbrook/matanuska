.PHONY: default target ast bin dist citree test-generator

MATBAS_BUILD = debug

TYPESCRIPT_FILES := $(shell find . -name '*.ts' -not -path './node_modules/*' -not -path './packages/*/node_modules/*')

default: bin

# environment shenanigans

TARGET_ENV = .make.$(shell echo $($(1))).env

$(call TARGET_ENV,MATBAS_BUILD):
	rm -rf .make.*.env
	if [[ '$(MATBAS_BUILD)' == 'debug' ]]; then cp .env $@; else cp release.env $@; fi

# internal
packages/internal/dist/index.js packages/internal/dist/index.d.js packages/internal/dist/index.js.map: packages/internal/src/index.ts
	npm run build:internal

# ast

ast: ast/expr.ts ast/instr.ts ast/index.ts

ast/expr.ts ast/instr.ts ast/index.ts: ast/index.citree
	npm run build:ast

# dist

dist: dist/main.js dist/main.js.map

dist/main.js dist/main.js.map: grabthar.yml package.json package-lock.json .env release.env packages/internal/dist/index.js $(call TARGET_ENV,MATBAS_BUILD) $(TYPESCRIPT_FILES)
	ENV_FILE='$(call TARGET_ENV,MATBAS_BUILD)' npm run build

# bin

bin: $(call TARGET_ENV,MATBAS_BUILD) bin/matbas

core/config.h: dist
	npm run build:headers

bin/matbas: dist/main.js dist/main.js.map core/dist.h
	cd core && qmake matanuska.pro
	cd core && make

# citree

citree: packages/citree/test/__snapshots__/*.spec.ts.snap

packages/citree/example/ast.citree: ast/index.citree
	cp ast/index.citree packages/citree/example/ast.citree

packages/citree/example/%.ts: packages/citree/example/ast.citree
	npm run build -w packages/citree

packages/citree/test/__snapshots__/%.spec.ts.snap: packages/citree/example/%.ts
	npm run snap -w packages/citree

# test-generator

test-generator: packages/test-generator/dist/*

packages/test-generator/dist/%: packages/test-generator/*.ts packages/test-generator/*.mjs packages/test-generator/*.json
	npm run build -w packages/test-generator

# clean
clean:
	rm -rf ./dist
