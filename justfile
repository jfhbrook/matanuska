set dotenv-load := true

# Start the pure Node.js implementation of Matanuska BASIC
start *argv: build
  npm start {{ argv }}

# Start the burgeoning QT based implementation of Matanuska BASIC
start-qt:
  PATH="${PATH}:$(pwd)/bin" bin/matbas

# Build the AST
ast:
  npm run build:ast

# Run a development build
build: 
  make MATBAS_BUILD="${MATBAS_BUILD}"

# Run a release build
release:
  make MATBAS_BUILD=release

# Build Matanuska BASIC's JavaScript core
dist:
  make dist MATBAS_BUILD="${MATBAS_BUILD}"

# Run TypeScript type checks
check:
  npm run check

# Format code with prettier and clang-format
format:
  npm run format
  clang-format -i core/*.cpp core/*.h

# Lint code with eslint and shellcheck
lint:
  npm run lint
  npm run lint:shell

# Run top-level JavaScript tests
test:
  npm run build:testdeps
  npm run test:env
  npm test

# Run top-level JavaScript tests, taking snapshots
snap:
  npm run build:testdeps
  npm run test:env
  npm run snap

# Run fireball, Matanuska's OpenTelemetry backend
fireball:
  npm run fireball

# Generate a report of SLOC and other statistics
report:
  ./scripts/report.sh

# Clean build files, start from scratch
clean:
  make clean
