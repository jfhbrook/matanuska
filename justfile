set dotenv-load := true

start: build
  npm start

start-qt:
  PATH="${PATH}:$(pwd)/bin" bin/matbas

build: 
  make MATBAS_BUILD="${MATBAS_BUILD}"

release:
  make MATBAS_BUILD=release

dist:
  make dist MATBAS_BUILD="${MATBAS_BUILD}"

check:
  make testdeps
  npm run check

format:
  npm run format
  clang-format -i core/*.cpp core/*.h

fireball:
  npm run fireball

lint:
  npm run lint
  npm run lint:shell

lint-staged:
  npm run lint:staged

test:
  make testdeps
  npm run test:env
  npm test

snap:
  npm run snap

report:
  ./scripts/report.sh

clean:
  make clean
