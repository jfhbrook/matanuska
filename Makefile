.PHONY: default target ast citree debug entrypoint fireball host readline test-generator dist bin

MATBAS_BUILD = debug

DIST_TS_FILES := $(shell find . -name '*.ts' -not -path './node_modules/*' -not -path './packages/*')

CITREE_TS_FILES := $(shell find . -name '*.ts' -path './packages/citree/src/*' -name '*.ts')
CITREE_JS_FILES := $(shell find . -name '*.ts' -path './packages/citree/*' -not -path './packages/citree/node_modules/*' -not -path './packages/citree/example/*' | grep -v '.d.ts' | sed 's/.ts/.js/' | sed 's^citree^citree/dist^')

DEBUG_TS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './packages/debug/node_modules/*' -not -path './packages/debug/example/*' | grep -v '.d.ts')
DEBUG_JS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './packages/debug/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

ENTRYPOINT_TS_FILES := $(shell find . -name '*.ts' -path './packages/entrypoint/src/*')

FIREBALL_TS_FILES := $(shell find . -name '*.ts' -path './packages/fireball/src/*')

GRABTHAR_JS_FILES := $(shell find . -name '*.mjs' -path './packages/grabthar/*' -not -path './packages/grabthar/node_modules/*')

HOST_TS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts')
HOST_JS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

READLINE_TS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts')
READLINE_JS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/')

TEST_GENERATOR_TS_FILES := $(shell find . -name '*.ts' -path './packages/test-generator/*' -not -path './packages/test-generator/node_modules/*' | grep -v '.d.ts')
TEST_GENERATOR_JS_FILES := $(shell find . -name '*.ts' -path './packages/test-generator/*' -not -path './packages/test-generator/node_modules/*' | grep -v '.d.ts' | sed 's/.ts/.js/' | sed 's^test-generator^test-generator/dist^')

default: bin

# environment shenanigans
#
# This is a hack to get Make to depend on changes to the MATBAS_BUILD
# environment variable. See:
#
#     https://stackoverflow.com/questions/11647859/make-targets-depend-on-variables

TARGET_ENV = .make.$(shell echo $($(1))).env

$(call TARGET_ENV,MATBAS_BUILD):
	rm -rf .make.*.env
	if [[ '$(MATBAS_BUILD)' == 'debug' ]]; then cp .env $@; else cp release.env $@; fi

# ast
ast: $(CITREE_JS_FILES) ast/expr.ts ast/instr.ts ast/index.ts

ast/expr.ts ast/instr.ts ast/index.ts: ast/index.citree
	npm run build:ast

# citree

citree: $(CITREE_JS_FILES) packages/citree/example/expr.ts packages/citree/example/index.ts packages/citree/example/instr.ts packages/citree/example/ast.citree packages/citree/test/__snapshots__/%.spec.ts.snap

$(CITREE_JS_FILES): $(CITREE_TS_FILES) packages/citree/package.json

packages/citree/example/expr.ts packages/citree/example/index.ts packages/citree/example/instr.ts: packages/citree/example/ast.citree
	cd packages/citree && npm run build:typescript

packages/artifacts/matanuska-citree.tgz: $(CITREE_JS_FILES) packages/citree/package.json
	cd packages/citree && npm pack
	mkdir -p packages/artifacts
	mv packages/citree/matanuska-citree-*.tgz packages/artifacts/matanuska-citree.tgz

packages/citree/example/ast.citree: ast/index.citree
	cp ast/index.citree packages/citree/example/ast.citree

packages/citree/test/__snapshots__/%.spec.ts.snap: packages/citree/example/%.ts
	cd packages/citree && npm run snap

# debug
debug: $(DEBUG_JS_FILES)

$(DEBUG_JS_FILES): $(DEBUG_TS_FILES) packages/debug/package.json
	cd packages/debug && npm run build

packages/artifacts/matanuska-debug.tgz: $(DEBUG_JS_FILES)
	cd packages/debug && npm pack
	mkdir -p packages/artifacts
	mv packages/debug/matanuska-debug-*.tgz packages/artifacts/matanuska-debug.tgz

# entrypoint
entrypoint: packages/entrypoint/dist/index.js packages/entrypoint/dist/main.js

packages/entrypoint/dist/index.js packages/entrypoint/dist/main.js: $(ENTRYPOINT_TS_FILES) packages/entrypoint/matbas.sh.tftpl packages/entrypoint/package.json packages/entrypoint/tsconfig.json packages/entrypoint/tsconfig.build.json
	cd packages/entrypoint && npm run build

packages/artifacts/matanuska-entrypoint.tgz: packages/entrypoint/dist/index.js packages/entrypoint/dist/main.js
	cd packages/entrypoint && npm pack
	mkdir -p packages/artifacts
	mv packages/entrypoint/matanuska-entrypoint-*.tgz packages/artifacts/matanuska-entrypoint.tgz

# fireball
fireball: packages/fireball/dist/index.js packages/fireball/dist/main.js

packages/fireball/dist/index.js packages/fireball/dist/main.js: $(FIREBALL_TS_FILES) packages/fireball/matbas.sh.tftpl packages/fireball/package.json packages/fireball/tsconfig.json packages/fireball/tsconfig.build.json
	cd packages/fireball && npm run build

packages/artifacts/matanuska-fireball.tgz: packages/entrypoint/dist/index.js packages/entrypoint/dist/main.js
	cd packages/fireball && npm pack
	mkdir -p packages/artifacts
	mv packages/fireball/matanuska-fireball-*.tgz packages/artifacts/matanuska-fireball.tgz

packages/artifacts/jfhbrook-grabthar.tgz: $(GRABTHAR_JS_FILES) packages/grabthar/package.json
	cd packages/grabthar && npm pack
	mkdir -p packages/artifacts
	mv packages/grabthar/jfhbrook-grabthar-*.tgz packages/artifacts/jfhbrook-grabthar.tgz

# host
$(HOST_JS_FILES): $(HOST_TS_FILES)
	cd packages/host && npm run build

packages/artifacts/matanuska-host.tgz: $(HOST_JS_FILES)
	cd packages/host && npm pack
	mkdir -p packages/artifacts
	mv packages/host/matanuska-host-*.tgz packages/artifacts/matanuska-host.tgz

# readline
$(READLINE_JS_FILES): $(READLINE_TS_FILES)
	cd packages/readline && npm run build

packages/artifacts/matanuska-readline.tgz: $(READLINE_JS_FILES)
	cd packages/readline && npm pack
	mkdir -p packages/artifacts
	mv packages/readline/matanuska-readline-*.tgz packages/artifacts/matanuska-readline.tgz

# telemetry
packages/telemetry/dist/index.js: packages/telemetry/index.ts packages/telemetry/grabthar.yml packages/telemetry/package.json packages/telemetry/vite.config.mjs
	cd packages/telemetry && npm run build

packages/artifacts/matanuska-telemetry.tgz: packages/telemetry/dist/index.js
	cd packages/telemetry && npm pack
	mkdir -p packages/artifacts
	mv packages/telemetry/matanuska-telemetry-*.tgz packages/artifacts/matanuska-telemetry.tgz

# test-generator
test-generator: packages/test-generator/dist/*

$(TEST_GENERATOR_JS_FILES): $(TEST_GENERATOR_TS_FILES) packages/test-generator/package.json
	npm run build -w packages/test-generator

packages/artifacts/matanuska-test-generator.tgz: $(TEST_GENERATOR_JS_FILES)
	cd packages/test-generator && npm pack
	mkdir -p packages/artifacts
	mv packages/test-generator/matanuska-test-generator-*.tgz packages/artifacts/matanuska-test-generator.tgz

# Install dependencies
package-lock.json: packages/artifacts/matanuska-citree.tgz packages/artifacts/matanuska-debug.tgz packages/artifacts/matanuska-entrypoint.tgz  packages/artifacts/matanuska-fireball.tgz packages/artifacts/jfhbrook-grabthar.tgz packages/artifacts/matanuska-host.tgz packages/artifacts/matanuska-readline.tgz packages/artifacts/matanuska-telemetry.tgz packages/artifacts/matanuska-test-generator.tgz
	for tarball in ./packages/artifacts/*.tgz; do npm install "${tarball}"; done

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
