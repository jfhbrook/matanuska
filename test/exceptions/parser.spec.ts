import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { ExitCode } from '../../exit';

import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
  mergeParseErrors,
  splitParseError,
  removeFromParseError,
} from '../../exceptions';
import { Source } from '../../ast/source';
import { FILENAME } from '../helpers/files';

describe('ParseError', () => {
  test('it can construct a ParseError', () => {
    const line = new Source('', '100', ' ', 'print someFn(ident');

    const exc = new ParseError([
      new SyntaxError('expected )', {
        filename: FILENAME,
        row: 0,
        isLine: false,
        lineNo: 100,
        cmdNo: null,
        offsetStart: 22,
        offsetEnd: 23,
        source: line,
      }),
      new SyntaxWarning('identifier has no sigil', {
        filename: FILENAME,
        row: 0,
        isLine: false,
        lineNo: 100,
        cmdNo: null,
        offsetStart: 17,
        offsetEnd: 18,
        source: line,
      }),
    ]);

    t.ok(exc);
    t.equal(exc.message, '');
    t.equal(exc.exitCode, ExitCode.Software);
    t.equal(exc.traceback, null);
    t.equal(exc.errors.length, 2);

    t.equal(exc.errors[0].message, 'expected )');
    t.same(exc.errors[0].filename, FILENAME);
    t.equal(exc.errors[0].lineNo, 100);
    t.same(exc.errors[0].offsetStart, 22);
    t.same(exc.errors[0].offsetEnd, 23);

    t.equal(exc.errors[1].message, 'identifier has no sigil');
    t.same(exc.errors[1].filename, FILENAME);
    t.equal(exc.errors[1].lineNo, 100);
    t.same(exc.errors[1].offsetStart, 17);
    t.same(exc.errors[1].offsetEnd, 18);
  });
});

describe('ParseWarning', () => {
  test('it can construct a ParseWarning', () => {
    const line = new Source('', '100', ' ', 'print someFn(ident)');

    const exc = new ParseWarning([
      new SyntaxWarning('identifier has no sigil', {
        filename: FILENAME,
        row: 0,
        isLine: false,
        lineNo: 100,
        cmdNo: null,
        offsetStart: 17,
        offsetEnd: 18,
        source: line,
      }),
    ]);

    t.ok(exc);
    t.equal(exc.message, '');
    t.equal(exc.traceback, null);
    t.equal(exc.warnings.length, 1);

    t.equal(exc.warnings[0].message, 'identifier has no sigil');
    t.same(exc.warnings[0].filename, FILENAME);
    t.equal(exc.warnings[0].lineNo, 100);
    t.same(exc.warnings[0].offsetStart, 17);
    t.same(exc.warnings[0].offsetEnd, 18);
  });
});

test('mergeParseErrors', () => {
  const PARSE_WARNING_1 = new ParseWarning([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '100', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '500', ' ', 'print someFn(ident)'),
    }),
  ]);

  const PARSE_WARNING_2 = new ParseWarning([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '200', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '600', ' ', 'print someFn(ident)'),
    }),
  ]);

  const PARSE_ERROR_1 = new ParseError([
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 2,
      isLine: false,
      lineNo: 300,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '300', ' ', 'print someFn(ident'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 6,
      isLine: false,
      lineNo: 700,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '700', ' ', 'print someFn(ident'),
    }),
  ]);

  const PARSE_ERROR_2 = new ParseError([
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 3,
      isLine: false,
      lineNo: 400,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '400', ' ', 'print someFn(ident'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 7,
      isLine: false,
      lineNo: 800,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '800', ' ', 'print someFn(ident'),
    }),
  ]);

  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_2, PARSE_WARNING_1]),
    'merge two warnings',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_ERROR_2, PARSE_ERROR_1]),
    'merge two errors',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_1, PARSE_ERROR_1]),
    'merge a warning and an error',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_1, null]),
    'merge a warning and null',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_WARNING_1, null]),
    'merge an error and null',
  );
  t.matchSnapshot(
    mergeParseErrors([PARSE_ERROR_1, PARSE_WARNING_2, null]),
    'merge a warning, an error and null',
  );
  t.matchSnapshot(mergeParseErrors([null, null, null]), 'merge a few nulls');
});

test('splitParseError', () => {
  const ERROR = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '100', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '200', ' ', 'print someFn(ident)'),
    }),

    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 2,
      isLine: false,
      lineNo: 300,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '300', ' ', 'print someFn(ident'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 3,
      isLine: false,
      lineNo: 400,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '400', ' ', 'print someFn(ident'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '500', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '600', ' ', 'print someFn(ident)'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 6,
      isLine: false,
      lineNo: 700,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '700', ' ', 'print someFn(ident'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 7,
      isLine: false,
      lineNo: 800,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '800', ' ', 'print someFn(ident'),
    }),
  ]);

  const WARN = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '100', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '200', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '500', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '600', ' ', 'print someFn(ident)'),
    }),
  ]);

  function testSplit(error: Record<number, any>, key: string) {
    for (const [k, err] of Object.entries(error)) {
      const errs = err.errors ? err.errors : err.warnings;
      for (const e of errs) {
        t.equal(String(k), String(e[key]));
      }
    }
  }

  testSplit(splitParseError(ERROR, 'row'), 'row');
  testSplit(splitParseError(WARN, 'row'), 'row');
  testSplit(splitParseError(ERROR, 'lineNo'), 'lineNo');
  testSplit(splitParseError(WARN, 'lineNo'), 'lineNo');
  t.same(splitParseError(null, 'row'), {});
});

test('removeFromParseError', () => {
  const ERROR = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '100', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '200', ' ', 'print someFn(ident)'),
    }),

    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 2,
      isLine: false,
      lineNo: 300,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '300', ' ', 'print someFn(ident'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 3,
      isLine: false,
      lineNo: 400,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '400', ' ', 'print someFn(ident'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '500', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '600', ' ', 'print someFn(ident)'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 6,
      isLine: false,
      lineNo: 700,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '700', ' ', 'print someFn(ident'),
    }),
    new SyntaxError('expected )', {
      filename: FILENAME,
      row: 7,
      isLine: false,
      lineNo: 800,
      cmdNo: null,
      offsetStart: 22,
      offsetEnd: 23,
      source: new Source('', '800', ' ', 'print someFn(ident)'),
    }),
  ]);

  const WARN = new ParseError([
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 0,
      isLine: true,
      lineNo: 100,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '100', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 1,
      isLine: true,
      lineNo: 200,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '200', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 4,
      isLine: true,
      lineNo: 500,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '500', ' ', 'print someFn(ident)'),
    }),
    new SyntaxWarning('identifier has no sigil', {
      filename: FILENAME,
      row: 5,
      isLine: true,
      lineNo: 600,
      cmdNo: null,
      offsetStart: 17,
      offsetEnd: 18,
      source: new Source('', '600', ' ', 'print someFn(ident)'),
    }),
  ]);

  function testRemove(error: any, key: string, value: number) {
    const errs = error.errors ? error.errors : error.warnings;
    for (const e of errs) {
      t.notEqual(String(e[key]), String(value));
    }
  }

  testRemove(removeFromParseError(ERROR, 'row', 2), 'row', 2);
  testRemove(removeFromParseError(WARN, 'row', 2), 'row', 2);
  t.same(removeFromParseError(null, 'row', 2), null);
  testRemove(removeFromParseError(ERROR, 'lineNo', 400), 'lineNo', 400);
  testRemove(removeFromParseError(WARN, 'lineNo', 400), 'lineNo', 400);
  t.same(removeFromParseError(null, 'lineNo', 400), null);
});
