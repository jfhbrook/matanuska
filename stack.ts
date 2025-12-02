import { AssertionError } from './exceptions';
import { Formattable, Formatter } from './format';

export class Stack<V> implements Formattable {
  public stack: V[] = [];

  /**
   * Push a value onto the stack.
   *
   * @param value - The value to push onto the stack
   */
  push(value: V): void {
    this.stack.push(value);
  }

  /**
   * Pop the top element of the stack.
   */
  pop(): V {
    const val = this.stack.pop();
    if (typeof val === 'undefined') {
      throw new AssertionError('Popped empty stack');
    }
    return val as V;
  }

  /**
   * Peek at the value n down from the top of the stack.
   *
   * @param n - The distance from the top of the stack to peek at.
   */
  peek(n: number = 0): V | null {
    if (this.empty) {
      return null;
    }
    return this.stack[this.stack.length - n - 1];
  }

  /**
   * Get the nth element of the stack.
   *
   * @param n - The index of the element to get
   */
  get(n: number = 0): V | null {
    if (this.empty) {
      return null;
    }
    return this.stack[n];
  }

  /**
   * Set the nth element of the stack.
   *
   * @param n - The index of the element to set
   * @param V - The value of the element to set
   */
  set(n: number, value: V): void {
    this.stack[n] = value;
  }

  /**
   * Remove the last n elements of the stack, and return them.
   *
   * @param n - The number of elements to take from the stack
   */
  take(n: number): V[] {
    const values = this.stack.slice(this.stack.length - n);
    this.stack = this.stack.slice(0, this.stack.length - n);
    return values;
  }

  /**
   * Whether or not the stack is empty.
   */
  get empty(): boolean {
    return this.stack.length === 0;
  }

  /**
   * The size (length) of the stack.
   */
  get size(): number {
    return this.stack.length;
  }

  /**
   * Drop all values from the stack.
   */
  reset(): void {
    this.stack = [];
  }

  format(formatter: Formatter): string {
    return formatter.formatStack(this);
  }
}
