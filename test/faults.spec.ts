import { AssertionError } from 'node:assert';

import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { ExitCode } from '../exit';

import {
  BaseFault,
  Fault,
  RuntimeFault,
  NotImplementedFault,
  UsageFault,
} from '../faults';
import { TRACEBACK } from './helpers/traceback';

const SIMPLE_FAULTS: Array<typeof BaseFault> = [BaseFault, Fault];

function simpleTest(ctor: typeof BaseFault): void {
  test(`Can construct a ${ctor.name} with a traceback`, async () => {
    const fault = new ctor('Some fault', TRACEBACK);

    t.ok(fault);
    t.equal(fault.message, 'Some fault');
    t.type(fault, Error);
    t.type(fault, ctor);
    t.same(fault.traceback, TRACEBACK);
  });

  test(`Can construct a ${ctor.name} without a traceback`, async () => {
    const traceback = null;
    const fault = new ctor('Some fault', traceback);

    t.ok(fault);
    t.equal(fault.message, 'Some fault');
    t.type(fault, Error);
    t.type(fault, ctor);
    t.same(fault.traceback, traceback);
  });
}

describe('For simple faults', async () => {
  for (const ctor of SIMPLE_FAULTS) {
    simpleTest(ctor);
  }
});

const RUNTIME_FAULTS: Array<typeof RuntimeFault> = [RuntimeFault];

function runtimeTest(ctor: typeof RuntimeFault): void {
  const underlying = new AssertionError({
    message: 'underlying assertion',
    actual: false,
    expected: true,
    operator: '===',
  });

  test(`Can construct a ${ctor.name} with a traceback`, async () => {
    const fault = new ctor('Some runtime fault', underlying, TRACEBACK);

    t.ok(fault);
    t.equal(fault.message, 'Some runtime fault');
    t.type(fault, Error);
    t.type(fault, ctor);
    t.equal(fault.error, underlying);
    t.equal(fault.exitCode, ExitCode.Software);
    t.same(fault.traceback, TRACEBACK);
  });

  test(`Can construct a ${ctor.name} without a traceback`, async () => {
    const fault = new ctor('Some runtime fault', underlying, null);

    t.ok(fault);
    t.equal(fault.message, 'Some runtime fault');
    t.type(fault, Error);
    t.type(fault, ctor);
    t.equal(fault.error, underlying);
    t.equal(fault.exitCode, ExitCode.Software);
    t.same(fault.traceback, null);
  });
}

describe('For runtime faults', async () => {
  for (const ctor of RUNTIME_FAULTS) {
    runtimeTest(ctor);
  }
});

describe('For NotImplementedFault', async () => {
  test(`Can construct a NotImplementedFault with a traceback`, async () => {
    const fault = new NotImplementedFault('Not implemented', TRACEBACK);

    t.ok(fault);
    t.equal(fault.message, 'Not implemented');
    t.type(fault, Error);
    t.type(fault, NotImplementedFault);
    t.equal(fault.error, fault);
    t.equal(fault.exitCode, ExitCode.Software);
    t.same(fault.traceback, TRACEBACK);
  });

  test(`Can construct a NotImplementedFault without a traceback`, async () => {
    const fault = new NotImplementedFault('Some runtime fault', null);

    t.ok(fault);
    t.equal(fault.message, 'Some runtime fault');
    t.type(fault, Error);
    t.type(fault, NotImplementedFault);
    t.equal(fault.error, fault);
    t.equal(fault.exitCode, ExitCode.Software);
    t.same(fault.traceback, null);
  });
});

describe('For UsageFault', () => {
  test(`Can construct a UsageFault`, async () => {
    const fault = new UsageFault('Usage: lol');

    t.ok(fault);
    t.equal(fault.message, 'Usage: lol');
    t.type(fault, UsageFault);
    t.same(fault.traceback, null);
  });
});
