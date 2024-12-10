import * as dotenv from 'dotenv';

import MATBAS from 'consts:matbas';

if (MATBAS.build === 'debug') {
  dotenv.config();
}

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { NestLogger } from './debug';

import { Translator } from './translator';
import { Config, Argv, Env } from './config';
import { ConsoleHost } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

async function exit(code: number) {
  process.exit(code);
}

@Module({
  providers: [
    { provide: 'argv', useValue: process.argv.slice(2) },
    { provide: 'env', useValue: process.env },
    { provide: 'exitFn', useValue: exit },
    {
      provide: Config,
      useFactory: (argv: Argv, env: Env) => {
        return Config.load(argv, env);
      },
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
    logger: new NestLogger(),
  });
  const translator = deps.get(Translator);
  await translator.start();
}
