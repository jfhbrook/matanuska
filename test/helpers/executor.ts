import { discuss } from '@jfhbrook/swears';

import { Config } from '../../config';
import { Editor } from '../../editor';
import { Executor } from '../../executor';
import { Host } from '../../host';
import { Translator } from '../../translator';
import { CONFIG } from './config';
import { MockConsoleHost } from './host';

class MockExecutor extends Executor {}

class Container {
  public argv: string[];
  public env: Record<string, string | undefined>;
  public exitFn: (code: number) => Promise<any>;
  public config: Config;
  public host: Host;
  public editor: Editor;
  public executor: Executor;
  public translator: Translator;

  constructor(host: Host) {
    this.argv = process.argv.slice(2);
    this.env = process.env;
    this.exitFn = async (_code: number): Promise<any> => {
      process.exit(0);
    };
    this.config = CONFIG;
    this.host = host;
    this.editor = new Editor(this.host);
    this.executor = new MockExecutor(this.config, this.editor, this.host);
    this.translator = new Translator(
      this.host,
      this.exitFn,
      this.config,
      this.executor,
    );
  }
}

export const executorTopic = discuss(
  async () => {
    const host = new MockConsoleHost();
    const container = new Container(host);
    const editor = container.editor;
    const executor = container.executor;

    await executor.init();

    return {
      host,
      editor,
      executor,
    };
  },
  async ({ executor }) => {
    await executor.close();
  },
);
