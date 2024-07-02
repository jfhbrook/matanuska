import * as dotenv from 'dotenv';

import { MATBAS_BUILD } from './constants';

if (MATBAS_BUILD === 'debug') {
  dotenv.config();
}

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { NestLogger } from './debug';

import { App } from './app';
import { Config } from './config';
import { ConsoleHost } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

@Module({
  providers: [
    { provide: 'argv', useValue: process.argv.slice(2) },
    { provide: 'env', useValue: process.env },
    { provide: 'exitFn', useValue: process.exit },
    {
      provide: 'Host',
      useClass: ConsoleHost,
    },
    Config,
    Editor,
    Executor,
    App,
  ],
})
export class Container {}

export async function main(): Promise<void> {
  const deps = await NestFactory.createApplicationContext(Container, {
    logger: new NestLogger(),
  });
  const app = deps.get(App);
  await app.start();
}
