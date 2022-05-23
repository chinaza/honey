import {
  Filter,
  FilterOps,
  FilterParam,
  GetFilterParam,
  GetQueryFilter,
  UpdateOpParam
} from '@src/shared/interface';
import HttpError from './error';

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
  const result = Object.entries(params).reduce((acc, [key, value]) => {
    if (!body[key]) return { ...acc };
    return {
      ...acc,
      [key]: {
        value: body[key],
        operator: value
      }
    };
  }, {} as UpdateOpParam);

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

      if (!valueFormatter)
        throw new HttpError('Invalid filter value type', 500);

      result[key] = {
        operator: param.operator as FilterOps,
        value: valueFormatter(queryParams[key])
      };
    }
  });

  return result;
};
