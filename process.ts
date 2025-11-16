import * as nodeProcess from 'node:process';

import { Channel } from './channel';
import { NotImplementedError } from './exceptions';
import { formatter } from './format';
import { Value } from './value';
import { nullish } from './value/nullness';

export type Pid = number;

export type Env = Record<string, Value>;

abstract class IOSpec {
  public abstract nodeStdIO(): string;
}

export class Inherit extends IOSpec {
  public nodeStdIO(): string {
    return 'inherit';
  }
}

export const INHERIT = new Inherit();

export class Pipe extends IOSpec {
  constructor(
    public channel: Channel,
    public toId: number | null = null,
  ) {
    super();
  }

  public nodeStdIO(): string {
    return 'pipe';
  }
}

export class Redirect extends IOSpec {
  constructor(public channel: Channel) {
    super();
  }

  public nodeStdIO(): string {
    throw new NotImplementedError('Stream redirection');
  }
}

export interface ProcessSpec {
  command: Value;
  args: Value[];
  env: Env;
  io: [IOSpec, IOSpec, IOSpec];
}

export function toStdValue(value: Value): string {
  if (nullish(value)) {
    return 'nil';
  }
  return formatter.format(value);
}

export function createEnv(env: Env): Record<string, string | undefined> {
  const e: Record<string, string | undefined> = { ...nodeProcess.env };

  for (const [name, value] of Object.entries(env)) {
    if (nullish(value)) {
      e[name] = undefined;
    } else {
      e[name] = toStdValue(value);
    }
  }

  return e;
}

export function nodeSpawnArguments(
  spec: ProcessSpec,
  background: boolean,
): any[] {
  const stdio: any = [
    spec.io[0].nodeStdIO(),
    spec.io[1].nodeStdIO(),
    spec.io[2].nodeStdIO(),
  ];

  return [
    toStdValue(spec.command),
    spec.args.map((arg) => toStdValue(arg)),
    {
      cwd: this.host.cwd,
      env: createEnv(spec.env),
      stdio,
      detached: background,
    },
  ];
}
