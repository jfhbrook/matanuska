import { runFormatSuite } from '../helpers/format';

import { valuesSuite } from './values';
import {
  tracebackSuite,
  exceptionsSuite,
  faultsSuite,
  parserExceptionsSuite,
} from './exceptions';
import { exitSuite } from './exit';
import { tokenSuite } from './token';
import { exprSuite } from './expr';
import { instructionSuite } from './instr';
import { treeSuite } from './tree';
import { stackSuite } from './stack';

runFormatSuite('values', valuesSuite);
runFormatSuite('traceback', tracebackSuite);
runFormatSuite('exceptions', exceptionsSuite);
runFormatSuite('parser exceptions', parserExceptionsSuite);
runFormatSuite('faults', faultsSuite);
runFormatSuite('exit', exitSuite);
runFormatSuite('token', tokenSuite);
runFormatSuite('expr', exprSuite);
runFormatSuite('instr', instructionSuite);
runFormatSuite('tree', treeSuite);
runFormatSuite('stack', stackSuite);
