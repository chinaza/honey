import config from '@src/config';
import {
  generateCreateQuery,
  generateDeleteQuery,
  generateReadQuery,
  generateUpdateQuery
} from '@src/utils/postgres';
import { QueryTypes } from 'sequelize';
import { Filter } from '../shared/interface';

export default class Postgres {
  public async read(table: string, fields: string[], filter?: Filter) {
    try {
      const { query, replacements } = generateReadQuery(table, fields, filter);

      const result = await config.db.query(query, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    table: string,
    data: Record<string, string | number | boolean>
  ) {
    try {
      const { query, replacements } = generateCreateQuery(table, data);

      await config.db.query(query, {
        type: QueryTypes.INSERT,
        raw: true,
        replacements
      });
    } catch (error) {
      throw error;
    }
  }

  public async update(table: string, data: Filter, filter?: Filter) {
    try {
      const { query, replacements } = generateUpdateQuery(table, data, filter);

      await config.db.query(query, {
        type: QueryTypes.UPDATE,
        raw: true,
        replacements
      });
    } catch (error) {
      throw error;
    }
  }

  public async delete(table: string, filter?: Filter) {
    try {
      const { query, replacements } = generateDeleteQuery(table, filter);

      await config.db.query(query, {
        type: QueryTypes.DELETE,
        raw: true,
        replacements
      });
    } catch (error) {
      throw error;
    }
  }
}
