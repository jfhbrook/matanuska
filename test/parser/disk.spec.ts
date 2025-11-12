import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { StringLiteral, ShellLiteral } from '../../ast/expr';
import { Builtin } from '../../ast/instr';
import { Cmd, Input } from '../../ast';
import { parseInput } from '../helpers/parser';

const PATHS = ['/', './', '..', '../', './', './pony', '.\\pony'];

describe('cd', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `cd ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin('cd', [new ShellLiteral(path)], 0, 4),
          ]),
        ]),
      );
    });
  }
});

describe('cp', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `cp ${path} "foo"`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin(
              'cp',
              [new ShellLiteral(path), new StringLiteral('foo')],
              0,
              4,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('rm', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `rm -rf ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin(
              'rm',
              [new ShellLiteral(path), new ShellLiteral('-rf')],
              0,
              4,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('touch', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `touch ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin('touch', [new ShellLiteral(path)], 0, 4),
          ]),
        ]),
      );
    });
  }
});

describe('mv', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `mv ${path} "foo"`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin(
              'mv',
              [new ShellLiteral(path), new StringLiteral('foo')],
              0,
              4,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('mkdir', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `mkdir -p ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin(
              'mkdir',
              [new ShellLiteral(path), new ShellLiteral('-p')],
              0,
              4,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('rmdir', () => {
  for (const path of PATHS) {
    test.skip(path, () => {
      const source = `rmdir -p ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Builtin(
              'rmdir',
              [new ShellLiteral(path), new ShellLiteral('-p')],
              0,
              4,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('pwd', () => {
  test.skip('no flag', () => {
    const source = `pwd`;
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new Builtin('pwd', [], 0, 4)]),
      ]),
    );
  });

  test.skip('-P flag', () => {
    const source = `pwd -P`;
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Builtin('pwd', [new ShellLiteral('-p')], 0, 4),
        ]),
      ]),
    );
  });
});
