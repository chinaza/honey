import { Knex } from 'knex';
import { Filter, FilterParam, UpdateOpParam } from '../shared/interface';
import { getKnex } from './db';

export const applyFilter = (query: Knex.QueryBuilder, filter: Filter = {}) => {
  Object.entries(filter).forEach(([field, data]) => {
    if (field === '$or') {
      query.where((builder) => {
        Object.entries(data).forEach(([orField, orData], index) => {
          const method = index === 0 ? 'where' : 'orWhere';
          const orParam = orData as FilterParam;

          if (['like', 'not like'].includes(orParam.operator)) {
            builder[method](orField, 'ilike', `%${orParam.value}%`);
          } else {
            builder[method](orField, orParam.operator, orParam.value);
          }
        });
      });
    } else {
      const param = data as FilterParam;

      if (['like', 'not like'].includes(param.operator)) {
        query.where(
          field,
          param.operator === 'like' ? 'ilike' : 'not ilike',
          `%${param.value}%`
        );
      } else {
        query.where(field, param.operator, param.value);
      }
    }
  });

  return query;
};

export const generateCreateQuery = (
  table: string,
  data: Record<string, string | number | boolean | Date | Object>
) => {
  const knex = getKnex();
  const { sql: query, bindings: replacements } = knex(table)
    .insert(data)
    .returning('id')
    .toSQL();

  return { query, replacements };
};

export const generateReadQuery = (
  table: string,
  fields: string[],
  filter?: Filter,
  paginate?: { page: number; limit: number },
  format?: { sort: 'ASC' | 'DESC'; sortField: string }
) => {
  const knex = getKnex();

  let q = knex(table).select(fields);

  // Add total count if pagination is needed
  if (paginate) {
    // Using knex.raw to create the count column with the same name as in original code
    q = knex(table).select([
      ...fields.map((field) => knex.raw(`?? as ??`, [field, field])),
      knex.raw('count(??) OVER() AS honey_total_count', [fields[0]])
    ]);
  }

  // Apply filters
  if (filter) {
    q = applyFilter(q, filter);
  }

  // Apply sorting
  if (format?.sort && format.sortField) {
    q.orderBy(format.sortField, format.sort);
  }

  // Apply pagination
  if (paginate) {
    q.limit(paginate.limit).offset(paginate.limit * (paginate.page - 1));
  }

  const { sql: query, bindings: replacements } = q.toSQL();

  return { query, replacements };
};
export const generateUpdateQuery = (
  table: string,
  data: UpdateOpParam,
  filter?: Filter
) => {
  const knex = getKnex();
  let q = knex(table);

  // Build the update object
  const updateData: Record<string, Knex.Raw> = {};

  Object.entries(data).forEach(([field, fieldData]) => {
    const param = fieldData as any;

    if (param.operator === 'inc') {
      updateData[field] = knex.raw('?? + ?', [field, param.value]);
    } else if (param.operator === 'dec') {
      updateData[field] = knex.raw('?? - ?', [field, param.value]);
    } else {
      updateData[field] = param.value;
    }
  });

  // Apply filter conditions
  if (filter) {
    q = applyFilter(q, filter);
  }

  const { sql: query, bindings: replacements } = q
    .update(updateData)
    .returning('*')
    .toSQL();
  console.log(query, replacements);
  return { query, replacements };
};
export const generateDeleteQuery = (table: string, filter?: Filter) => {
  const knex = getKnex();
  let q = knex(table);

  if (filter) {
    q = applyFilter(q, filter);
  }

  const { sql: query, bindings: replacements } = q.delete().toSQL();
  return { query, replacements };
};

export const generateUpsertQuery = (
  table: string,
  data: UpdateOpParam,
  conflictTarget: string[]
) => {
  const knex = getKnex();

  // Prepare insert data
  const insertData: Record<string, UpdateOpParam[string]['value']> = {};
  Object.entries(data).forEach(([field, fieldData]) => {
    insertData[field] = fieldData.value;
  });

  // Prepare update data for conflict resolution
  const updateData: Record<string, Knex.Raw | UpdateOpParam[string]['value']> =
    {};
  Object.entries(data).forEach(([field, fieldData]) => {
    const param = fieldData;

    if (param.operator === 'inc') {
      updateData[field] = knex.raw('?? + ?', [
        `${table}.${field}`,
        param.value
      ]);
    } else if (param.operator === 'dec') {
      updateData[field] = knex.raw('?? - ?', [
        `${table}.${field}`,
        param.value
      ]);
    } else {
      updateData[field] = param.value;
    }
  });

  const { sql: query, bindings: replacements } = knex(table)
    .insert(insertData)
    .onConflict(conflictTarget)
    .merge(updateData)
    .returning('*')
    .toSQL();

  return { query, replacements };
};
