import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { Exit } from './exit';
import { Translator } from './translator';
import { Config, Argv, Env } from './config';
import { ConsoleHost } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

async function exit(code: number) {
  process.exit(code);
}

function configFactory(argv: Argv, env: Env) {
  try {
    return Config.load(argv, env);
  } catch (err) {
    // Normally we would count on the Translator to handle these sorts of
    // errors. In this case, the error is thrown before the Translator is
    // stood up, so we have to special case it here.
    if (err instanceof Exit) {
      if (err.message.length) {
        console.log(err.message);
      }
      process.exit(err.exitCode);
    }
    throw err;
  }
}

@Module({
  providers: [
    { provide: 'argv', useValue: process.argv.slice(2) },
    { provide: 'env', useValue: process.env },
    { provide: 'exitFn', useValue: exit },
    {
      provide: Config,
      useFactory: configFactory,
      inject: ['argv', 'env'],
    },
    {
      provide: 'Host',
      useClass: ConsoleHost,
    },
    Editor,
    Executor,
    Translator,
  ],
})
export class Container {}

export async function main(): Promise<void> {
  const deps = await NestFactory.createApplicationContext(Container, {
    //#if _MATBAS_BUILD != 'debug'
    logger: false,
    //#endif
  });
  const translator = deps.get(Translator);
  await translator.start();
}
