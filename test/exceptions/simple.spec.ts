import {
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  BaseWarning,
  Warning,
  DeprecationWarning,
  ValueError,
  NameError,
  ArithmeticError,
} from '../../exceptions';

import { simpleSuite } from '../helpers/exceptions';

simpleSuite('simple exceptions', [
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  ValueError,
  NameError,
  ArithmeticError,
]);

simpleSuite('simple warnings', [BaseWarning, Warning, DeprecationWarning]);
