import { AssertionError } from './exceptions';
import { Formattable, Formatter } from './format';

export class Stack<V> implements Formattable {
  public stack: V[] = [];

  push(value: V): void {
    this.stack.push(value);
  }

  pop(): V {
    const val = this.stack.pop();
    if (typeof val === 'undefined') {
      throw new AssertionError('Popped empty stack');
    }
    return val as V;
  }

  peek(n: number = 0): V | null {
    if (this.empty) {
      return null;
    }
    return this.stack[this.stack.length - n - 1];
  }

  set(n: number, value: V): void {
    this.stack[n] = value;
  }

  get empty(): boolean {
    return this.stack.length === 0;
  }

  get size(): number {
    return this.stack.length;
  }

  reset(): void {
    this.stack = [];
  }

  format(formatter: Formatter): string {
    return formatter.formatStack(this);
  }
}
