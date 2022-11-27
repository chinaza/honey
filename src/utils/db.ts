import { QueryTypes } from 'sequelize';
import config from '../config';

interface QueryParams {
  replacements?: any[];
  type: QueryTypes;
}
export default function runDbQuery(
  query: string,
  { replacements, type }: QueryParams
) {
  return config.db.query(query, {
    raw: true,
    replacements,
    type
  });
}
