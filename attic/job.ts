import { ChildProcess } from 'node:child_process';

import { Host } from '../host';
import { RuntimeError } from '../exceptions';
import type { Pid, Env } from './process';
import { ProcessSpec, INHERIT } from './process';
import { Value } from '../value';

export type JobId = number;
export type Group = string;

export const FOREGROUND: Group = 'foreground';
export const BACKGROUND: Group = 'background';

/*
function isBackgroundGroup(group: Group): boolean {
  return group === BACKGROUND;
}
*/

export interface Job {
  group: Group;
  processes: Map<Pid, ChildProcess>;
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

    for (const _sp of spec.processes) {
      const proc = { pid: undefined }; // this.host.spawn(sp, isBackgroundGroup(spec.group));
      if (typeof proc.pid === 'undefined') {
        // TODO: Better error
        throw new RuntimeError('Process failed to spawn');
      }
      processes.set(proc.pid, proc as any);
    }

    return {
      group: spec.group,
      processes,
    };
  }
}
