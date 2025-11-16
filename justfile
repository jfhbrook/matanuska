set dotenv-load := true

start: build
  npm start

build: 
  MATBAS_BUILD="${MATBAS_BUILD}" make

check:
  npm run check

format:
  npm run format
  npm run format:markdown
  clang-format -i src/*.cpp src/*.h

fireball:
  npm run fireball

lint:
  npm run lint
  npm run lint:shell

lint-staged:
  npm run lint:staged

test: build
  npm run test:env
  npm test

test-citree:
  make citree
  npm test -w packages/citree

test-grabthar:
  npm test -w packages/grabthar

snap:
  npm run snap

report:
  ./scripts/report.sh

clean:
  make clean
