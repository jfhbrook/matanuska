.PHONY: default ast bin citree test-generator

# MATBAS_BUILD = debug

TYPESCRIPT_FILES := $(find . -name '*.ts' -not -path './node_modules/*' -not -path './packages/*/node_modules/*')

default: bin

# ast

ast: ast/expr.ts ast/instr.ts ast/index.ts

ast/expr.ts ast/instr.ts ast/index.ts: ast/index.citree
	npm run build:ast

# dist

dist: dist/main.js dist/main.js.map

dist/main.js dist/main.js.map: ast/*.ts *.yml *.json $(TYPESCRIPT_FILES)
	npm run build

# bin

bin: bin/qt-matbas

core/dist.h: dist
	node ./scripts/dist-header.js

bin/qt-matbas: dist core/dist.h
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
