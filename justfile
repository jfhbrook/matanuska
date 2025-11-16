build:
  npm run build
  node ./scripts/dist-header.js
  cd ./src && qmake matanuska.pro
  cd ./src && make

build-release:
  npm run build:release

build-ast:
  npm run build:ast

build-entrypoint:
  npm run build:entrypoint

build-test-generator:
  npm run build:test-generator

build-test:
  npm run build:test

build-test-activate:
  npm run build:test:activate

check:
  npm run check

format:
  npm run format
  clang-format -i src/*.cpp src/*.h

format-markdown:
  npm run format-markdown

start:
  npm start

fireball:
  fireball

lint:
  npm run lint

lint-shell:
  npm run lint:shell

lint-staged:
  npm run lint:staged

test:
  npm run test

test-env:
  npm run test:env

test-citree:
  npm run test:citree

snap:
  npm run snap

prepare:
  npm run prepare

report:
  npm run report

clean:
  npm run clean


