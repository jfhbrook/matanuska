import { describe, expect, test } from 'vitest';

import {
  Color,
  Format,
  Shell,
  Severity,
  shellcheckArgv,
  shellcheckRcContents,
} from '../shellcheck.mjs';

describe('shellcheck', () => {
  test('shellcheckArgv', () => {
    expect(
      shellcheckArgv({
        checkSourced: true,
        color: Color.Always,
        files: ['test/fixtures/*'],
        include: ['SC1000', 'SC1001'],
        exclude: ['SC1002', 'SC1003'],
        format: Format.CheckStyle,
        listOptional: true,
        noRc: true,
        rcFile: '.shellcheckrc.1',
        enable: ['quote-safe-variables', 'check-unassigned-uppercase'],
        sourcePath: ['bash_modules', 'sources'],
        shell: Shell.Bash,
        severity: Severity.Warning,
        wikiLinkCount: 6,
        externalSources: true,
      }),
    ).toEqual([
      '--check-sourced',
      '--color=always',
      '--include=SC1000,SC1001',
      '--exclude=SC1002,SC1003',
      '--format=checkstyle',
      '--list-optional',
      '--norc',
      '--rcfile=.shellcheckrc.1',
      '--enable=quote-safe-variables,check-unassigned-uppercase',
      '--source-path=bash_modules:sources',
      '--shell=bash',
      '--severity=warning',
      '--wiki-link-count=6',
      '--external-sources',
      'test/fixtures/hello-world.sh',
    ]);
  });

  test('shellcheckRcContents', () => {
    expect(
      shellcheckRcContents({
        sourcePath: ['bash_modules', 'sources'],
        externalSources: true,
        enable: ['quote-safe-variables', 'check-unassigned-uppercase'],
        disable: ['SC2236'],
      }),
    ).toEqual(`source-path=bash_modules
source-path=sources

external-sources=true

enable=quote-safe-variables
enable=check-unassigned-uppercase
disable=SC2236
`);
  });
});
