
.PHONY: default citree debug entrypoint fireball grabthar host mock output path telemetry readline test test-generator vitest ast dist testdeps bin

default: bin


MATBAS_BUILD = debug
TARGET_ENV = .make.$(shell echo $($(1))).env

$(call TARGET_ENV,MATBAS_BUILD):
	rm -rf .make.*.env
	if [[ '$(MATBAS_BUILD)' == 'debug' ]]; then cp .env $@; else cp release.env $@; fi


citree: ./packages/artifacts/matanuska-citree.tgz
./packages/citree/dist/main.js ./packages/citree/dist/ast.js ./packages/citree/dist/parser.js ./packages/citree/dist/imports.js ./packages/citree/dist/types.js ./packages/citree/dist/format.js ./packages/citree/dist/templates/index.js ./packages/citree/dist/index.js ./packages/citree/dist/paths.js ./packages/citree/dist/scanner.js: ./packages/citree/src/main.ts ./packages/citree/src/ast.ts ./packages/citree/src/parser.ts ./packages/citree/src/imports.ts ./packages/citree/src/types.ts ./packages/citree/src/format.ts ./packages/citree/src/templates/index.ts ./packages/citree/src/index.ts ./packages/citree/src/paths.ts ./packages/citree/src/scanner.ts
	npm run build:typescript -w packages/citree

packages/citree/example/ast.citree: ast/index.citree
	cp 'ast/index.citree' 'packages/citree/example/ast.citree'

./packages/citree/example/expr.ts,./packages/citree/example/instr.ts,./packages/citree/example/index.ts: packages/citree/example/ast.citree ./packages/citree/dist/main.js ./packages/citree/dist/ast.js ./packages/citree/dist/parser.js ./packages/citree/dist/imports.js ./packages/citree/dist/types.js ./packages/citree/dist/format.js ./packages/citree/dist/templates/index.js ./packages/citree/dist/index.js ./packages/citree/dist/paths.js ./packages/citree/dist/scanner.js

./packages/artifacts/matanuska-citree.tgz: ./packages/citree/dist/main.js ./packages/citree/dist/ast.js ./packages/citree/dist/parser.js ./packages/citree/dist/imports.js ./packages/citree/dist/types.js ./packages/citree/dist/format.js ./packages/citree/dist/templates/index.js ./packages/citree/dist/index.js ./packages/citree/dist/paths.js ./packages/citree/dist/scanner.js
	cd packages/citree && npm pack
	mkdir -p packages/artifacts
	mv packages/citree/matanuska-citree-*.tgz ./packages/artifacts/matanuska-citree.tgz
	npm install ./packages/artifacts/matanuska-citree.tgz


debug: ./packages/artifacts/matanuska-debug.tgz
./packages/debug/index.js: ./packages/debug/index.ts
	npm run build -w packages/debug

./packages/artifacts/matanuska-debug.tgz: ./packages/debug/index.js
	cd packages/debug && npm pack
	mkdir -p packages/artifacts
	mv packages/debug/matanuska-debug-*.tgz ./packages/artifacts/matanuska-debug.tgz
	npm install ./packages/artifacts/matanuska-debug.tgz


entrypoint: ./packages/artifacts/matanuska-entrypoint.tgz
./packages/entrypoint/dist/main.js ./packages/entrypoint/dist/index.js: ./packages/entrypoint/src/main.ts ./packages/entrypoint/src/index.ts
	npm run build -w packages/entrypoint

./packages/artifacts/matanuska-entrypoint.tgz: ./packages/entrypoint/dist/main.js ./packages/entrypoint/dist/index.js ./packages/entrypoint/modules/entrypoint/outputs.tf ./packages/entrypoint/modules/entrypoint/main.tf ./packages/entrypoint/modules/entrypoint/versions.tf ./packages/entrypoint/modules/entrypoint/variables.tf
	cd packages/entrypoint && npm pack
	mkdir -p packages/artifacts
	mv packages/entrypoint/matanuska-entrypoint-*.tgz ./packages/artifacts/matanuska-entrypoint.tgz
	npm install ./packages/artifacts/matanuska-entrypoint.tgz


fireball: ./packages/artifacts/matanuska-fireball.tgz
./packages/fireball/dist/main.js ./packages/fireball/dist/index.js: ./packages/fireball/src/main.ts ./packages/fireball/src/index.ts
	npm run build -w packages/fireball

./packages/artifacts/matanuska-fireball.tgz: ./packages/fireball/dist/main.js ./packages/fireball/dist/index.js ./packages/fireball/modules/fireball/outputs.tf ./packages/fireball/modules/fireball/main.tf ./packages/fireball/modules/fireball/versions.tf ./packages/fireball/modules/fireball/variables.tf
	cd packages/fireball && npm pack
	mkdir -p packages/artifacts
	mv packages/fireball/matanuska-fireball-*.tgz ./packages/artifacts/matanuska-fireball.tgz
	npm install ./packages/artifacts/matanuska-fireball.tgz


grabthar: ./packages/artifacts/jfhbrook-grabthar.tgz
./packages/artifacts/jfhbrook-grabthar.tgz: ./packages/grabthar/test.mjs ./packages/grabthar/constants.mjs ./packages/grabthar/log.mjs ./packages/grabthar/util.mjs ./packages/grabthar/lint.mjs ./packages/grabthar/format.mjs ./packages/grabthar/swc.mjs ./packages/grabthar/check.mjs ./packages/grabthar/vite.mjs ./packages/grabthar/tsc.mjs ./packages/grabthar/build.mjs ./packages/grabthar/vitest.config.mjs ./packages/grabthar/main.mjs ./packages/grabthar/index.mjs ./packages/grabthar/shellcheck.mjs ./packages/grabthar/io.mjs ./packages/grabthar/config.mjs ./packages/grabthar/eslint.config.mjs
	cd packages/grabthar && npm pack
	mkdir -p packages/artifacts
	mv packages/grabthar/jfhbrook-grabthar-*.tgz ./packages/artifacts/jfhbrook-grabthar.tgz
	npm install ./packages/artifacts/jfhbrook-grabthar.tgz


host: ./packages/artifacts/matanuska-host.tgz
./packages/host/errors.js ./packages/host/index.js: ./packages/host/errors.ts ./packages/host/index.ts
	npm run build -w packages/host

./packages/artifacts/matanuska-host.tgz: ./packages/host/errors.js ./packages/host/index.js
	cd packages/host && npm pack
	mkdir -p packages/artifacts
	mv packages/host/matanuska-host-*.tgz ./packages/artifacts/matanuska-host.tgz
	npm install ./packages/artifacts/matanuska-host.tgz


mock: ./packages/artifacts/matanuska-mock.tgz
./packages/mock/index.js: ./packages/mock/index.ts
	npm run build -w packages/mock

./packages/artifacts/matanuska-mock.tgz: ./packages/mock/index.js
	cd packages/mock && npm pack
	mkdir -p packages/artifacts
	mv packages/mock/matanuska-mock-*.tgz ./packages/artifacts/matanuska-mock.tgz
	npm install ./packages/artifacts/matanuska-mock.tgz


output: ./packages/artifacts/matanuska-output.tgz
./packages/output/index.js: ./packages/output/index.ts
	npm run build -w packages/output

./packages/artifacts/matanuska-output.tgz: ./packages/output/index.js
	cd packages/output && npm pack
	mkdir -p packages/artifacts
	mv packages/output/matanuska-output-*.tgz ./packages/artifacts/matanuska-output.tgz
	npm install ./packages/artifacts/matanuska-output.tgz


path: ./packages/artifacts/matanuska-path.tgz
./packages/path/index.js: ./packages/path/index.ts
	npm run build -w packages/path

./packages/artifacts/matanuska-path.tgz: ./packages/path/index.js
	cd packages/path && npm pack
	mkdir -p packages/artifacts
	mv packages/path/matanuska-path-*.tgz ./packages/artifacts/matanuska-path.tgz
	npm install ./packages/artifacts/matanuska-path.tgz


telemetry: ./packages/artifacts/matanuska-telemetry.tgz
./packages/telemetry/dist/index.js: ./packages/telemetry/index.ts
	npm run build -w packages/telemetry

./packages/artifacts/matanuska-telemetry.tgz: ./packages/telemetry/dist/index.js
	cd packages/telemetry && npm pack
	mkdir -p packages/artifacts
	mv packages/telemetry/matanuska-telemetry-*.tgz ./packages/artifacts/matanuska-telemetry.tgz
	npm install ./packages/artifacts/matanuska-telemetry.tgz


readline: ./packages/artifacts/matanuska-readline.tgz
./packages/readline/test/readline.spec.js ./packages/readline/index.js: ./packages/readline/test/readline.spec.ts ./packages/readline/index.ts
	npm run build -w packages/readline

./packages/artifacts/matanuska-readline.tgz: ./packages/readline/test/readline.spec.js ./packages/readline/index.js
	cd packages/readline && npm pack
	mkdir -p packages/artifacts
	mv packages/readline/matanuska-readline-*.tgz ./packages/artifacts/matanuska-readline.tgz
	npm install ./packages/artifacts/matanuska-readline.tgz


test: ./packages/artifacts/matanuska-test.tgz
./packages/test/test/index.spec.js ./packages/test/test/vitest.spec.js ./packages/test/vitest.js ./packages/test/index.js: ./packages/test/test/index.spec.ts ./packages/test/test/vitest.spec.ts ./packages/test/vitest.ts ./packages/test/index.ts
	npm run build -w packages/test

./packages/artifacts/matanuska-test.tgz: ./packages/test/test/index.spec.js ./packages/test/test/vitest.spec.js ./packages/test/vitest.js ./packages/test/index.js
	cd packages/test && npm pack
	mkdir -p packages/artifacts
	mv packages/test/matanuska-test-*.tgz ./packages/artifacts/matanuska-test.tgz
	npm install ./packages/artifacts/matanuska-test.tgz


test-generator: ./packages/artifacts/matanuska-test-generator.tgz
./packages/test-generator/precedence.js ./packages/test-generator/activate.js ./packages/test-generator/main.js ./packages/test-generator/format.js ./packages/test-generator/util.js ./packages/test-generator/index.js ./packages/test-generator/config.js: ./packages/test-generator/precedence.ts ./packages/test-generator/activate.ts ./packages/test-generator/main.ts ./packages/test-generator/format.ts ./packages/test-generator/util.ts ./packages/test-generator/index.ts ./packages/test-generator/config.ts
	npm run build -w packages/test-generator

./packages/artifacts/matanuska-test-generator.tgz: ./packages/test-generator/precedence.js ./packages/test-generator/activate.js ./packages/test-generator/main.js ./packages/test-generator/format.js ./packages/test-generator/util.js ./packages/test-generator/index.js ./packages/test-generator/config.js
	cd packages/test-generator && npm pack
	mkdir -p packages/artifacts
	mv packages/test-generator/matanuska-test-generator-*.tgz ./packages/artifacts/matanuska-test-generator.tgz
	npm install ./packages/artifacts/matanuska-test-generator.tgz


vitest: ./packages/artifacts/matanuska-vitest.tgz
./packages/vitest/test/vitest.spec.js ./packages/vitest/index.js: ./packages/vitest/test/vitest.spec.ts ./packages/vitest/index.ts
	npm run build -w packages/vitest

./packages/artifacts/matanuska-vitest.tgz: ./packages/vitest/test/vitest.spec.js ./packages/vitest/index.js
	cd packages/vitest && npm pack
	mkdir -p packages/artifacts
	mv packages/vitest/matanuska-vitest-*.tgz ./packages/artifacts/matanuska-vitest.tgz
	npm install ./packages/artifacts/matanuska-vitest.tgz



ast: ./packages/citree/dist/main.js ./packages/citree/dist/ast.js ./packages/citree/dist/parser.js ./packages/citree/dist/imports.js ./packages/citree/dist/types.js ./packages/citree/dist/format.js ./packages/citree/dist/templates/index.js ./packages/citree/dist/index.js ./packages/citree/dist/paths.js ./packages/citree/dist/scanner.js ast/expr.ts ast/instr.ts ast/index.ts
	npm run build:ast
dist: ./dist/main.js ./dist/main.js.map

./dist/main.js ./dist/main.js.map: ./faults.ts ./executor.ts ./translator.ts ./exit.ts ./main.ts ./test/shell.spec.ts ./test/env.spec.ts ./test/exit.spec.ts ./test/faults.spec.ts ./test/editor.spec.ts ./test/block.spec.ts ./test/commands.spec.ts ./test/value/cast.spec.ts ./test/value/truthiness.spec.ts ./test/value/typeof.spec.ts ./test/value/convert.spec.ts ./test/value/nullness.spec.ts ./test/disassembler.spec.ts ./test/parser/exit.spec.ts ./test/parser/rem.spec.ts ./test/parser/program.spec.ts ./test/parser/precedence.spec.ts ./test/parser/load.spec.ts ./test/parser/input.spec.ts ./test/parser/loops.ts ./test/parser/disk.spec.ts ./test/parser/conditionals.spec.ts ./test/parser/strings.spec.ts ./test/parser/print.spec.ts ./test/parser/expr.spec.ts ./test/parser/variables.spec.ts ./test/parser/list.spec.ts ./test/exceptions/parser.spec.ts ./test/exceptions/file.spec.ts ./test/exceptions/os.spec.ts ./test/exceptions/simple.spec.ts ./test/params.spec.ts ./test/format/expr.ts ./test/format/exit.ts ./test/format/index.spec.ts ./test/format/exceptions.ts ./test/format/instr.ts ./test/format/strings.spec.ts ./test/format/values.ts ./test/format/token.ts ./test/format/tree.ts ./test/config.spec.ts ./test/runtime.spec.ts ./test/scanner.spec.ts ./test/compiler/expr.ts ./test/compiler/errors.spec.ts ./test/compiler/index.spec.ts ./test/compiler/conditionals.ts ./test/compiler/looping.ts ./test/compiler/programs.ts ./test/compiler/instr.ts ./test/compiler/variables.ts ./test/helpers/executor.ts ./test/helpers/bytecode.ts ./test/helpers/exceptions.ts ./test/helpers/stack.ts ./test/helpers/cli.ts ./test/helpers/tap.ts ./test/helpers/parser.ts ./test/helpers/runtime.ts ./test/helpers/format.ts ./test/helpers/traceback.ts ./test/helpers/host.ts ./test/helpers/compiler.ts ./test/helpers/config.ts ./test/helpers/scanner.ts ./test/helpers/files.ts ./test/cli.spec.ts ./test/operations.spec.ts ./editor.ts ./errors.ts ./exceptions.ts ./debug.ts ./value/typeof.ts ./value/truthiness.ts ./value/nullness.ts ./value/types.ts ./value/convert.ts ./value/index.ts ./value/cast.ts ./stack.ts ./operations.ts ./parser.ts ./runtime.ts ./tokens.ts ./format.ts ./attic/process.ts ./attic/job.ts ./shell.ts ./bytecode/byte.ts ./bytecode/short.ts ./bytecode/chunk.ts ./bytecode/disassembler.ts ./bytecode/opcodes.ts ./traceback.ts ./ast/expr.ts ./ast/source.ts ./ast/instr.ts ./ast/util.ts ./ast/index.ts ./host.ts ./commands/cd.ts ./commands/base.ts ./commands/load.ts ./commands/renum.ts ./commands/new.ts ./commands/pwd.ts ./commands/index.ts ./commands/list.ts ./commands/run.ts ./commands/save.ts ./index.ts ./env.ts ./config.ts ./scanner.ts ./params.ts ./compiler/base.ts ./compiler/scope.ts ./compiler/block.ts ./compiler/index.ts ./vendor/text-table.ts ./vendor/strftime.ts .env release.env $(call TARGET_ENV,MATBAS_BUILD) grabthar.yml ./packages/artifacts/matanuska-citree.tgz ./packages/artifacts/matanuska-debug.tgz ./packages/artifacts/matanuska-entrypoint.tgz ./packages/artifacts/matanuska-fireball.tgz ./packages/artifacts/jfhbrook-grabthar.tgz ./packages/artifacts/matanuska-host.tgz ./packages/artifacts/matanuska-mock.tgz ./packages/artifacts/matanuska-output.tgz ./packages/artifacts/matanuska-path.tgz ./packages/artifacts/matanuska-telemetry.tgz ./packages/artifacts/matanuska-readline.tgz ./packages/artifacts/matanuska-test.tgz ./packages/artifacts/matanuska-test-generator.tgz ./packages/artifacts/matanuska-vitest.tgz
	ENV_FILE='.env release.env $(call TARGET_ENV,MATBAS_BUILD)' npm run build

testdeps: test.env grabthar.yml ./packages/artifacts/matanuska-citree.tgz ./packages/artifacts/matanuska-debug.tgz ./packages/artifacts/matanuska-entrypoint.tgz ./packages/artifacts/matanuska-fireball.tgz ./packages/artifacts/jfhbrook-grabthar.tgz ./packages/artifacts/matanuska-host.tgz ./packages/artifacts/matanuska-mock.tgz ./packages/artifacts/matanuska-output.tgz ./packages/artifacts/matanuska-path.tgz ./packages/artifacts/matanuska-telemetry.tgz ./packages/artifacts/matanuska-readline.tgz ./packages/artifacts/matanuska-test.tgz ./packages/artifacts/matanuska-test-generator.tgz ./packages/artifacts/matanuska-vitest.tgz
bin: bin/matbas bin/matbasjs
bin/matbasjs: dist
	npm run build:entrypoint

bin/matbas: dist/main.js ./core/dist.qrc ./core/config.h ./core/qrc_dist.cpp ./core/main.cpp ./core/matanuska.pro
	cd core && qmake matanuska.pro
	cd core && make

core/config.h: .env release.env $(call TARGET_ENV,MATBAS_BUILD)
	npm run build:headers



clean:
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

