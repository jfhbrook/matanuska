import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { ShellLiteral, StringLiteral } from '../../ast/expr';
import { Load } from '../../ast/instr';
import { Cmd, Input } from '../../ast';
import { throws } from '../helpers/exceptions';
import { parseInput } from '../helpers/parser';

describe('load', () => {
  test('load with filename', () => {
    const source = 'load "./examples/001-hello-world.bas"';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            [new StringLiteral('./examples/001-hello-world.bas')],
            0,
            37,
          ),
        ]),
      ]),
    );
  });

  test('load with path literal', () => {
    const source = 'load ./examples/001-hello-world.bas';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load([new ShellLiteral('./examples/001-hello-world.bas')], 0, 35),
        ]),
      ]),
    );
  });

  test('load with filename and --run', () => {
    const source = 'load "./examples/001-hello-world.bas" --run';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            [
              new StringLiteral('./examples/001-hello-world.bas'),
              new ShellLiteral('--run'),
            ],
            0,
            43,
          ),
        ]),
      ]),
    );
  });

  test('load with filename and --no-run', () => {
    const source = 'load "./examples/001-hello-world.bas" --no-run';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            [
              new StringLiteral('./examples/001-hello-world.bas'),
              new ShellLiteral('--no-run'),
            ],
            0,
            46,
          ),
        ]),
      ]),
    );
  });

  test('load with no filename', () => {
    const source = 'load';
    throws(() => {
      parseInput(source);
    });
  });
});
