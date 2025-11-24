#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

//
// Build spec
//

const PHONY = [];
const ARTIFACTS = [];
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

const env = '.env release.env $(call TARGET_ENV,MATBAS_BUILD)';

// Default
const default_ = phony('default: bin');

/*
 * Packages
 */

// citree
const [citreeTsFiles, citreeJsFiles] = tscPackageFiles('./packages/citree/src', null, [['src', 'dist']]);
const citreeExampleSpecFile = 'packages/citree/example/ast.citree';
const citreeExampleTsFiles = tsFiles('./packages/citree/example');

const citree = `${phony('citree')}: ${tarball('citree', 'matanuska')}
${tgts(citreeJsFiles)}: ${deps(citreeTsFiles)}
	npm run build:typescript -w packages/citree

${citreeExampleSpecFile}: ${astSpecFile}
	cp '${astSpecFile}' '${citreeExampleSpecFile}'

${citreeExampleTsFiles}: ${deps([citreeExampleSpecFile], citreeJsFiles)}

${install('citree', 'matanuska', deps(citreeJsFiles))}
`;

// debug
const [debugTsFiles, debugJsFiles] = tscPackageFiles('./packages/debug');

const debug = `${phony('debug')}: ${tarball('debug', 'matanuska')}
${tgts(debugJsFiles)}: ${deps(debugTsFiles)}
	npm run build -w packages/debug

${install('debug', 'matanuska', deps(debugJsFiles))}
`;

// entrypoint
const [entrypointTsFiles, entrypointJsFiles] = tscPackageFiles('./packages/entrypoint', null, [['src', 'dist']]);
const entrypointTfFiles = tfFiles('./packages/entrypoint/modules');

const entrypoint = `${phony('entrypoint')}: ${tarball('entrypoint', 'matanuska')}
${tgts(entrypointJsFiles)}: ${deps(entrypointTsFiles)}
	npm run build -w packages/entrypoint

${install('entrypoint', 'matanuska', deps(entrypointJsFiles, entrypointTfFiles))}
`;

// fireball
const [fireballTsFiles, fireballJsFiles] = tscPackageFiles('./packages/fireball', null, [['src', 'dist']]);
const fireballTfFiles = tfFiles('./packages/fireball/modules');

const fireball = `${phony('fireball')}: ${tarball('fireball', 'matanuska')}
${tgts(fireballJsFiles)}: ${deps(fireballTsFiles)}
	npm run build -w packages/fireball

${install('fireball', 'matanuska', deps(fireballJsFiles, fireballTfFiles))}
`;

// grabthar
const grabtharJsFiles = vanillaPackageFiles('./packages/grabthar', ['./packages/grabthar/test']);

const grabthar = `${phony('grabthar')}: ${tarball('grabthar', 'jfhbrook')}
${install('grabthar', 'jfhbrook', deps(grabtharJsFiles))}
`;


// host
const [hostTsFiles, hostJsFiles] = tscPackageFiles('./packages/host', ['./packages/host/test']);

const host = `${phony('host')}: ${tarball('host', 'matanuska')}
${tgts(hostJsFiles)}: ${deps(hostTsFiles)}
	npm run build -w packages/host

${install('host', 'matanuska', deps(hostJsFiles))}
`;

// mock
const [mockTsFiles, mockJsFiles] = tscPackageFiles('./packages/mock', ['./packages/mock/test']);

const mock = `${phony('mock')}: ${tarball('mock', 'matanuska')}
${tgts(mockJsFiles)}: ${deps(mockTsFiles)}
	npm run build -w packages/mock

${install('mock', 'matanuska', deps(mockJsFiles))}
`;

// output
const [outputTsFiles, outputJsFiles] = tscPackageFiles('./packages/output', ['./packages/output/test']);

const output = `${phony('output')}: ${tarball('output', 'matanuska')}
${tgts(outputJsFiles)}: ${deps(outputTsFiles)}
	npm run build -w packages/output

${install('output', 'matanuska', deps(outputJsFiles))}
`;

const [pathTsFiles, pathJsFiles] = tscPackageFiles('./packages/path');

const path = `${phony('path')}: ${tarball('path', 'matanuska')}
${tgts(pathJsFiles)}: ${deps(pathTsFiles)}
	npm run build -w packages/path

${install('path', 'matanuska', deps(pathJsFiles))}
`;

// telemetry
const telemetryTsFiles = tsFiles('./packages/telemetry');
const telemetryJsFiles = ['./packages/telemetry/dist/index.js'];

const telemetry = tscBuild('telemetry', 'matanuska', telemetryTsFiles, telemetryJsFiles);

// readline
const [readlineTsFiles, readlineJsFiles] = tscPackageFiles('./packages/readline');

const readline = tscBuild('readline', 'matanuska', readlineTsFiles, readlineJsFiles);

// test framework
const [testTsFiles, testJsFiles] = tscPackageFiles('./packages/test');

const test = tscBuild('test', 'matanuska', testTsFiles, testJsFiles);

// test generator
const [testGeneratorTsFiles, testGeneratorJsFiles] = tscPackageFiles('./packages/test-generator');

const testGenerator = tscBuild('test-generator', 'matanuska', testGeneratorTsFiles, testGeneratorJsFiles);

// vitest runner
const [vitestTsFiles, vitestJsFiles] = tscPackageFiles('./packages/vitest');

const vitest = tscBuild('vitest', 'matanuska', vitestTsFiles, vitestJsFiles);

/*
 * Core
 */

// AST
const astTsFiles = ['ast/expr.ts', 'ast/instr.ts', 'ast/index.ts'];
const ast = phony(`ast: ${deps(citreeJsFiles, astTsFiles)}
	npm run build:ast`);

// dist
const distTsFiles = tsFiles('.', ['./packages'])
const distJsFiles = ['./dist/main.js', './dist/main.js.map'];
const dist = `${phony('dist')}: ${deps(distJsFiles)}

${tgts(distJsFiles)}: ${deps(distTsFiles, [env, 'grabthar.yml'], ARTIFACTS)}
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

function tsFiles(dir, not) {
  not = not || [];
  const notArgs = not.concat(['./node_modules', `${dir}/node_modules`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  const find = execSync(`find . -name '*.ts' -path '${dir}/*' ${notArgs}`, { encoding: 'utf8' });
  return find.split('\n').filter((path) => {
    return !path.match(/\.d\.ts$/) && path.length;
  });
}

function jsFiles(tsFiles, replace) {
  replace = replace || [];
  return tsFiles.map((file) => {
    let ret = file.replace(/\.ts$/, '.js');
    for (let [from_, to] of replace) {
      ret = ret.replace(from_, to);
    }
    return ret;
  });
}

function tscPackageFiles(dir, not, replace) {
  const ts = tsFiles(dir, not);
  const js = jsFiles(ts, replace);
  return [ts, js];
}

function tfFiles(dir, not) {
  not = not || [];
  const notArgs = not.concat([`${dir}/.terraform/*`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  const find = execSync(`find . -name '*.tf' -path '${dir}/*' ${notArgs}`, { encoding: 'utf8' });
  return find.split('\n').filter((path) => {
    return path.length;
  });
}

function cppFiles(dir, not) {
  not = not || [];
  const notArgs = not.map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  const find = execSync(`find . \\( -name '*.cpp' -o -name '*.h' -o -name '*.qrc' -o -name '*.pro' \\) -path '${dir}/*' ${notArgs}`, { encoding: 'utf8' });
  return find.split('\n').filter((path) => {
    return path.length;
  });
}

function vanillaPackageFiles(dir, not) {
  not = not || [];
  const notArgs = not.concat(['./node_modules', `${dir}/node_modules`]).map((dir) => {
    return `-not -path '${dir}/*'`;
  }).join(' ');

  const find = execSync(`find . \\( -name '*.js' -o -name '*.mjs' \\) -path '${dir}/*' ${notArgs}`, { encoding: 'utf8' });
  return find.split('\n').filter((path) => {
    return path.length;
  });
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
