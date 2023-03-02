import { ICreate, IUpdateById } from '@src/interfaces/crud';
import {
  Filter,
  FilterOps,
  FilterParam,
  GetFilterParam,
  GetQueryFilter,
  UpdateOpParam
} from '@src/shared/interface';
import HttpError from './error';

const formatters = {
  string: String,
  number: Number,
  boolean: Boolean,
  json: JSON.parse
};

export const extractInsertData = (
  body: Record<string, any>,
  params: ICreate['params']
) => {
  const result: Record<string, string | number | boolean | Date | Object> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === '@updatedAt') {
      result[key] = new Date();
      return;
    }
    const formatter = formatters[value];
    result[key] = formatter ? formatter(body[key]) : body[key];
  });

  return result;
};

export const generateUpdateData = (
  body: Record<string, any>,
  params: IUpdateById['params']
) => {
  const result = Object.entries(params).reduce((acc, [key, value]) => {
    if (!body[key]) return { ...acc };

    return {
      ...acc,
      [key]: {
        value: value === '@updatedAt' ? new Date() : body[key],
        operator: value === '@updatedAt' ? 'replace' : value
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
      const valueFormatter = formatters[(param as GetFilterParam).value];

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
