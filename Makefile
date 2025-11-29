.PHONY: default buffer ast citree debug entrypoint fireball host mock output path readline telemetry test test-generator dist testdeps bin

MATBAS_BUILD = debug

BUFFER_JS_FILES := $(shell find . -name '*.mjs' -path './packages/buffer/*' -not -path './packages/buffer/node_modules/*')

DIST_TS_FILES := $(shell find . -name '*.ts' -not -path './node_modules/*' -not -path './packages/*')

CITREE_TS_FILES := $(shell find . -name '*.ts' -path './packages/citree/src/*' -name '*.ts')

DEBUG_TS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './packages/debug/node_modules/*' -not -path './packages/debug/example/*' | grep -v '.d.ts')

ENTRYPOINT_TS_FILES := $(shell find . -name '*.ts' -path './packages/entrypoint/src/*')

FIREBALL_TS_FILES := $(shell find . -name '*.ts' -path './packages/fireball/src/*')

GRABTHAR_JS_FILES := $(shell find . -name '*.mjs' -path './packages/grabthar/*' -not -path './packages/grabthar/node_modules/*')

HOST_TS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/node_modules/*' | grep -v '.d.ts')

MOCK_TS_FILES := $(shell find . -name '*.ts' -path './packages/mock/*' -not -path './packages/mock/node_modules/*' | grep -v '.d.ts')

OUTPUT_TS_FILES := $(shell find . -name '*.ts' -path './packages/output/*' -not -path './packages/output/node_modules/*' | grep -v '.d.ts')

PATH_TS_FILES := $(shell find . -name '*.ts' -path './packages/path/*' -not -path './packages/path/node_modules/*' | grep -v '.d.ts')

READLINE_TS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './packages/readline/node_modules/*' | grep -v '.d.ts')

TEST_TS_FILES := $(shell find . -name '*.ts' -path './packages/test/*' -not -path './packages/test/node_modules/*' | grep -v '.d.ts')

TEST_GENERATOR_TS_FILES := $(shell find . -name '*.ts' -path './packages/test-generator/*' -not -path './packages/test-generator/node_modules/*' | grep -v '.d.ts')

VITEST_TS_FILES := $(shell find . -name '*.ts' -path './packages/vitest/*' -not -path './packages/vitest/node_modules/*' | grep -v '.d.ts')

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

# buffer
buffer: packages/artifacts/matanuska-buffer.tgz

packages/artifacts/matanuska-buffer.tgz: $(BUFFER_JS_FILES) packages/buffer/package.json
	cd packages/buffer && npm pack
	mkdir -p packages/artifacts
	mv packages/buffer/matanuska-buffer-*.tgz packages/artifacts/matanuska-buffer.tgz
	npm install packages/artifacts/matanuska-buffer.tgz

# ast
ast: packages/artifacts/matanuska-citree.tgz ast/expr.ts ast/instr.ts ast/index.ts

ast/expr.ts ast/instr.ts ast/index.ts: ast/index.citree
	npm run build:ast

# citree

citree: packages/artifacts/matanuska-citree.tgz packages/citree/example/ast.citree packages/artifacts/matanuska-citree.tgz

packages/artifacts/matanuska-citree.tgz: $(CITREE_TS_FILES) packages/citree/package.json
	npm run build:typescript -w packages/citree
	cd packages/citree && npm pack
	mkdir -p packages/artifacts
	mv packages/citree/matanuska-citree-*.tgz packages/artifacts/matanuska-citree.tgz
	npm install packages/artifacts/matanuska-citree.tgz

packages/citree/example/ast.citree: ast/index.citree
	cp ast/index.citree packages/citree/example/ast.citree
	npm run snap -w packages/citree

# debug
debug: packages/artifacts/matanuska-debug.tgz

packages/artifacts/matanuska-debug.tgz: $(DEBUG_TS_FILES) packages/debug/package.json
	npm run build -w packages/debug
	cd packages/debug && npm pack
	mkdir -p packages/artifacts
	mv packages/debug/matanuska-debug-*.tgz packages/artifacts/matanuska-debug.tgz
	npm install packages/artifacts/matanuska-debug.tgz

# entrypoint
entrypoint: packages/artifacts/matanuska-entrypoint.tgz

packages/artifacts/matanuska-entrypoint.tgz: $(ENTRYPOINT_TS_FILES) packages/entrypoint/package.json
	npm run build -w packages/entrypoint
	cd packages/entrypoint && npm pack
	mkdir -p packages/artifacts
	mv packages/entrypoint/matanuska-entrypoint-*.tgz packages/artifacts/matanuska-entrypoint.tgz
	npm install packages/artifacts/matanuska-entrypoint.tgz

# fireball
fireball: packages/artifacts/matanuska-fireball.tgz

packages/artifacts/matanuska-fireball.tgz: $(FIREBALL_TS_FILES) packages/fireball/package.json
	npm run build -w packages/fireball
	cd packages/fireball && npm pack
	mkdir -p packages/artifacts
	mv packages/fireball/matanuska-fireball-*.tgz packages/artifacts/matanuska-fireball.tgz
	npm install packages/artifacts/matanuska-fireball.tgz

# grabthar
grabthar: packages/artifacts/jfhbrook-grabthar.tgz

packages/artifacts/jfhbrook-grabthar.tgz: $(GRABTHAR_JS_FILES) packages/grabthar/package.json
	cd packages/grabthar && npm pack
	mkdir -p packages/artifacts
	mv packages/grabthar/jfhbrook-grabthar-*.tgz packages/artifacts/jfhbrook-grabthar.tgz
	npm install packages/artifacts/jfhbrook-grabthar.tgz

# host
host: packages/artifacts/matanuska-host.tgz

packages/artifacts/matanuska-host.tgz: $(HOST_TS_FILES) packages/host/package.json
	npm run build -w packages/host
	cd packages/host && npm pack
	mkdir -p packages/artifacts
	mv packages/host/matanuska-host-*.tgz packages/artifacts/matanuska-host.tgz
	npm install packages/artifacts/matanuska-host.tgz

# mock
mock: packages/artifacts/matanuska-mock.tgz

packages/artifacts/matanuska-mock.tgz: $(MOCK_TS_FILES) packages/mock/package.json
	npm run build -w packages/mock
	cd packages/mock && npm pack
	mkdir -p packages/artifacts
	mv packages/mock/matanuska-mock-*.tgz packages/artifacts/matanuska-mock.tgz
	npm install packages/artifacts/matanuska-mock.tgz

# output
output: packages/artifacts/matanuska-output.tgz

packages/artifacts/matanuska-output.tgz: $(OUTPUT_TS_FILES) packages/output/package.json
	npm run build -w packages/output
	cd packages/output && npm pack
	mkdir -p packages/artifacts
	mv packages/output/matanuska-output-*.tgz packages/artifacts/matanuska-output.tgz
	npm install packages/artifacts/matanuska-output.tgz

# path
path: packages/artifacts/matanuska-path.tgz

packages/artifacts/matanuska-path.tgz: $(PATH_TS_FILES) packages/path/package.json
	npm run build -w packages/path
	cd packages/path && npm pack
	mkdir -p packages/artifacts
	mv packages/path/matanuska-path-*.tgz packages/artifacts/matanuska-path.tgz
	npm install packages/artifacts/matanuska-path.tgz

# readline
readline: packages/artifacts/matanuska-readline.tgz

packages/artifacts/matanuska-readline.tgz: $(READLINE_TS_FILES) packages/readline/package.json
	npm run build -w packages/readline
	cd packages/readline && npm pack
	mkdir -p packages/artifacts
	mv packages/readline/matanuska-readline-*.tgz packages/artifacts/matanuska-readline.tgz
	npm install packages/artifacts/matanuska-readline.tgz

# telemetry
telemetry: packages/artifacts/matanuska-telemetry.tgz

packages/artifacts/matanuska-telemetry.tgz: $(TELEMETRY_TS_FILES) packages/telemetry/package.json
	npm run build -w packages/telemetry
	cd packages/telemetry && npm pack
	mkdir -p packages/artifacts
	mv packages/telemetry/matanuska-telemetry-*.tgz packages/artifacts/matanuska-telemetry.tgz
	npm install packagess/artifacts/matanuska-telemetry.tgz

# test 
test: packages/artifacts/matanuska-test.tgz

$(TEST_JS_FILES): $(TEST_TS_FILES)
	cd packages/test && npm run build

packages/artifacts/matanuska-test.tgz: $(TEST_JS_FILES)
	cd packages/test && npm pack
	mkdir -p packages/artifacts
	mv packages/test/matanuska-test-*.tgz packages/artifacts/matanuska-test.tgz
	npm install packages/artifacts/matanuska-test.tgz

# test-generator
test-generator: packages/artifacts/matanuska-test-generator.tgz

packages/artifacts/matanuska-test-generator.tgz: $(TEST_GENERATOR_TS_FILES) packages/test-generator/package.json
	npm run build -w packages/test-generator
	cd packages/test-generator && npm pack
	mkdir -p packages/artifacts
	mv packages/test-generator/matanuska-test-generator-*.tgz packages/artifacts/matanuska-test-generator.tgz
	npm install packages/artifacts/matanuska-test-generator.tgz

# vitest 
vitest: packages/artifacts/matanuska-vitest.tgz

packages/artifacts/matanuska-vitest.tgz: $(VITEST_TS_FILES) packages/vitest/package.json
	npm run build -w packages/vitest
	cd packages/vitest && npm pack
	mkdir -p packages/artifacts
	mv packages/vitest/matanuska-vitest-*.tgz packages/artifacts/matanuska-vitest.tgz
	npm install packages/artifacts/matanuska-vitest.tgz

# dist
dist: grabthar.yml package.json .env release.env packages/artifacts/matanuska-debug.tgz packages/artifacts/jfhbrook-grabthar.tgz packages/artifacts/matanuska-host.tgz packages/artifacts/matanuska-output.tgz packages/artifacts/matanuska-path.tgz packages/artifacts/matanuska-readline.tgz packages/artifacts/matanuska-test.tgz $(call TARGET_ENV,MATBAS_BUILD) $(DIST_TS_FILES)
	ENV_FILE='$(call TARGET_ENV,MATBAS_BUILD)' npm run build

dist/main.js dist/main.js.map dist/main.js dist/main.js.map: dist

# test
testdeps: grabthar.yml package.json test.env packages/host/index.js packages/artifacts/matanuska-debug.tgz packages/artifacts/matanuska-host.tgz packages/artifacts/matanuska-mock.tgz packages/artifacts/matanuska-output.tgz packages/artifacts/matanuska-path.tgz packages/artifacts/matanuska-readline.tgz packages/artifacts/matanuska-test.tgz packages/artifacts/matanuska-vitest.tgz $(call TARGET_ENV,MATBAS_BUILD) $(DIST_TS_FILES)

# bin
bin: $(call TARGET_ENV,MATBAS_BUILD) bin/matbas bin/matbasjs

core/config.h: dist
	npm run build:headers

bin/matbas: dist
	cd core && qmake matanuska.pro
	cd core && make

bin/matbasjs: dist packages/artifacts/matanuska-entrypoint.tgz
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
