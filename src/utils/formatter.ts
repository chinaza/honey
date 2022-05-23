import {
  Filter,
  FilterOps,
  FilterParam,
  GetFilterParam,
  GetQueryFilter,
  UpdateOpParam
} from '@src/shared/interface';

const formatter = {
  string: String,
  number: Number,
  boolean: Boolean
};

export const extractInsertData = (
  body: Record<string, any>,
  params: Record<string, 'string' | 'number' | 'boolean'>
) => {
  const result: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    result[key] = formatter[value](body[key]);
  });

  return result;
};

export const generateUpdateData = (
  body: Record<string, any>,
  params: Record<string, 'replace' | 'inc' | 'dec'>
) => {
  const result: UpdateOpParam = {};

  Object.entries(params).forEach(([key, value]) => {
    result[key] = {
      value: body[key],
      operator: value
    };
  });

  return result;
};

export const formatReadFilter = (
  queryParams: Record<string, any>,
  filter: GetQueryFilter
) => {
  const result: Filter = {};

  Object.entries(filter).forEach(([key, param]) => {
    if (key === '$or') {
      result[key] = formatReadFilter(
        queryParams,
        param as Record<string, GetFilterParam>
      ) as Record<string, FilterParam>;
    } else {
      const valueFormatter = formatter[(param as GetFilterParam).value];
      result[key] = {
        operator: param.operator as FilterOps,
        value: valueFormatter(queryParams[key])
      };
    }
  });

  return result;
};
