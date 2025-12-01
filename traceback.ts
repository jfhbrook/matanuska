import { Formattable, Formatter } from './format';

/**
 * A traceback, as seen in errors. Lightly influenced by Python.
 *
 * See: https://docs.python.org/fr/3.11/reference/datamodel.html#traceback-objects
 */
export class Traceback implements Formattable {
  constructor(
    public readonly next: Traceback | null,
    public filename: string,
    public routine: string,
    public lineNo: number,
  ) {}

  format(formatter: Formatter): string {
    return formatter.formatTraceback(this);
  }
}

/**
 * Objects implementing this interface have a traceback.
 */
export interface Traceable {
  traceback: Traceback | null;
}
