import { Knex } from 'knex';
import { Filter, FilterParam, UpdateOpParam, Join } from '../shared/interface';
import { getKnex } from './db';

export const NESTED_DELIMITER = '__hj__';

export const nestResults = (
  results: Record<string, any>[],
  joins: Join[] = []
) => {
  if (!joins.length || !results.length) return results;

  const nestedResults: any[] = [];
  const mainTableFields = Object.keys(results[0]).filter(
    (key) => !key.includes(NESTED_DELIMITER)
  );

  const groups = new Map<string, any>();

  results.forEach((row) => {
    // Generate a unique key for the main record based on non-nested fields
    const key = mainTableFields.map((f) => row[f]).join('|');

    if (!groups.has(key)) {
      const mainRecord: any = {};
      mainTableFields.forEach((f) => {
        mainRecord[f] = row[f];
      });

      // Initialize nested arrays for each join
      joins.forEach((join) => {
        const joinKey = join.alias || join.table;
        mainRecord[joinKey] = [];
      });

      groups.set(key, mainRecord);
      nestedResults.push(mainRecord);
    }

    const mainRecord = groups.get(key);

    joins.forEach((join) => {
      const joinKey = join.alias || join.table;
      const nestedObject: any = {};
      let hasValue = false;

      Object.keys(row).forEach((k) => {
        if (k.startsWith(`${joinKey}${NESTED_DELIMITER}`)) {
          const fieldName = k.split(NESTED_DELIMITER)[1];
          nestedObject[fieldName] = row[k];
          if (row[k] !== null) hasValue = true;
        }
      });

      if (hasValue) {
        // Check if this specific nested object already exists in the array
        const alreadyExists = mainRecord[joinKey].some((item: any) => {
          return Object.keys(nestedObject).every(
            (k) => item[k] === nestedObject[k]
          );
        });

        if (!alreadyExists) {
          mainRecord[joinKey].push(nestedObject);
        }
      }
    });
  });

  return nestedResults;
};

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
  format?: { sort: 'ASC' | 'DESC'; sortField: string },
  joins?: Join[]
) => {
  const knex = getKnex();

  // Handle field aliasing for joins
  const formattedFields = fields.map((field) => {
    if (field.includes('.')) {
      const [tableName, fieldName] = field.split('.');
      // Check if the table is part of a join
      const join = joins?.find(
        (j) => j.table === tableName || j.alias === tableName
      );
      if (join) {
        return `${field} as ${tableName}${NESTED_DELIMITER}${fieldName}`;
      }
    }
    return field;
  });

  let q = knex(table).select(formattedFields);

  // Add total count if pagination is needed
  if (paginate) {
    // Using knex.raw to create the count column with the same name as in original code
    q = knex(table).select([
      ...formattedFields.map((field) => {
        const [actualField, alias] = field.split(' as ');
        return alias
          ? knex.raw(`?? as ??`, [actualField, alias])
          : knex.raw(`?? as ??`, [field, field]);
      }),
      knex.raw('count(??) OVER() AS honey_total_count', [formattedFields[0]])
    ]);
  }

  // Apply joins
  if (joins && joins.length > 0) {
    joins.forEach((join) => {
      const joinTable = join.alias
        ? `${join.table} as ${join.alias}`
        : join.table;
      const joinType = join.type || 'inner';
      const operator = join.on.operator || '=';

      switch (joinType) {
        case 'left':
          q.leftJoin(joinTable, join.on.left, operator, join.on.right);
          break;
        case 'right':
          q.rightJoin(joinTable, join.on.left, operator, join.on.right);
          break;
        case 'full':
          q.fullOuterJoin(joinTable, join.on.left, operator, join.on.right);
          break;
        case 'cross':
          q.crossJoin(
            join.alias
              ? knex.raw('?? as ??', [join.table, join.alias])
              : knex.raw('??', [join.table])
          );
          break;
        case 'inner':
        default:
          q.innerJoin(joinTable, join.on.left, operator, join.on.right);
          break;
      }
    });
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
  conflictTarget: string[],
  doNothingOnConflict = false
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

  if (doNothingOnConflict) {
    // Dummy update to force returning the row
    // We update the first conflict target column to itself
    const conflictField = conflictTarget[0];
    updateData[conflictField] = knex.raw('??', [`${table}.${conflictField}`]);
  } else {
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
  }

  const { sql: query, bindings: replacements } = knex(table)
    .insert(insertData)
    .onConflict(conflictTarget)
    .merge(updateData)
    .returning(['*', knex.raw('(xmax = 0) as is_insert')])
    .toSQL();

  return { query, replacements };
};
