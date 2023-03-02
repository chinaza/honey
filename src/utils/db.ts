import {
  Model,
  ModelAttributes,
  ModelOptions,
  ModelStatic,
  QueryTypes
} from 'sequelize';
import Config from '../config';

interface QueryParams {
  replacements?: any[];
  type: QueryTypes;
}
export default function runDbQuery(query: string, params?: QueryParams) {
  const { replacements, type } = params || {};

  return Config.db.query(query, {
    raw: true,
    replacements,
    type
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
