
.PHONY: default citree debug entrypoint fireball grabthar host mock output path telemetry readline test test-generator vitest ast dist testdeps bin

default: bin


MATBAS_BUILD = debug
TARGET_ENV = .make.$(shell echo $($(1))).env

$(call TARGET_ENV,MATBAS_BUILD):
	rm -rf .make.*.env
	if [[ '$(MATBAS_BUILD)' == 'debug' ]]; then cp .env $@; else cp release.env $@; fi


CITREE_TS_FILES := $(shell find . -name '*.ts' -path './packages/citree/src/*' -not -path './node_modules/*' -not -path './packages/citree/src/node_modules/*')
CITREE_JS_FILES := $(shell find . -name '*.ts' -path './packages/citree/src/*' -not -path './node_modules/*' -not -path './packages/citree/src/node_modules/*' | sed 's/.ts/.js/' | sed 's^s^r^' | sed 's^d^i^')
CITREE_EXAMPLE_FILES := $(shell find . -name '*.ts' -path './packages/citree/example/*' -not -path './node_modules/*' -not -path './packages/citree/example/node_modules/*')
DEBUG_TS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './node_modules/*' -not -path './packages/debug/node_modules/*')
DEBUG_JS_FILES := $(shell find . -name '*.ts' -path './packages/debug/*' -not -path './node_modules/*' -not -path './packages/debug/node_modules/*' | sed 's/.ts/.js/')
ENTRYPOINT_TS_FILES := $(shell find . -name '*.ts' -path './packages/entrypoint/*' -not -path './node_modules/*' -not -path './packages/entrypoint/node_modules/*')
ENTRYPOINT_JS_FILES := $(shell find . -name '*.ts' -path './packages/entrypoint/*' -not -path './node_modules/*' -not -path './packages/entrypoint/node_modules/*' | sed 's/.ts/.js/' | sed 's^s^r^' | sed 's^d^i^')
ENTRYPOINT_TF_FILES := $(shell find . -name '*.tf' -path './packages/entrypoint/modules/*' -not -path './packages/entrypoint/modules/.terraform/*')
FIREBALL_TS_FILES := $(shell find . -name '*.ts' -path './packages/fireball/*' -not -path './node_modules/*' -not -path './packages/fireball/node_modules/*')
FIREBALL_JS_FILES := $(shell find . -name '*.ts' -path './packages/fireball/*' -not -path './node_modules/*' -not -path './packages/fireball/node_modules/*' | sed 's/.ts/.js/' | sed 's^s^r^' | sed 's^d^i^')
FIREBALL_TF_FILES := $(shell find . -name '*.tf' -path './packages/fireball/modules/*' -not -path './packages/fireball/modules/.terraform/*')
GRABTHAR_JS_FILES := $(shell find . \( -name '*.js' -o -name '*.mjs' \) -path './packages/grabthar/*' -not -path './packages/grabthar/test/*' -not -path './node_modules/*' -not -path './packages/grabthar/node_modules/*')
HOST_TS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/test/*' -not -path './node_modules/*' -not -path './packages/host/node_modules/*')
HOST_JS_FILES := $(shell find . -name '*.ts' -path './packages/host/*' -not -path './packages/host/test/*' -not -path './node_modules/*' -not -path './packages/host/node_modules/*' | sed 's/.ts/.js/')
MOCK_TS_FILES := $(shell find . -name '*.ts' -path './packages/mock/*' -not -path './packages/mock/test/*' -not -path './node_modules/*' -not -path './packages/mock/node_modules/*')
MOCK_JS_FILES := $(shell find . -name '*.ts' -path './packages/mock/*' -not -path './packages/mock/test/*' -not -path './node_modules/*' -not -path './packages/mock/node_modules/*' | sed 's/.ts/.js/')
OUTPUT_TS_FILES := $(shell find . -name '*.ts' -path './packages/output/*' -not -path './packages/output/test/*' -not -path './node_modules/*' -not -path './packages/output/node_modules/*')
OUTPUT_JS_FILES := $(shell find . -name '*.ts' -path './packages/output/*' -not -path './packages/output/test/*' -not -path './node_modules/*' -not -path './packages/output/node_modules/*' | sed 's/.ts/.js/')
PATH_TS_FILES := $(shell find . -name '*.ts' -path './packages/path/*' -not -path './node_modules/*' -not -path './packages/path/node_modules/*')
PATH_JS_FILES := $(shell find . -name '*.ts' -path './packages/path/*' -not -path './node_modules/*' -not -path './packages/path/node_modules/*' | sed 's/.ts/.js/')
TELEMETRY_TS_FILES := $(shell find . -name '*.ts' -path './packages/telemetry/*' -not -path './node_modules/*' -not -path './packages/telemetry/node_modules/*')
READLINE_TS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './node_modules/*' -not -path './packages/readline/node_modules/*')
READLINE_JS_FILES := $(shell find . -name '*.ts' -path './packages/readline/*' -not -path './node_modules/*' -not -path './packages/readline/node_modules/*' | sed 's/.ts/.js/')
TEST_TS_FILES := $(shell find . -name '*.ts' -path './packages/test/*' -not -path './node_modules/*' -not -path './packages/test/node_modules/*')
TEST_JS_FILES := $(shell find . -name '*.ts' -path './packages/test/*' -not -path './node_modules/*' -not -path './packages/test/node_modules/*' | sed 's/.ts/.js/')
TEST_GENERATOR_TS_FILES := $(shell find . -name '*.ts' -path './packages/test-generator/*' -not -path './node_modules/*' -not -path './packages/test-generator/node_modules/*')
TEST_GENERATOR_JS_FILES := $(shell find . -name '*.ts' -path './packages/test-generator/*' -not -path './node_modules/*' -not -path './packages/test-generator/node_modules/*' | sed 's/.ts/.js/')
VITEST_TS_FILES := $(shell find . -name '*.ts' -path './packages/vitest/*' -not -path './node_modules/*' -not -path './packages/vitest/node_modules/*')
VITEST_JS_FILES := $(shell find . -name '*.ts' -path './packages/vitest/*' -not -path './node_modules/*' -not -path './packages/vitest/node_modules/*' | sed 's/.ts/.js/')
DIST_TS_FILES := $(shell find . -name '*.ts' -path './*' -not -path './packages/*' -not -path './node_modules/*' -not -path './node_modules/*')
./core := $(shell find . \( -name '*.cpp' -o -name '*.h' -o -name '*.qrc' -o -name '*.pro' \) -path 'undefined/*' )

citree: ./packages/artifacts/matanuska-citree.tgz
$(CITREE_JS_FILES): $(CITREE_TS_FILES)
	npm run build:typescript -w packages/citree

packages/citree/example/ast.citree: ast/index.citree
	cp 'ast/index.citree' 'packages/citree/example/ast.citree'

$(CITREE_EXAMPLE_FILES): packages/citree/example/ast.citree $(CITREE_JS_FILES)

./packages/artifacts/matanuska-citree.tgz: $(CITREE_JS_FILES)
	cd packages/citree && npm pack
	mkdir -p packages/artifacts
	mv packages/citree/matanuska-citree-*.tgz ./packages/artifacts/matanuska-citree.tgz
	npm install ./packages/artifacts/matanuska-citree.tgz


debug: ./packages/artifacts/matanuska-debug.tgz
$(DEBUG_JS_FILES): $(DEBUG_TS_FILES)
	npm run build -w packages/debug

./packages/artifacts/matanuska-debug.tgz: $(DEBUG_JS_FILES)
	cd packages/debug && npm pack
	mkdir -p packages/artifacts
	mv packages/debug/matanuska-debug-*.tgz ./packages/artifacts/matanuska-debug.tgz
	npm install ./packages/artifacts/matanuska-debug.tgz


entrypoint: ./packages/artifacts/matanuska-entrypoint.tgz
$(ENTRYPOINT_JS_FILES): $(ENTRYPOINT_TS_FILES) $(ENTRYPOINT_TF_FILES)
	npm run build -w packages/entrypoint

./packages/artifacts/matanuska-entrypoint.tgz: $(ENTRYPOINT_JS_FILES)
	cd packages/entrypoint && npm pack
	mkdir -p packages/artifacts
	mv packages/entrypoint/matanuska-entrypoint-*.tgz ./packages/artifacts/matanuska-entrypoint.tgz
	npm install ./packages/artifacts/matanuska-entrypoint.tgz


fireball: ./packages/artifacts/matanuska-fireball.tgz
$(FIREBALL_JS_FILES): $(FIREBALL_TS_FILES) $(FIREBALL_TF_FILES)
	npm run build -w packages/fireball

./packages/artifacts/matanuska-fireball.tgz: $(FIREBALL_JS_FILES)
	cd packages/fireball && npm pack
	mkdir -p packages/artifacts
	mv packages/fireball/matanuska-fireball-*.tgz ./packages/artifacts/matanuska-fireball.tgz
	npm install ./packages/artifacts/matanuska-fireball.tgz


grabthar: ./packages/artifacts/jfhbrook-grabthar.tgz
./packages/artifacts/jfhbrook-grabthar.tgz: $(GRABTHAR_JS_FILES)
	cd packages/grabthar && npm pack
	mkdir -p packages/artifacts
	mv packages/grabthar/jfhbrook-grabthar-*.tgz ./packages/artifacts/jfhbrook-grabthar.tgz
	npm install ./packages/artifacts/jfhbrook-grabthar.tgz


host: ./packages/artifacts/matanuska-host.tgz
$(HOST_JS_FILES): $(HOST_TS_FILES)
	npm run build -w packages/host

./packages/artifacts/matanuska-host.tgz: $(HOST_JS_FILES)
	cd packages/host && npm pack
	mkdir -p packages/artifacts
	mv packages/host/matanuska-host-*.tgz ./packages/artifacts/matanuska-host.tgz
	npm install ./packages/artifacts/matanuska-host.tgz


mock: ./packages/artifacts/matanuska-mock.tgz
$(MOCK_JS_FILES): $(MOCK_TS_FILES)
	npm run build -w packages/mock

./packages/artifacts/matanuska-mock.tgz: $(MOCK_JS_FILES)
	cd packages/mock && npm pack
	mkdir -p packages/artifacts
	mv packages/mock/matanuska-mock-*.tgz ./packages/artifacts/matanuska-mock.tgz
	npm install ./packages/artifacts/matanuska-mock.tgz


output: ./packages/artifacts/matanuska-output.tgz
$(OUTPUT_JS_FILES): $(OUTPUT_TS_FILES)
	npm run build -w packages/output

./packages/artifacts/matanuska-output.tgz: $(OUTPUT_JS_FILES)
	cd packages/output && npm pack
	mkdir -p packages/artifacts
	mv packages/output/matanuska-output-*.tgz ./packages/artifacts/matanuska-output.tgz
	npm install ./packages/artifacts/matanuska-output.tgz


path: ./packages/artifacts/matanuska-path.tgz
$(PATH_JS_FILES): $(PATH_TS_FILES)
	npm run build -w packages/path

./packages/artifacts/matanuska-path.tgz: $(PATH_JS_FILES)
	cd packages/path && npm pack
	mkdir -p packages/artifacts
	mv packages/path/matanuska-path-*.tgz ./packages/artifacts/matanuska-path.tgz
	npm install ./packages/artifacts/matanuska-path.tgz


telemetry: ./packages/artifacts/matanuska-telemetry.tgz
./packages/telemetry/dist/index.js: $(TELEMETRY_TS_FILES)
	npm run build -w packages/telemetry

./packages/artifacts/matanuska-telemetry.tgz: ./packages/telemetry/dist/index.js
	cd packages/telemetry && npm pack
	mkdir -p packages/artifacts
	mv packages/telemetry/matanuska-telemetry-*.tgz ./packages/artifacts/matanuska-telemetry.tgz
	npm install ./packages/artifacts/matanuska-telemetry.tgz


readline: ./packages/artifacts/matanuska-readline.tgz
$(READLINE_JS_FILES): $(READLINE_TS_FILES)
	npm run build -w packages/readline

./packages/artifacts/matanuska-readline.tgz: $(READLINE_JS_FILES)
	cd packages/readline && npm pack
	mkdir -p packages/artifacts
	mv packages/readline/matanuska-readline-*.tgz ./packages/artifacts/matanuska-readline.tgz
	npm install ./packages/artifacts/matanuska-readline.tgz


test: ./packages/artifacts/matanuska-test.tgz
$(TEST_JS_FILES): $(TEST_TS_FILES)
	npm run build -w packages/test

./packages/artifacts/matanuska-test.tgz: $(TEST_JS_FILES)
	cd packages/test && npm pack
	mkdir -p packages/artifacts
	mv packages/test/matanuska-test-*.tgz ./packages/artifacts/matanuska-test.tgz
	npm install ./packages/artifacts/matanuska-test.tgz


test-generator: ./packages/artifacts/matanuska-test-generator.tgz
$(TEST_GENERATOR_JS_FILES): $(TEST_GENERATOR_TS_FILES)
	npm run build -w packages/test-generator

./packages/artifacts/matanuska-test-generator.tgz: $(TEST_GENERATOR_JS_FILES)
	cd packages/test-generator && npm pack
	mkdir -p packages/artifacts
	mv packages/test-generator/matanuska-test-generator-*.tgz ./packages/artifacts/matanuska-test-generator.tgz
	npm install ./packages/artifacts/matanuska-test-generator.tgz


vitest: ./packages/artifacts/matanuska-vitest.tgz
$(VITEST_JS_FILES): $(VITEST_TS_FILES)
	npm run build -w packages/vitest

./packages/artifacts/matanuska-vitest.tgz: $(VITEST_JS_FILES)
	cd packages/vitest && npm pack
	mkdir -p packages/artifacts
	mv packages/vitest/matanuska-vitest-*.tgz ./packages/artifacts/matanuska-vitest.tgz
	npm install ./packages/artifacts/matanuska-vitest.tgz



ast: $(CITREE_JS_FILES) ast/expr.ts ast/instr.ts ast/index.ts
	npm run build:ast
dist: ./dist/main.js ./dist/main.js.map

./dist/main.js ./dist/main.js.map: $(DIST_TS_FILES) .env release.env $(call TARGET_ENV,MATBAS_BUILD) grabthar.yml ./packages/artifacts/matanuska-citree.tgz ./packages/artifacts/matanuska-debug.tgz ./packages/artifacts/matanuska-entrypoint.tgz ./packages/artifacts/matanuska-fireball.tgz ./packages/artifacts/jfhbrook-grabthar.tgz ./packages/artifacts/matanuska-host.tgz ./packages/artifacts/matanuska-mock.tgz ./packages/artifacts/matanuska-output.tgz ./packages/artifacts/matanuska-path.tgz ./packages/artifacts/matanuska-telemetry.tgz ./packages/artifacts/matanuska-readline.tgz ./packages/artifacts/matanuska-test.tgz ./packages/artifacts/matanuska-test-generator.tgz ./packages/artifacts/matanuska-vitest.tgz
	ENV_FILE='$(call TARGET_ENV,MATBAS_BUILD)' npm run build

testdeps: test.env grabthar.yml ./packages/artifacts/matanuska-citree.tgz ./packages/artifacts/matanuska-debug.tgz ./packages/artifacts/matanuska-entrypoint.tgz ./packages/artifacts/matanuska-fireball.tgz ./packages/artifacts/jfhbrook-grabthar.tgz ./packages/artifacts/matanuska-host.tgz ./packages/artifacts/matanuska-mock.tgz ./packages/artifacts/matanuska-output.tgz ./packages/artifacts/matanuska-path.tgz ./packages/artifacts/matanuska-telemetry.tgz ./packages/artifacts/matanuska-readline.tgz ./packages/artifacts/matanuska-test.tgz ./packages/artifacts/matanuska-test-generator.tgz ./packages/artifacts/matanuska-vitest.tgz
bin: bin/matbas bin/matbasjs
bin/matbasjs: dist
	npm run build:entrypoint

bin/matbas: dist/main.js $(./core)
	cd core && qmake matanuska.pro
	cd core && make

core/config.h: $(call TARGET_ENV,MATBAS_BUILD)
	npm run build:headers



clean:
	rm -rf ./packages/artifacts
	npm run clean -w packages/citree
	npm run clean -w packages/debug
	npm run clean -w packages/entrypoint
	npm run clean -w packages/fireball
	npm run clean -w packages/host
	npm run clean -w packages/output
	npm run clean -w packages/readline
	npm run clean -w packages/test
	npm run clean -w packages/test-generator
	npm run clean -w packages/vitest
	npm run clean

