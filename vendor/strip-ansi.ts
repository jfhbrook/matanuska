/**
 * Vendored from strip-ansi and ansi-regex by Sindre Sorhus. Modified by
 * Josh Holbrook to be bundled and in TypeScript.
 *
 * Both are licensed under an MIT license, which may be viewed here:
 *
 *     https://github.com/chalk/strip-ansi/blob/c51e2883f3579628f7bffd40a13070e563bcc2c6/license
 *     https://github.com/chalk/ansi-regex/blob/94983fc6ba00e1e9657f72c07eb7b9c75e4011a2/license
 *
 */

type RegexOptions = {
  readonly onlyFirst: boolean;
};

function ansiRegex({ onlyFirst }: RegexOptions = { onlyFirst: false }) {
  // Valid string terminator sequences are BEL, ESC\, and 0x9c
  const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)';

  // OSC sequences only: ESC ] ... ST (non-greedy until the first ST)
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;

  // CSI and related: ESC/C1, optional intermediates, optional params (supports ; and :) then final byte
  const csi =
    '[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]';

  const pattern = `${osc}|${csi}`;

  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

const regex = ansiRegex();

export default function stripAnsi(string: string): string {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }

  // Even though the regex is global, we don't need to reset the `.lastIndex`
  // because unlike `.exec()` and `.test()`, `.replace()` does it automatically
  // and doing it manually has a performance penalty.
  return string.replace(regex, '');
}
