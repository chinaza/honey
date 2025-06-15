import {
  Model,
  ModelAttributes,
  ModelOptions,
  ModelStatic,
  QueryOptions
} from 'sequelize';
import Knex from 'knex';

import Config from '../config';
import createSingleton from './helpers';

export default function runDbQuery(query: string, params?: QueryOptions) {
  params = params || {};

  return Config.db.query(query, {
    ...params,
    raw: true
  });
}

class ModelCreator {
  private static model: Record<string, ModelStatic<Model>> = {};

  public static createModel<
    TModelAttributes extends {} = any,
    TCreationAttributes extends {} = TModelAttributes
  >(
    modelName: string,
    attributes: ModelAttributes<Model<TModelAttributes, TCreationAttributes>>,
    options?:
      | ModelOptions<Model<TModelAttributes, TCreationAttributes>>
      | undefined
  ): ModelStatic<Model<TModelAttributes, TCreationAttributes>> {
    if (!this.model[modelName]) {
      this.model[modelName] = Config.db.define(modelName, attributes, options);
    }

    return this.model[modelName];
  }
}

export function createModel<
  TModelAttributes extends {} = any,
  TCreationAttributes extends {} = TModelAttributes
>(
  modelName: string,
  attributes: ModelAttributes<Model<TModelAttributes, TCreationAttributes>>,
  options?:
    | ModelOptions<Model<TModelAttributes, TCreationAttributes>>
    | undefined
) {
  return ModelCreator.createModel.bind(ModelCreator)(
    modelName,
    attributes,
    options
  );
}

export const getKnex = () =>
  createSingleton('knex', () => {
    return Knex({ client: 'pg' });
  });
