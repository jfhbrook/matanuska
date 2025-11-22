import { discuss } from '@jfhbrook/swears';

import { Container } from '../../index';
import { Config } from '../../config';
import { Executor } from '../../executor';
import { Host } from '../../host';
import { CONFIG } from './config';
import { mockConsoleHost } from './host';

class MockExecutor extends Executor {}

const exitFn = async (_code: number): Promise<any> => {
  process.exit(0);
};

class MockContainer extends Container {
  constructor(host: Host) {
    super(process.argv.slice(2), process.env, exitFn, host);
  }

  public config(): Config {
    return CONFIG;
  }

  public executor(): Executor {
    return new MockExecutor(this.editor(), this.host);
  }
}

export const executorTopic = discuss(async () => {
  const host = mockConsoleHost();
  const container = new MockContainer(host);
  const editor = container.editor();
  const executor = container.executor();

  return {
    host,
    editor,
    executor,
  };
});
