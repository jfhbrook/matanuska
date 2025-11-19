import { describe, expect, test } from 'vitest';
import { discuss } from '@jfhbrook/swears';

import { Editor, Justify } from '../editor';
import { Line } from '../ast';

import { parseInput } from './helpers/parser';
import { mockConsoleHost } from './helpers/host';

type InsertFn = (source: string) => void;

async function withMockEditor(
  fn: (editor: Editor, insert: InsertFn) => void,
): Promise<void> {
  await mockConsoleHost(undefined, async (host) => {
    const editor = new Editor(host);

    function insert(source: string) {
      const [result] = parseInput(source);
      expect(result.input.length).toBe(1);
      const line = result.input[0];
      expect(line).toBeInstanceOf(Line);
      editor.setLine(line as Line, null);
    }

    fn(editor, insert);
  });
}

test('editor inserts', async () => {
  await withMockEditor((editor, insert) => {
    insert('10 print "hello"');
    insert('30 print "world"');
    insert('20 print "hey"');
    insert('15 rem');
    insert('20');

    expect(editor.list()).toMatchSnapshot();
  });
});

// TODO: Test that editor.program has been shifted as expected. This will
// involve a full traversal of editor.program, twice, in order to calculate
// how each element shifted. Remember, expressions and tokens inside the
// program are also shifted!
//
// TODO: Test that editor.warnings has been shifted as expected. This will
// involve scanning editor.warnings, twice, in order to calcualte how each
// element shifted. It will also involve constructing lines which create
// warnings!
describe('editor renum', async () => {
  test('mixed double/triple to all double', async () => {
    await withMockEditor((editor, insert) => {
      insert('10 print "foo"');
      insert('50 print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');

      editor.renum();

      expect(editor.list()).toMatchSnapshot();
    });
  });

  test('left justified to left justified', async () => {
    await withMockEditor((editor, insert) => {
      insert('10  print "foo"');
      insert('50  print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');
      insert('450 print "foo"');

      editor.renum();

      expect(editor.list()).toMatchSnapshot();
    });
  });

  test('left justified to right justified', async () => {
    await withMockEditor((editor, insert) => {
      editor.justify = Justify.Right;

      insert('10  print "foo"');
      insert('50  print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');
      insert('450 print "foo"');

      editor.renum();

      expect(editor.list()).toMatchSnapshot();
    });
  });

  test('right justified to left justified', async () => {
    await withMockEditor((editor, insert) => {
      insert(' 10 print "foo"');
      insert(' 50 print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');
      insert('450 print "foo"');

      editor.renum();

      expect(editor.list()).toMatchSnapshot();
    });
  });
});
