import { test } from 'vitest';
import { t } from './helpers/tap';

import { commandRunner } from '../commands';
import { RuntimeFault } from '../faults';
import { IntLiteral, StringLiteral } from '../ast/expr';
import { Instr, Expression, Print, Exit, Rem } from '../ast/instr';

import { executorTopic as topic } from './helpers/executor';

const INVALID_CMDS: Array<[string, Instr]> = [
  ['print', new Print(new IntLiteral(1))],
  ['exit', new Exit(null)],
];

const NOOP_CMDS: Array<[string, Instr]> = [['rem', new Rem('A witty remark.')]];

test('invalid commands', async () => {
  await topic.swear(async ({ executor, editor, host }) => {
    for (const [name, instr] of INVALID_CMDS) {
      await t.rejects(
        () => instr.accept(commandRunner(executor, editor, host, [])),
        RuntimeFault,
        `${name} is an invalid command`,
      );
    }
  });
});

test('noop commands', async () => {
  await topic.swear(async ({ executor, editor, host }) => {
    for (const [name, instr] of NOOP_CMDS) {
      t.equal(
        await instr.accept(commandRunner(executor, editor, host, [])),
        null,
        `${name} returns null`,
      );
    }
  });
});

test('expression', async () => {
  await topic.swear(async ({ executor, editor, host }) => {
    const expr = new Expression(new StringLiteral('hello'));
    const rv = await expr.accept(
      commandRunner(executor, editor, host, ['hello']),
    );
    t.equal(rv, 'hello');
  });
});

test('editing', async () => {
  await topic.swear(async ({ executor, editor, host }) => {
    await executor.eval('load "./examples/001-hello-world.bas"');

    t.equal(editor.filename, 'examples/001-hello-world.bas');
    t.equal(editor.program.lines.length, 3);

    await host.expect(executor.eval('run'), null, 'hello world\ngoodbye world');

    await host.expect(
      executor.eval('list'),
      null,
      [
        '10 rem A simple hello world example',
        '20 print "hello world"',
        '30 print "goodbye world"',
      ].join('\n'),
    );

    await executor.eval('25 print "how you doin\' world?"');
    await executor.eval('renum');

    await host.expect(
      executor.eval('list'),
      null,
      [
        '10 rem A simple hello world example',
        '20 print "hello world"',
        '30 print "how you doin\' world?"',
        '40 print "goodbye world"',
      ].join('\n'),
    );

    await executor.eval('save "hello-world.bas"');

    t.ok(host.files['/home/josh/matanuska/hello-world.bas']);

    await executor.eval('new "script.bas"');

    t.equal(editor.filename, 'script.bas');
    t.equal(editor.program.lines.length, 0);
  });
});
