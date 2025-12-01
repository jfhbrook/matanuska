import { NativeRoutine } from '../value';

class Now extends NativeRoutine {
  name: string = 'now%';
  arity: number = 0;

  public async call(): Promise<number> {
    return Date.now();
  }
}

export const now = new Now();
