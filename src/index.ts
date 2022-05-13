#!/usr/bin/env node
import moduleAlias from 'module-alias';

moduleAlias.addAlias('@src', __dirname);

import config from './config';
import { DBOptions } from './config/database';
import ExpressApp from './services/express';
import Honey from './services/honey';
import { normalizePort } from './utils/port';

interface Metadata {
  fallbackErrorMessage?: string;
}

process.on('SIGINT', () => {
  // process reload ongoing
  // close connections, clear cache, etc
  // by default, you have 1600ms
  process.exit(0);
});

export = function createHoney(
  port: string,
  dbOptions: string | DBOptions,
  metadata?: Metadata
) {
  config.setupDB(dbOptions);

  const portVal = normalizePort(port || process.env.PORT || '3000');
  const express = new ExpressApp(portVal, {
    fallbackErrorMessage: metadata?.fallbackErrorMessage
  });
  const honey = new Honey(express);

  return honey;
};
