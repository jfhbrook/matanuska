import { ChildProcess, spawn } from 'node:child_process';
import * as nodeProcess from 'node:process';

import { Channel } from './channel';
import { Host } from './host';
import { RuntimeError, NotImplementedError } from './exceptions';
import { formatter } from './format';
import { Value } from './value';
import { nullish } from './value/nullness';

export type Pid = number;
export type JobId = number;
export type Group = string;

export const FOREGROUND: Group = 'foreground';
export const BACKGROUND: Group = 'background';

function isBackgroundGroup(group: Group): boolean {
  return group === BACKGROUND;
}

export type Env = Record<string, Value>;

export type ProcessCollection = Map<Pid, ChildProcess>;

export interface Job {
  group: Group;
  processes: ProcessCollection;
}

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
    public toId: JobId | null = null,
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

interface ProcessSpec {
  command: Value;
  args: Value[];
  env: Env;
  io: [IOSpec, IOSpec, IOSpec];
}

function stringify(value: Value): string {
  if (nullish(value)) {
    return 'nil';
  }
  return formatter.format(value);
}

function environment(env: Env): Record<string, string | undefined> {
  const e: Record<string, string | undefined> = { ...nodeProcess.env };

  for (const [name, value] of Object.entries(env)) {
    if (nullish(value)) {
      e[name] = undefined;
    } else {
      e[name] = stringify(value);
    }
  }

  return e;
}

export class JobSpec {
  public processes: ProcessSpec[];

  // TODO: How would you specify env vars for a process in the language?
  constructor(public group: Group = FOREGROUND) {
    this.processes = [];
  }

  public process(command: Value, args: Value[], env: Env): this {
    this.processes.push({
      command,
      args,
      env,
      // TODO: Allow for piping and redirection
      io: [INHERIT, INHERIT, INHERIT],
    });

    return this;
  }
}

export class JobManager {
  public jobs: Job[];

  constructor(private host: Host) {
    this.jobs = [];
  }

  public getGroup(group: Group): Job[] {
    return this.jobs.filter((job) => job.group == group);
  }

  public getJob(id: JobId): Job {
    return this.jobs[id];
  }

  public startJob(spec: JobSpec): [JobId, Job] {
    const id = this.jobs.length;
    const job = this.spawn(spec);

    this.jobs.push(job);

    return [id, job];
  }

  public spawn(spec: JobSpec): Job {
    const processes: Map<JobId, ChildProcess> = new Map();

    for (const sp of spec.processes) {
      const proc = this._spawn(sp, isBackgroundGroup(spec.group));
      if (typeof proc.pid === 'undefined') {
        // TODO: Better error
        throw new RuntimeError('Process failed to spawn');
      }
      processes.set(proc.pid, proc);
    }

    return {
      group: spec.group,
      processes,
    };
  }

  private _spawn(spec: ProcessSpec, background: boolean): ChildProcess {
    const stdio: any = [
      spec.io[0].nodeStdIO(),
      spec.io[1].nodeStdIO(),
      spec.io[2].nodeStdIO(),
    ];

    // TODO: Shouldn't this be in Host?
    return spawn(
      stringify(spec.command),
      spec.args.map((arg) => stringify(arg)),
      {
        cwd: this.host.cwd,
        env: environment(spec.env),
        stdio,
        detached: background,
      },
    );
  }
}
