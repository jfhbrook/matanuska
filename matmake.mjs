#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

//
// Build spec
//

const PHONY = [];
const ARTIFACTS = [];
const DYNAMIC_TARGETS = [];
const astSpecFile = 'ast/index.citree';

/*
 * environment shenanigans
 *
 * This is a hack to get Make to depend on changes to the MATBAS_BUILD
 * environment variable. See:
 *
 *     https://stackoverflow.com/questions/11647859/make-targets-depend-on-variables
 */

const envPrelude = `
MATBAS_BUILD = debug
TARGET_ENV = .make.$(shell echo $($(1))).env

$(call TARGET_ENV,MATBAS_BUILD):
	rm -rf .make.*.env
	if [[ '$(MATBAS_BUILD)' == 'debug' ]]; then cp .env $@; else cp release.env $@; fi
`;

const env = '$(call TARGET_ENV,MATBAS_BUILD)';

// Default
const default_ = phony('default: bin');

/*
 * Packages
 */

// citree
const [citreeTsFiles, citreeJsFiles] = tscPackageFiles('CITREE_FILES', './packages/citree/src', null, [['src', 'dist']]);
const citreeExampleSpecFile = 'packages/citree/example/ast.citree';
const citreeExampleTsFiles = tsFiles('CITREE_EXAMPLE_FILES', './packages/citree/example');

const citree = `${phony('citree')}: ${tarball('citree', 'matanuska')}
${tgts(citreeJsFiles)}: ${deps(citreeTsFiles)}
	npm run build:typescript -w packages/citree

${citreeExampleSpecFile}: ${astSpecFile}
	cp '${astSpecFile}' '${citreeExampleSpecFile}'

${citreeExampleTsFiles}: ${deps([citreeExampleSpecFile], citreeJsFiles)}

${install('citree', 'matanuska', deps(citreeJsFiles))}
`;

// debug
const [debugTsFiles, debugJsFiles] = tscPackageFiles('DEBUG_FILES', './packages/debug');

const debug = tscBuild('debug', 'matanuska', debugTsFiles, debugJsFiles);

// entrypoint
const [entrypointTsFiles, entrypointJsFiles] = tscPackageFiles('ENTRYPOINT_FILES', './packages/entrypoint', null, [['src', 'dist']]);
const entrypointTfFiles = tfFiles('ENTRYPOINT_TF_FILES', './packages/entrypoint/modules');

const entrypoint = tscBuild('entrypoint', 'matanuska', [entrypointTsFiles, entrypointTfFiles], entrypointJsFiles);

// fireball
const [fireballTsFiles, fireballJsFiles] = tscPackageFiles('FIREBALL_FILES', './packages/fireball', null, [['src', 'dist']]);
const fireballTfFiles = tfFiles('FIREBALL_TF_FILES', './packages/fireball/modules');

const fireball = tscBuild('fireball', 'matanuska', [fireballTsFiles, fireballTfFiles], fireballJsFiles);

// grabthar
const grabtharJsFiles = vanillaPackageFiles('GRABTHAR_JS_FILES', './packages/grabthar', ['./packages/grabthar/test']);

const grabthar = `${phony('grabthar')}: ${tarball('grabthar', 'jfhbrook')}
${install('grabthar', 'jfhbrook', deps(grabtharJsFiles))}
`;


// host
const [hostTsFiles, hostJsFiles] = tscPackageFiles('HOST_FILES', './packages/host', ['./packages/host/test']);

const host = `${phony('host')}: ${tarball('host', 'matanuska')}
${tgts(hostJsFiles)}: ${deps(hostTsFiles)}
	npm run build -w packages/host

${install('host', 'matanuska', deps(hostJsFiles))}
`;

// mock
const [mockTsFiles, mockJsFiles] = tscPackageFiles('MOCK_FILES', './packages/mock', ['./packages/mock/test']);

const mock = tscBuild('mock', 'matanuska', mockTsFiles, mockJsFiles);

// output
const [outputTsFiles, outputJsFiles] = tscPackageFiles('OUTPUT_FILES', './packages/output', ['./packages/output/test']);

const output = tscBuild('output', 'matanuska', outputTsFiles, outputJsFiles);

const [pathTsFiles, pathJsFiles] = tscPackageFiles('PATH_FILES', './packages/path');

const path = tscBuild('path', 'matanuska', pathTsFiles, pathJsFiles);

// telemetry
const telemetryTsFiles = tsFiles('TELEMETRY_TS_FILES', './packages/telemetry');
const telemetryJsFiles = ['./packages/telemetry/dist/index.js'];

const telemetry = tscBuild('telemetry', 'matanuska', telemetryTsFiles, telemetryJsFiles);

// readline
const [readlineTsFiles, readlineJsFiles] = tscPackageFiles('READLINE_FILES', './packages/readline');

const readline = tscBuild('readline', 'matanuska', readlineTsFiles, readlineJsFiles);

// test framework
const [testTsFiles, testJsFiles] = tscPackageFiles('TEST_FILES', './packages/test');

const test = tscBuild('test', 'matanuska', testTsFiles, testJsFiles);

// test generator
const [testGeneratorTsFiles, testGeneratorJsFiles] = tscPackageFiles('TEST_GENERATOR_FILES', './packages/test-generator');

const testGenerator = tscBuild('test-generator', 'matanuska', testGeneratorTsFiles, testGeneratorJsFiles);

// vitest runner
const [vitestTsFiles, vitestJsFiles] = tscPackageFiles('VITEST_FILES', './packages/vitest');

const vitest = tscBuild('vitest', 'matanuska', vitestTsFiles, vitestJsFiles);

/*
 * Core
 */

// AST
const astTsFiles = ['ast/expr.ts', 'ast/instr.ts', 'ast/index.ts'];
const ast = phony(`ast: ${deps(citreeJsFiles, astTsFiles)}
	npm run build:ast`);

// dist
const distTsFiles = tsFiles('DIST_TS_FILES', '.', ['./packages'])
const distJsFiles = ['./dist/main.js', './dist/main.js.map'];
const dist = `${phony('dist')}: ${deps(distJsFiles)}

${tgts(distJsFiles)}: ${deps(distTsFiles, ['.env', 'release.env', env, 'grabthar.yml'], ARTIFACTS)}
	ENV_FILE='${env}' npm run build
`;

const testDeps = `${phony('testdeps')}: ${deps(['test.env', 'grabthar.yml'], ARTIFACTS)}`

const bin = `${phony('bin')}: bin/matbas bin/matbasjs`;

const matbasjs = `bin/matbasjs: dist
	npm run build:entrypoint
`;

const coreFiles = cppFiles('./core');

const matbas = `bin/matbas: dist/main.js ${deps(coreFiles)}
	cd core && qmake matanuska.pro
	cd core && make

core/config.h: ${env}
	npm run build:headers
`;

const clean = `
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
`

// Vroom
make(`
.PHONY: ${PHONY.join(' ')}

${default_}

${envPrelude}

${DYNAMIC_TARGETS.join('\n')}

${citree}
${debug}
${entrypoint}
${fireball}
${grabthar}
${host}
${mock}
${output}
${path}
${telemetry}
${readline}
${test}
${testGenerator}
${vitest}

${ast}
${dist}
${testDeps}
${bin}
${matbasjs}
${matbas}

${clean}
`);

//
// Helper functions
//

function tsFiles(name, dir, not) {
  not = not || [];
  const notArgs = not.concat(['./node_modules', `${dir}/node_modules`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  DYNAMIC_TARGETS.push(`${name} := $(shell find . -name '*.ts' -path '${dir}/*' ${notArgs})`);

  return `$(${name})`;
}

function jsFiles(name, dir, not, replace) {
  not = not || [];
  const notArgs = not.concat(['./node_modules', `${dir}/node_modules`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  replace = replace || [];
  let replaceGrep = replace.map((rep) => {
    return rep.map(([from_, to]) => {
      return `sed 's^${from_}^${to}^'`
    }).join(' | ');
  }).join(' | ');

  if (replaceGrep.length) {
    replaceGrep = ' | ' + replaceGrep;
  }

  DYNAMIC_TARGETS.push(`${name} := $(shell find . -name '*.ts' -path '${dir}/*' ${notArgs} | sed 's/.ts/.js/'${replaceGrep})`);

  return `$(${name})`;
}

function tscPackageFiles(name, dir, not, replace) {
  const ts = tsFiles(name.replace('_FILES', '_TS_FILES'), dir, not);
  const js = jsFiles(name.replace('_FILES', '_JS_FILES'), dir, not, replace);
  return [ts, js];
}

function tfFiles(name, dir, not) {
  not = not || [];
  const notArgs = not.concat([`${dir}/.terraform`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  DYNAMIC_TARGETS.push(`${name} := $(shell find . -name '*.tf' -path '${dir}/*' ${notArgs})`);

  return `$(${name})`;
}

function cppFiles(name, dir, not) {
  not = not || [];
  const notArgs = not.map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  DYNAMIC_TARGETS.push(`${name} := $(shell find . \\( -name '*.cpp' -o -name '*.h' -o -name '*.qrc' -o -name '*.pro' \\) -path '${dir}/*' ${notArgs})`);

  return `$(${name})`;
}

function vanillaPackageFiles(name, dir, not) {
  not = not || [];
  const notArgs = not.concat(['./node_modules', `${dir}/node_modules`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  DYNAMIC_TARGETS.push(`${name} := $(shell find . \\( -name '*.js' -o -name '*.mjs' \\) -path '${dir}/*' ${notArgs})`);

  return `$(${name})`;
}

function phony(task) {
  const name = task.split(':')[0].trim();
  PHONY.push(name);

  return task;
}

function deps(...files) {
  let dependencies = []
  for (let fs of files) {
    dependencies = dependencies.concat(fs);
  }
  return dependencies.join(' ');
}

function tgts(...files) {
  let targets = []
  for (let fs of files) {
    targets = targets.concat(fs);
  }
  return targets.join(' ');
}

function tarball(name, prefix) {
  prefix = prefix ? `${prefix}-` : '';
  return `./packages/artifacts/${prefix}${name}.tgz`;
}

function install(name, prefix, deps) {
  const artifact = tarball(name, prefix);
  prefix = prefix ? `${prefix}-` : '';

  ARTIFACTS.push(artifact);

  return `${artifact}: ${deps}
	cd packages/${name} && npm pack
	mkdir -p packages/artifacts
	mv packages/${name}/${prefix}${name}-*.tgz ${artifact}
	npm install ${artifact}
`;
}

function tscBuild(name, prefix, tsFiles, jsFiles) {
  return`${phony(name)}: ${tarball(name, prefix)}
${tgts(jsFiles)}: ${deps(tsFiles)}
	npm run build -w packages/${name}

${install(name, prefix, deps(jsFiles))}
`;
}

function make(contents) {
  writeFileSync('Makefile', contents, 'utf8');
}
