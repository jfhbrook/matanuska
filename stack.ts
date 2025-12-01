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

  // TODO: I added this to fix an immediate bug. Does this mean peek is no
  // longer needed? Is this entirely correct, even?
  get(n: number = 0): V | null {
    if (this.empty) {
      return null;
    }
    return this.stack[n];
  }

  set(n: number, value: V): void {
    this.stack[n] = value;
  }

  slice(start: number, end?: number): V[] {
    return this.stack.slice(start, end);
  }

  drop(n: number): void {
    this.stack = this.stack.slice(0, this.stack.length - n);
  }

  take(n: number): V[] {
    const values = this.slice(this.stack.length - n);
    this.drop(n);
    return values;
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
