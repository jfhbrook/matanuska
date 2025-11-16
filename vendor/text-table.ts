/*
 * This module is based on https://npm.im/text-table by @substack.
 *
 * This software is released under the MIT license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function table(rows: any, opts?: any): string {
  const rows_ = rows;
  if (!opts) opts = {};
  const hsep = opts.hsep === undefined ? '  ' : opts.hsep;
  const align = opts.align || [];
  const stringLength =
    opts.stringLength ||
    function (s) {
      return String(s).length;
    };
  const dotsizes = reduce(
    rows_,
    function (acc, row) {
      forEach(row, function (c, ix) {
        const n = dotindex(c);
        if (!acc[ix] || n > acc[ix]) acc[ix] = n;
      });
      return acc;
    },
    [],
  );

  rows = map(rows_, function (row) {
    return map(row, function (c_, ix) {
      const c = String(c_);
      if (align[ix] === '.') {
        const index = dotindex(c);
        const size =
          dotsizes[ix] + (/\./.test(c) ? 1 : 2) - (stringLength(c) - index);
        return c + Array(size).join(' ');
      } else return c;
    });
  });

  const sizes = reduce(
    rows,
    function (acc, row) {
      forEach(row, function (c, ix) {
        const n = stringLength(c);
        if (!acc[ix] || n > acc[ix]) acc[ix] = n;
      });
      return acc;
    },
    [],
  );

  return map(rows, function (row) {
    return map(row, function (c, ix) {
      const n = sizes[ix] - stringLength(c) || 0;
      const s = Array(Math.max(n + 1, 1)).join(' ');
      if (align[ix] === 'r' || align[ix] === '.') {
        return s + c;
      }
      if (align[ix] === 'c') {
        return (
          Array(Math.ceil(n / 2 + 1)).join(' ') +
          c +
          Array(Math.floor(n / 2 + 1)).join(' ')
        );
      }

      return c + s;
    })
      .join(hsep)
      .replace(/\s+$/, '');
  }).join('\n');
}

function dotindex(c: any): any {
  const m = /\.[^.]*$/.exec(c);
  return m ? m.index + 1 : c.length;
}

function reduce(xs: any, f: any, init: any): any {
  if (xs.reduce) return xs.reduce(f, init);
  let i = 0;
  const acc = arguments.length >= 3 ? init : xs[i++];
  for (; i < xs.length; i++) {
    f(acc, xs[i], i);
  }
  return acc;
}

function forEach(xs: any, f: any): any {
  if (xs.forEach) return xs.forEach(f);
  for (let i = 0; i < xs.length; i++) {
    f.call(xs, xs[i], i);
  }
}

function map(xs: any, f: any): any {
  if (xs.map) return xs.map(f);
  const res: any[] = [];
  for (let i = 0; i < xs.length; i++) {
    res.push(f.call(xs, xs[i], i));
  }
  return res;
}

export default table;
