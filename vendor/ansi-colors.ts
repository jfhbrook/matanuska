/**
 * Vendored from:
 *
 *     https://github.com/doowb/ansi-colors/tree/5d3bc7330142e914fddc0ca6a5ea7a0da38a6224
 *
 * Licensed under an MIT license, which may be viewed here:
 *
 *     https://github.com/doowb/ansi-colors/blob/5d3bc7330142e914fddc0ca6a5ea7a0da38a6224/LICENSE
 */

'use strict';

export interface SymbolsType {
  /**
   * `undefined` on windows, `✘` on other platforms.
   */
  ballotCross?: '✘';
  ballotDisabled: '☒';
  ballotOff: '☐';
  ballotOn: '☑';
  bullet: '•';
  bulletWhite: '◦';
  /**
   * `√` on windows, `✔` on other platforms.
   */
  check: '√' | '✔';
  /**
   * `×` on windows, `✖` on other platforms.
   */
  cross: '×' | '✖';
  /**
   * `...` on windows, `⋯` on other platforms.
   */
  ellipsisLarge: '...' | '⋯';
  /**
   * `...` on windows, `…` on other platforms.
   */
  ellipsis: '...' | '…';
  fullBlock: '█';
  heart: '❤';
  identicalTo: '≡';
  info: 'i' | 'ℹ';
  line: '─';
  mark: '※';
  middot: '·';
  minus: '－';
  multiplication: '×';
  obelus: '÷';
  pencilDownRight: '✎';
  pencilRight: '✏';
  pencilUpRight: '✐';
  percent: '%';
  pilcrow2: '❡';
  pilcrow: '¶';
  plusMinus: '±';
  /**
   * `>` on windows, `▸` on linux, and `❯` on other platforms.
   */
  pointer: '>' | '▸' | '❯';
  /**
   * `»` on windows, `‣` on linux, and `›` on other platforms.
   */
  pointerSmall: '»' | '‣' | '›';
  question: '?';
  /**
   * `undefined` on windows, `？` on other platforms.
   */
  questionFull?: '？';
  /**
   * `?` on windows, `﹖` on other platforms.
   */
  questionSmall: '?' | '﹖';
  /**
   * `( )` on windows, `◯` on other platforms.
   */
  radioOff: '( )' | '◯';
  /**
   * `(*)` on windows, `◉` on other platforms.
   */
  radioOn: '(*)' | '◉';
  section: '§';
  starsOff: '☆';
  starsOn: '★';
  upDownArrow: '↕';
  /**
   * `‼` on windows, `⚠` on other platforms.
   */
  warning: '‼' | '⚠';
}

export type StyleArrayStructure = [number, number];
export interface StyleArrayProperties {
  open: string;
  close: string;
  closeRe: string;
}

export type StyleType = StyleArrayStructure & StyleArrayProperties;

export interface StylesType<T> {
  // modifiers
  reset: T;
  bold: T;
  dim: T;
  italic: T;
  underline: T;
  inverse: T;
  hidden: T;
  strikethrough: T;

  // colors
  black: T;
  red: T;
  green: T;
  yellow: T;
  blue: T;
  magenta: T;
  cyan: T;
  white: T;
  gray: T;
  grey: T;

  // bright colors
  blackBright: T;
  redBright: T;
  greenBright: T;
  yellowBright: T;
  blueBright: T;
  magentaBright: T;
  cyanBright: T;
  whiteBright: T;

  // background colors
  bgBlack: T;
  bgRed: T;
  bgGreen: T;
  bgYellow: T;
  bgBlue: T;
  bgMagenta: T;
  bgCyan: T;
  bgWhite: T;

  // bright background colors
  bgBlackBright: T;
  bgRedBright: T;
  bgGreenBright: T;
  bgYellowBright: T;
  bgBlueBright: T;
  bgMagentaBright: T;
  bgCyanBright: T;
  bgWhiteBright: T;
}

const common = {
  ballotDisabled: '☒',
  ballotOff: '☐',
  ballotOn: '☑',
  bullet: '•',
  bulletWhite: '◦',
  fullBlock: '█',
  heart: '❤',
  identicalTo: '≡',
  line: '─',
  mark: '※',
  middot: '·',
  minus: '－',
  multiplication: '×',
  obelus: '÷',
  pencilDownRight: '✎',
  pencilRight: '✏',
  pencilUpRight: '✐',
  percent: '%',
  pilcrow2: '❡',
  pilcrow: '¶',
  plusMinus: '±',
  question: '?',
  section: '§',
  starsOff: '☆',
  starsOn: '★',
  upDownArrow: '↕',
};

const windows = Object.assign({}, common, {
  check: '√',
  cross: '×',
  ellipsisLarge: '...',
  ellipsis: '...',
  info: 'i',
  questionSmall: '?',
  pointer: '>',
  pointerSmall: '»',
  radioOff: '( )',
  radioOn: '(*)',
  warning: '‼',
});

interface Host {
  platform: string;
  env: Record<string, string | undefined>;
}

export function symbols(host?: Host): SymbolsType {
  const isHyper =
    typeof host !== 'undefined' && host.env.TERM_PROGRAM === 'Hyper';
  const isWindows = typeof host !== 'undefined' && host.platform === 'win32';
  const isLinux = typeof host !== 'undefined' && host.platform === 'linux';

  const other = Object.assign({}, common, {
    ballotCross: '✘',
    check: '✔',
    cross: '✖',
    ellipsisLarge: '⋯',
    ellipsis: '…',
    info: 'ℹ',
    questionFull: '？',
    questionSmall: '﹖',
    pointer: isLinux ? '▸' : '❯',
    pointerSmall: isLinux ? '‣' : '›',
    radioOff: '◯',
    radioOn: '◉',
    warning: '⚠',
  });

  const symbols = isWindows && !isHyper ? windows : other;
  Reflect.defineProperty(symbols, 'common', {
    enumerable: false,
    value: common,
  });
  Reflect.defineProperty(symbols, 'windows', {
    enumerable: false,
    value: windows,
  });
  Reflect.defineProperty(symbols, 'other', { enumerable: false, value: other });

  return symbols as SymbolsType;
}

const isObject = (val: any) =>
  val !== null && typeof val === 'object' && !Array.isArray(val);

/* eslint-disable no-control-regex */
// this is a modified version of https://github.com/chalk/ansi-regex (MIT License)
const ANSI_REGEX =
  /[\u001b\u009b][[\]#;?()]*(?:(?:(?:[^\W_]*;?[^\W_]*)\u0007)|(?:(?:[0-9]{1,4}(;[0-9]{0,4})*)?[~0-9=<>cf-nqrtyA-PRZ]))/g;

const hasColor = () => {
  if (typeof process !== 'undefined') {
    return process.env.FORCE_COLOR !== '0';
  }
  return false;
};

export interface StyleFunction extends StylesType<StyleFunction> {
  (s: string): string;
}

export interface Colors {
  // modifiers
  reset: StyleFunction;
  bold: StyleFunction;
  dim: StyleFunction;
  italic: StyleFunction;
  underline: StyleFunction;
  inverse: StyleFunction;
  hidden: StyleFunction;
  strikethrough: StyleFunction;

  // colors
  black: StyleFunction;
  red: StyleFunction;
  green: StyleFunction;
  yellow: StyleFunction;
  blue: StyleFunction;
  magenta: StyleFunction;
  cyan: StyleFunction;
  white: StyleFunction;
  gray: StyleFunction;
  grey: StyleFunction;

  // bright colors
  blackBright: StyleFunction;
  redBright: StyleFunction;
  greenBright: StyleFunction;
  yellowBright: StyleFunction;
  blueBright: StyleFunction;
  magentaBright: StyleFunction;
  cyanBright: StyleFunction;
  whiteBright: StyleFunction;

  // background colors
  bgBlack: StyleFunction;
  bgRed: StyleFunction;
  bgGreen: StyleFunction;
  bgYellow: StyleFunction;
  bgBlue: StyleFunction;
  bgMagenta: StyleFunction;
  bgCyan: StyleFunction;
  bgWhite: StyleFunction;

  // bright background colors
  bgBlackBright: StyleFunction;
  bgRedBright: StyleFunction;
  bgGreenBright: StyleFunction;
  bgYellowBright: StyleFunction;
  bgBlueBright: StyleFunction;
  bgMagentaBright: StyleFunction;
  bgCyanBright: StyleFunction;
  bgWhiteBright: StyleFunction;

  enabled: boolean;
  visible: boolean;
  ansiRegex: RegExp;

  stripColor(s: string): string;
  strip(s: string): string;
  unstyle(s: string): string;

  styles: StylesType<StyleType>;
  symbols: SymbolsType;

  ok(...args: string[]): string;
}

const create = (host?: Host): Colors => {
  const colors: any = {
    enabled: hasColor(),
    visible: true,
    styles: {},
    keys: {},
  };

  const ansi = (style: any) => {
    const open = (style.open = `\u001b[${style.codes[0]}m`);
    const close = (style.close = `\u001b[${style.codes[1]}m`);
    const regex = (style.regex = new RegExp(`\\u001b\\[${style.codes[1]}m`, 'g'));
    style.wrap = (input: string, newline: boolean) => {
      if (input.includes(close)) input = input.replace(regex, close + open);
      const output = open + input + close;
      // see https://github.com/chalk/chalk/pull/92, thanks to the
      // chalk contributors for this fix. However, we've confirmed that
      // this issue is also present in Windows terminals
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    return style;
  };

  const wrap = (style: any, input: string, newline: boolean) => {
    return typeof style === 'function'
      ? style(input)
      : style.wrap(input, newline);
  };

  const style = (input: string, stack: string[]) => {
    if (input === '' || input == null) return '';
    if (colors.enabled === false) return input;
    if (colors.visible === false) return '';
    let str = '' + input;
    const nl = str.includes('\n');
    let n = stack.length;
    if (n > 0 && stack.includes('unstyle')) {
      stack = [...new Set(['unstyle', ...stack])].reverse();
    }
    while (n-- > 0) str = wrap(colors.styles[stack[n]], str, nl);
    return str;
  };

  const define = (name: string, codes: StyleArrayStructure, type: string) => {
    colors.styles[name] = ansi({ name, codes });
    const keys = colors.keys[type] || (colors.keys[type] = []);
    keys.push(name);

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        const color: any = (input: string) => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color as StyleFunction;
      },
    });
  };

  define('reset', [0, 0], 'modifier');
  define('bold', [1, 22], 'modifier');
  define('dim', [2, 22], 'modifier');
  define('italic', [3, 23], 'modifier');
  define('underline', [4, 24], 'modifier');
  define('inverse', [7, 27], 'modifier');
  define('hidden', [8, 28], 'modifier');
  define('strikethrough', [9, 29], 'modifier');

  define('black', [30, 39], 'color');
  define('red', [31, 39], 'color');
  define('green', [32, 39], 'color');
  define('yellow', [33, 39], 'color');
  define('blue', [34, 39], 'color');
  define('magenta', [35, 39], 'color');
  define('cyan', [36, 39], 'color');
  define('white', [37, 39], 'color');
  define('gray', [90, 39], 'color');
  define('grey', [90, 39], 'color');

  define('bgBlack', [40, 49], 'bg');
  define('bgRed', [41, 49], 'bg');
  define('bgGreen', [42, 49], 'bg');
  define('bgYellow', [43, 49], 'bg');
  define('bgBlue', [44, 49], 'bg');
  define('bgMagenta', [45, 49], 'bg');
  define('bgCyan', [46, 49], 'bg');
  define('bgWhite', [47, 49], 'bg');

  define('blackBright', [90, 39], 'bright');
  define('redBright', [91, 39], 'bright');
  define('greenBright', [92, 39], 'bright');
  define('yellowBright', [93, 39], 'bright');
  define('blueBright', [94, 39], 'bright');
  define('magentaBright', [95, 39], 'bright');
  define('cyanBright', [96, 39], 'bright');
  define('whiteBright', [97, 39], 'bright');

  define('bgBlackBright', [100, 49], 'bgBright');
  define('bgRedBright', [101, 49], 'bgBright');
  define('bgGreenBright', [102, 49], 'bgBright');
  define('bgYellowBright', [103, 49], 'bgBright');
  define('bgBlueBright', [104, 49], 'bgBright');
  define('bgMagentaBright', [105, 49], 'bgBright');
  define('bgCyanBright', [106, 49], 'bgBright');
  define('bgWhiteBright', [107, 49], 'bgBright');

  colors.ansiRegex = ANSI_REGEX;
  colors.hasColor = colors.hasAnsi = (str: any) => {
    colors.ansiRegex.lastIndex = 0;
    return typeof str === 'string' && str !== '' && colors.ansiRegex.test(str);
  };

  colors.alias = (name: string, color: any) => {
    const fn = typeof color === 'string' ? colors[color] : color;

    if (typeof fn !== 'function') {
      throw new TypeError(
        'Expected alias to be the name of an existing color (string) or a function',
      );
    }

    if (!fn.stack) {
      Reflect.defineProperty(fn, 'name', { value: name });
      colors.styles[name] = fn;
      fn.stack = [name];
    }

    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias(name, value);
      },
      get() {
        const color: any = (input: string) => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return color;
      },
    });
  };

  colors.theme = (custom: any) => {
    if (!isObject(custom))
      throw new TypeError('Expected theme to be an object');
    for (const name of Object.keys(custom)) {
      colors.alias(name, custom[name]);
    }
    return colors;
  };

  colors.alias('unstyle', (str: string) => {
    if (typeof str === 'string' && str !== '') {
      colors.ansiRegex.lastIndex = 0;
      return str.replace(colors.ansiRegex, '');
    }
    return '';
  });

  colors.alias('noop', (str: string) => str);
  colors.none = colors.clear = colors.noop;

  colors.stripColor = colors.unstyle;
  colors.symbols = symbols(host);
  colors.define = define;
  return colors as Colors;
};

const colors = create();

export default colors;
export { create };
