import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

import { Exit, ExitCode } from '../../exit';

export function exitSuite<F extends Formatter>(formatter: F): void {
  test('it formats an Exit with a message', () => {
    t.matchSnapshot(formatter.format(new Exit(ExitCode.Success, 'message')));
  });

  test('it formats an Exit without message', () => {
    t.matchSnapshot(formatter.format(new Exit(ExitCode.Success)));
  });
}
