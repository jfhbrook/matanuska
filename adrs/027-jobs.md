# ADR 027 - Jobs Design

### Status: Draft

### Josh Holbrook

# Context

Most shells have the concept of a background job. In Bash specifically, all spawned pipelines are treated as jobs. This implies that Matanuska will need the concept of jobs as well.

## Prior Art: Bash

Bash treats all running pipelines as jobs. This includes foreground jobs as well as background jobs.

Each job gets a numerical index. You can see this when you background a job with `&`:

```
[1] 25647
```

This job has an index of `1`, and the PID of the final process in the pipeline is `25647`.

Bash leverages OS-native job control facilities. It does this by assigning foreground jobs the same process group ID as the controlling terminal, and background jobs a separate group ID with no controlling terminal. This allows it to use POSIX signals to control process behavior.

Job control uses the following control codes and commands:

* The `&` token will asynchronously run a specified job in the background.
* **^Z** (the _suspend_ character) will stop the current foreground process (using the `SIGSTP` signal), and return control to Bash
* **^Y** (the _delayed suspend_ character) behaves similarly to **^Z**, but allows the process to run (potentially pausing when it receives a `SIGTTIN` or `SIGTTOU` signal)
* The `bg` builtin will continue running the job in the background, without suspending it
* The `fg` builtin will bring a specified job to the foreground, resuming it if suspended (using the `SIGCONT` signal)

Implementation details may be seen in Bash's [jobs.c](https://github.com/bminor/bash/blob/master/jobs.c) and [jobs.h](https://github.com/bminor/bash/blob/master/jobs.h).

## Prior Art: PowerShell

[PowerShell also has the concept of jobs](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_jobs?view=powershell-7.5), though only for background operations. PowerShell has three kinds of jobs:

* `BackgroundJob` - commands or scripts running as separate processes in the background
* `RemoteJob` - commands or scripts being run on remote computers
* `ThreadJob` - commands or scripts running in the background, but in a thread (ie. in the same process)

These jobs may only run PowerShell commands. For processes, PowerShell uses [the separate Process abstraction](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/start-process?view=powershell-7.5). These processes use classes to wrap their execution, similar to Node.js's `process.spawn` or Python's `subprocess.run`.

The fact that PowerShell doesn't appear to leverage OS level job control is likely because Windows does not support job control in a way analogous to POSIX. It does seem technically possible to suspend a process or thread, but it's poorly supported and somewhat fraught.

## POSIX Job Control

[According to Wikipedia](https://en.wikipedia.org/wiki/Job_control_(Unix)), job control is supported through signals. The core signals relevant to job control are:

* `SIGSTP` - Suspend the process
* `SIGCONT` - Continue the process
* `SIGTTIN` - Sent when attempting to read from the controlling terminal (typically suspends the process)
* `SIGTTOU` - Send when attempting to write to the controlling terminal (typically suspends the process)

The concept of a [controlling terminal](https://en.wikipedia.org/wiki/POSIX_terminal_interface#Controlling_terminals_and_process_groups) is central. Typically a process is part of a [progress group](https://en.wikipedia.org/wiki/Process_group) which typically has a controlling terminal. This controlling terminal would not be Bash (or Node.js) necessarily, but the terminal program itself (Konsole, Kitty, SSH).

The upshot of this is that:

1. `SIGTTIN` and `SIGTTOU` behavior should be controlled by the terminal, not Matanuska, and may be safely ignored
2. Matanuska may use the `SIGSTP` and `SIGCONT` signals to control process behavior.

## Node.js Capabilities

Node.js's [spawn facility](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) allows for assigning a group ID (`gid`) to a process, if need be.

Node.js also supports sending signals to processes, through the `process.kill` method:

```typescript
const pid = 25647;

process.kill(pid, 'SIGSTP');
```

It seems to also support sending signals to groups, by using a negative number:

```typescript
const gid = 25647;

process.kill(-gid, 'SIGSTP');
```

If a child process is spawned with the `detached: true` option, it will be given a process group, without a controlling terminal. The particular group in use seems to be treated as an implementation detail, but it is likely unique to the process.

A process may be attached to an existing group by passing the `gid` argument to the spawn call. However, Node.js does not seem to allow for setting the process group for a process *after* it's spawned.

Node.js also does not seem to expose the capability of looking up the process group for a running process. Instead, you would need to get the process ID from the `ChildProcess` object, and use a process external to Node.js.

Finally, Node.js should be able to detect `^Z` by capturing the `SIGSTP` signal. This is necessary, as `^Z` is handled by the controlling terminal, not the shell. `^Y` does not seem to be associated with a particular signal, and can be detected through standard keypress capabilities.

The upshot of all of this is that, while Node.js can easily use signals to manage process behavior, it can **not** easily use process groups.

## Rust Capabilities

Rust can, of course, call C based OS libraries directly. But Rust also has a crate which wraps a number of these libraries:

<https://crates.io/crates/nix>

This crate can likely be used alongside Rust's `std::process` library and [neon based bindings](https://neon-rs.dev) to accomplish these behaviors. 

# Decision

Matanuska will include a jobs table, similar to Bash. These jobs will contain collections of processes which are piped together as appropriate during job creation:

```typescript
type Pid = number;
type JobId = number;
type Group = string;

interface Job {
  background: boolean,
  processes: Map<Pid, ChildProcess>
}

type JobsTable = Record<JobId, Job>;
```

Development will happen in a few phases.

In the first phase, we will implement jobs management in pure TypeScript, without background jobs, and without using process groups. In this phase, we will track the processes purely through the jobs table and iterate over them to send `SIGSTP`/`SIGCONT` to the processes individually. However, in this phase, we will _not_ implement stdio stream control - meaning all jobs will be single-process.

In the second phase, we will implement stdio stream control and `&` based background jobs. This will be implemented by a method contained within the jobs abstraction, which accepts a declarative DSL for building these jobs. This design is to allow us to reimplement the internals of job creation and management later.

In the third phase, we will spike on implementing `^Z`, `^Y` and `fg`. This is expected to raise some interesting challenges, since `^Z` triggers a `SIGSTP` signal from the controlling terminal. Based on the outcome of this spike, we will decide how to proceed accordingly.

In the fourth phase, we will spike on implementing job creation and control with Rust. Rust will theoretically allow us to implement full process group based control, unlike Node.js. However, it is expected to present a number of challenges. Based on the outcome of this exploration, we will pivot accordingly.
