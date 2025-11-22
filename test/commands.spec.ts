import { test } from 'vitest';
import { t } from './helpers/tap';

import { executorTopic as topic } from './helpers/executor';

test('editing', async () => {
  await topic.swear(async ({ executor, editor, host }) => {
    executor.interactive = true;
    await executor.evaluate('load "./examples/001-hello-world.bas"');

    t.equal(editor.filename, 'examples/001-hello-world.bas');
    t.equal(editor.program.lines.length, 3);

    await host.expect(
      executor.evaluate('run'),
      null,
      'hello world\ngoodbye world',
    );

    await host.expect(
      executor.evaluate('list'),
      null,
      [
        '10 rem A simple hello world example',
        '20 print "hello world"',
        '30 print "goodbye world"',
      ].join('\n'),
    );

    await executor.evaluate('25 print "how you doin\' world?"');
    await executor.evaluate('renum');

    await host.expect(
      executor.evaluate('list'),
      null,
      [
        '10 rem A simple hello world example',
        '20 print "hello world"',
        '30 print "how you doin\' world?"',
        '40 print "goodbye world"',
      ].join('\n'),
    );

    await executor.evaluate('save "hello-world.bas"');

    t.ok(host.files['/home/josh/matanuska/hello-world.bas']);

    await executor.evaluate('new "script.bas"');

    t.equal(editor.filename, 'script.bas');
    t.equal(editor.program.lines.length, 0);
  });
});
