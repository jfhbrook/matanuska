import { Container } from '../../index';
import { Config } from '../../config';
import { Editor } from '../../editor';
import { Executor } from '../../executor';
import { Host } from '../../host';
import { CONFIG } from './config';
import { mockConsoleHost, MockConsoleHost } from './host';

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
    return new MockExecutor(this.config(), this.editor(), this.host);
  }
}

export async function mockExecutor<T>(
  fn: (executor: Executor, host: MockConsoleHost, editor: Editor) => Promise<T>,
): Promise<T> {
  return await mockConsoleHost(undefined, async (host): Promise<T> => {
    const container = new MockContainer(host);
    const editor = container.editor();
    const executor = container.executor();

    await executor.init();

    return await fn(executor, host, editor);
  });
}
