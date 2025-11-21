.PHONY: default target ast citree debug entrypoint fireball host readline test-generator dist bin

MATBAS_BUILD = debug

DIST_TS_FILES := $(shell find . -name '*.ts' -not -path './node_modules/*' -not -path './packages/*')

CITREE_TS_FILES := $(shell find . -name '*.ts' -path './packages/citree/*' -not -path './packages/citree/node_modules/*' -not -path './packages/citree/example/*' | grep -v '.d.ts')
CITREE_JS_FILES := $(shell find . -name '*.ts' -path './packages/citree/*' -not -path './packages/citree/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

DEBUG_TS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './packages/debug/node_modules/*' -not -path './packages/debug/example/*' | grep -v '.d.ts')
DEBUG_JS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './packages/debug/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

ENTRYPOINT_TS_FILES := $(shell find . -name '*.ts' -path './packages/entrypoint/src/*')

FIREBALL_TS_FILES := $(shell find . -name '*.ts' -path './packages/fireball/src/*')

HOST_TS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts')
HOST_JS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

READLINE_TS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts')
READLINE_JS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

default: bin

# environment shenanigans

TARGET_ENV = .make.$(shell echo $($(1))).env

$(call TARGET_ENV,MATBAS_BUILD):
	rm -rf .make.*.env
	if [[ '$(MATBAS_BUILD)' == 'debug' ]]; then cp .env $@; else cp release.env $@; fi

# ast
ast: $(CITREE_JS_FILES) ast/expr.ts ast/instr.ts ast/index.ts

ast/expr.ts ast/instr.ts ast/index.ts: ast/index.citree
	npm run build:ast

# citree

citree: $(CITREE_JS_FILES) packages/citree/test/__snapshots__/*.spec.ts.snap

$(CITREE_JS_FILES): $(CITREE_TS_FILES) packages/citree/package.json packages/citree/package-lock.json packages/citree/example/ast.citree
	npm run build -w packages/citree

packages/citree/example/ast.citree: ast/index.citree
	cp ast/index.citree packages/citree/example/ast.citree

packages/citree/test/__snapshots__/%.spec.ts.snap: packages/citree/example/%.ts
	npm run snap -w packages/citree

# debug
debug: $(DEBUG_JS_FILES)

$(DEBUG_JS_FILES): $(DEBUG_TS_FILES) packages/debug/package.json packages/debug/package.lock.json
	npm run build:debug

# entrypoint
entrypoint: packages/entrypoint/dist/index.js packages/entrypoint/dist/main.js

packages/entrypoint/dist/index.js packages/entrypoint/dist/main.js: $(ENTRYPOINT_TS_FILES) packages/entrypoint/matbas.sh.tftpl packages/entrypoint/package.json packages/entrypoint/package-lock.json packages/entrypoint/tsconfig.json packages/entrypoint/tsconfig.build.json
	npm run build:entrypoint

# fireball
fireball: packages/fireball/dist/index.js packages/fireball/dist/main.js

packages/fireball/dist/index.js packages/fireball/dist/main.js: $(FIREBALL_TS_FILES) packages/fireball/matbas.sh.tftpl packages/fireball/package.json packages/fireball/package-lock.json packages/fireball/tsconfig.json packages/fireball/tsconfig.build.json
	npm run build:fireball

# host
$(HOST_JS_FILES): $(HOST_TS_FILES)
	npm run build:host

# readline
$(READLINE_JS_FILES): $(READLINE_TS_FILES)
	npm run build:readline

# telemetry
packages/telemetry/dist/index.js: packages/telemetry/index.ts packages/telemetry/grabthar.yml packages/telemetry/package.json packages/telemetry/package-lock.json packages/telemetry/vite.config.mjs
	npm run build:telemetry

# test-generator
test-generator: packages/test-generator/dist/*

packages/test-generator/dist/%: packages/test-generator/*.ts packages/test-generator/*.mjs packages/test-generator/*.json
	npm run build -w packages/test-generator

# dist
dist: dist/main.js dist/main.js.map

dist/main.js dist/main.js.map: grabthar.yml package.json package-lock.json .env release.env packages/host/index.js $(call TARGET_ENV,MATBAS_BUILD) $(DIST_TS_FILES)
	ENV_FILE='$(call TARGET_ENV,MATBAS_BUILD)' npm run build

# bin
bin: $(call TARGET_ENV,MATBAS_BUILD) bin/matbas bin/matbasjs

core/config.h: dist/main.js
	npm run build:headers

bin/matbas: dist/main.js dist/main.js.map
	cd core && qmake matanuska.pro
	cd core && make

bin/matbasjs:
	npm run build:entrypoint

# clean
clean:
	npm run clean -w packages/citree
	npm run clean -w packages/debug
	npm run clean -w packages/entrypoint
	npm run clean -w packages/host
	npm run clean -w packages/readline
	npm run clean -w packages/test-generator
	npm run clean
