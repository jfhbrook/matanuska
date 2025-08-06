import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

import { Source } from '../../ast/source';
import { StringLiteral } from '../../ast/expr';
import { Print } from '../../ast/instr';
import { Line, Program } from '../../ast';
import { FILENAME } from '../helpers/files';

export function treeSuite<F extends Formatter>(formatter: F): void {
  test('it formats a Line', () => {
    t.matchSnapshot(
      formatter.format(
        new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world')),
        ]),
      ),
    );
  });

  test('it formats a Program', () => {
    t.matchSnapshot(
      formatter.format(
        new Program(FILENAME, [
          new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
            new Print(new StringLiteral('hello world')),
          ]),
        ]),
      ),
    );
  });
}
