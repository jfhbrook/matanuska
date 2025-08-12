import { Token } from '../tokens';

export interface Local {
  name: Token;
  depth: number;
}

export class LocalsManager {
  public locals: Local[];
  public count: number;
  public depth: number;

  constructor() {
    this.locals = [];
    this.count = 0;
    this.depth = 0;
  }

  public begin() {
    this.depth++;
  }

  public end() {
    this.depth--;
  }

  public declare() {}
}
