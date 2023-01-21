import path from 'path';
import dotenv from 'dotenv';

import initDB, { DBOptions } from './database';
import {
  Model,
  ModelAttributes,
  ModelOptions,
  Sequelize
} from 'sequelize/types';
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

export default class Config {
  private static db: Sequelize;

  public static getEnv = (key: string) => {
    return process.env[key];
  };

  constructor(options: DBOptions | string) {
    Config.db = initDB(options);
  }

  static get isLive() {
    return process.env.NODE_ENV === 'production';
  }

  public static defineModel(
    modelName: string,
    attributes: ModelAttributes<Model<any, any>, any>,
    options?: ModelOptions<Model<any, any>> | undefined
  ) {
    return this.db.define(modelName, attributes, options);
  }
}
