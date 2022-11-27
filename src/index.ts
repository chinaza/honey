#!/usr/bin/env node
import moduleAlias from 'module-alias';

moduleAlias.addAlias('@src', __dirname);

import config from './config';
import { DBOptions } from './config/database';
import ExpressApp from './services/express';
import Honey from './services/honey';
import Postgres from './services/postgres';
import { normalizePort } from './utils/port';

import { QueryTypes as QTypes } from 'sequelize';
import { Metadata } from './interfaces/express';

process.on('SIGINT', () => {
  // process reload ongoing
  // close connections, clear cache, etc
  // by default, you have 1600ms
  process.exit(0);
});

export function isDbReady() {
  return !!config.db;
}

export function createHoney(
  port: string,
  dbOptions: string | DBOptions,
  metadata?: Metadata
) {
  config.setupDB(dbOptions);

  const portVal = normalizePort(port || process.env.PORT || '3000');
  const express = new ExpressApp(portVal, metadata);
  const postgres = new Postgres();
  const honey = new Honey(express, postgres);

  return honey;
}

function getQueryTypes() {
  const { SELECT, INSERT, UPDATE, DELETE, RAW, UPSERT } = QTypes;

  const exposedTypes = { SELECT, INSERT, UPDATE, DELETE, RAW, UPSERT };
  return exposedTypes;
}

const QueryTypes = getQueryTypes();

export { QueryTypes };
export { default as runDbQuery } from './utils/db';
