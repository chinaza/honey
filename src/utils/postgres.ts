import { Filter, FilterParam, UpdateOpParam } from '@src/shared/interface';

const buildFilter = (field: string, { operator }: FilterParam) => {
  return `"${field}" ${
    ['like', 'not like'].includes(operator)
      ? operator.replace('like', 'ilike')
      : operator
  } ?`;
};

const formatFields = (fields: string[]) => {
  return fields.map((field) => `"${field}"`).join(', ');
};

export const generateWhere = (filter: Filter = {}) => {
  const result = {
    where: '',
    replacements: [] as Array<string | number | boolean>
  };
  result.where = Object.entries(filter).reduce((acc, [field, data]) => {
    if (['$or'].includes(field)) {
      const orQuery = Object.entries(data).reduce(
        (orAcc, [orField, orData]) => {
          const pre = orAcc ? `${orAcc} OR ` : '';
          const replacement = ['like', 'notLike'].includes(orData.operator)
            ? `%${orData.value}%`
            : orData.value;
          result.replacements.push(replacement);
          return `${pre}${buildFilter(orField, orData)}`;
        },
        ''
      );
      const pre = acc ? `${acc} AND ` : '';
      return `${pre}(${orQuery})`;
    } else {
      const pre = acc ? `${acc} AND ` : '';
      const replacement = ['like', 'not like'].includes(
        (data as FilterParam).operator
      )
        ? `%${(data as FilterParam).value}%`
        : (data as FilterParam).value;
      result.replacements.push(replacement);
      return `${pre}${buildFilter(field, data as FilterParam)}`;
    }
  }, '');

  return result;
};

export const generateCreateQuery = (
  table: string,
  data: Record<string, string | number | boolean>
) => {
  const replacements = Object.values(data);
  const query = `INSERT INTO ${table} 
  (${formatFields(Object.keys(data))}) 
    VALUES (${Object.keys(data)
      .map(() => '?')
      .join(', ')})`;

  return { query, replacements };
};
export const generateReadQuery = (
  table: string,
  fields: string[],
  filter?: Filter,
  paginate?: { page: number; limit: number },
  format?: { sort: 'ASC' | 'DESC'; sortField: string }
) => {
  const { where, replacements } = generateWhere(filter);
  const whereSegment = filter ? `WHERE ${where}` : '';
  let query = `SELECT ${formatFields(fields)} FROM ${table} ${whereSegment}`;
  if (format?.sort && format.sortField) {
    query += ` ORDER BY "${format.sortField}" ${format.sort}`;
  }
  if (paginate) {
    query += ` LIMIT ${paginate.limit} OFFSET ${
      paginate.limit * (paginate.page - 1)
    }`;
  }

  return { query, replacements };
};
export const generateUpdateQuery = (
  table: string,
  data: UpdateOpParam,
  filter?: Filter
) => {
  const replacements = [];

  let query = `UPDATE ${table} SET ${Object.keys(data)
    .map((field) => {
      replacements.push(data[field].value);

      if (data[field].operator === 'inc') return `"${field}" = "${field}" + ?`;
      else if (data[field].operator === 'dec')
        return `"${field}" = "${field}" - ?`;
      else return `"${field}" = ?`;
    })
    .join(', ')}`;

  const { where, replacements: whereReplacements } = generateWhere(filter);
  const whereSegment = filter ? ` WHERE ${where}` : '';

  query += whereSegment;
  replacements.push(...whereReplacements);

  return { query, replacements };
};
export const generateDeleteQuery = (table: string, filter?: Filter) => {
  const { where, replacements } = generateWhere(filter);
  const whereSegment = filter ? `WHERE ${where}` : '';
  const query = `DELETE FROM ${table} ${whereSegment}`;

  return { query, replacements };
};
