import config from '../config';
import {
  generateCreateQuery,
  generateDeleteQuery,
  generateReadQuery,
  generateUpdateQuery,
  generateUpsertQuery
} from '../utils/postgres';
import { QueryTypes } from 'sequelize';
import { Filter, UpdateOpParam } from '../shared/interface';

export default class Postgres {
  public async read(
    table: string,
    fields: string[],
    filter?: Filter,
    paginate?: { page: number; limit: number },
    format?: { sort: 'ASC' | 'DESC'; sortField: string }
  ) {
    const { query, replacements } = generateReadQuery(
      table,
      fields,
      filter,
      paginate,
      format
    );

    const result = await config.db.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: [...replacements]
    });
    return result;
  }

  public async create(
    table: string,
    data: Record<string, string | number | boolean | Date | Object>
  ) {
    const { query, replacements } = generateCreateQuery(table, data);

    const res: any = await config.db.query(query, {
      type: QueryTypes.INSERT,
      raw: true,
      replacements: [...replacements]
    });

    // inserted ids
    return res[0] as { id: string | number }[];
  }

  public async update(table: string, data: UpdateOpParam, filter?: Filter) {
    const { query, replacements } = generateUpdateQuery(table, data, filter);

    await config.db.query(query, {
      type: QueryTypes.UPDATE,
      raw: true,
      replacements: [...replacements]
    });
  }

  public async delete(table: string, filter?: Filter) {
    const { query, replacements } = generateDeleteQuery(table, filter);

    await config.db.query(query, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: [...replacements]
    });
  }

  public async upsert(
    table: string,
    data: UpdateOpParam,
    conflictTarget: string[]
  ) {
    const { query, replacements } = generateUpsertQuery(
      table,
      data,
      conflictTarget
    );

    await config.db.query(query, {
      type: QueryTypes.INSERT,
      raw: true,
      replacements: [...replacements]
    });
  }
}
