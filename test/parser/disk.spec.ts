import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { StringLiteral, PathLiteral } from '../../ast/expr';
import { Cd, Cp, Rm, Touch, Mv, MkDir, RmDir, Pwd } from '../../ast/instr';
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
            new Cd(new PathLiteral(path), 0, 4),
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
            new Cp(
              [new PathLiteral(path)],
              new StringLiteral('foo'),
              false,
              false,
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
            new Rm([new PathLiteral(path)], true, true, false, 0, 4),
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
            new Touch([new PathLiteral(path)], 0, 4),
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
            new Mv([new PathLiteral(path)], new StringLiteral('foo'), 0, 4),
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
            new MkDir(new PathLiteral(path), true, null, 0, 4),
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
            new RmDir(new PathLiteral(path), true, 0, 4),
          ]),
        ]),
      );
    });
  }
});

test.skip('pwd', () => {
  const source = `pwd`;
  const result = parseInput(source);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([new Cmd(10, 1, Source.command(source), [new Pwd(true, 0, 4)])]),
  );
});
