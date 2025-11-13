import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { StringLiteral, ShellLiteral } from '../../ast/expr';
import { Command } from '../../ast/instr';
import { Cmd, Input } from '../../ast';
import { parseInput } from '../helpers/parser';

const PATHS = ['/', './', '..', '../', './', './pony', '.\\pony'];

describe('cd', () => {
  for (const path of PATHS) {
    test(path, () => {
      const source = `cd ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command('cd', [new ShellLiteral(path)], 0, source.length),
          ]),
        ]),
      );
    });
  }
});

describe('cp', () => {
  for (const path of PATHS) {
    const source = `cp ${path} "foo"`;
    test(source, () => {
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command(
              'cp',
              [new ShellLiteral(path), new StringLiteral('foo')],
              0,
              source.length,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('rm', () => {
  for (const path of PATHS) {
    test(path, () => {
      const source = `rm -rf ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command(
              'rm',
              [new ShellLiteral('-rf'), new ShellLiteral(path)],
              0,
              source.length,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('touch', () => {
  for (const path of PATHS) {
    test(path, () => {
      const source = `touch ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command('touch', [new ShellLiteral(path)], 0, source.length),
          ]),
        ]),
      );
    });
  }
});

describe('mv', () => {
  for (const path of PATHS) {
    test(path, () => {
      const source = `mv ${path} "foo"`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command(
              'mv',
              [new ShellLiteral(path), new StringLiteral('foo')],
              0,
              source.length,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('mkdir', () => {
  for (const path of PATHS) {
    test(path, () => {
      const source = `mkdir -p ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command(
              'mkdir',
              [new ShellLiteral('-p'), new ShellLiteral(path)],
              0,
              source.length,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('rmdir', () => {
  for (const path of PATHS) {
    test(path, () => {
      const source = `rmdir -p ${path}`;
      const result = parseInput(source);

      t.equal(result[1], null);

      t.same(
        result[0],
        new Input([
          new Cmd(10, 1, Source.command(source), [
            new Command(
              'rmdir',
              [new ShellLiteral('-p'), new ShellLiteral(path)],
              0,
              source.length,
            ),
          ]),
        ]),
      );
    });
  }
});

describe('pwd', () => {
  test('no flag', () => {
    const source = `pwd`;
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new Command('pwd', [], 0, 3)]),
      ]),
    );
  });

  test('-P flag', () => {
    const source = `pwd -P`;
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Command('pwd', [new ShellLiteral('-P')], 0, 6),
        ]),
      ]),
    );
  });
});
