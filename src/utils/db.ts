import { QueryTypes } from 'sequelize';
import config from '../config';

interface QueryParams {
  replacements?: any[];
  type: QueryTypes;
}
export default function runDbQuery(query: string, params?: QueryParams) {
  const { replacements, type } = params || {};

  return config.db.query(query, {
    raw: true,
    replacements,
    type
  });
}
