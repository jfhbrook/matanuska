.PHONY: bin dist

bin: bin/qt-matbas

dist:
	npm run build

core/dist.h: dist
	node ./scripts/dist-header.js

bin/qt-matbas: dist core/dist.h
	cd core && qmake matanuska.pro
	cd core && make
