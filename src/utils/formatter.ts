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

const formatters: Record<string, Function> = {
  string: String,
  number: Number,
  boolean: Boolean,
  json: JSON.stringify,
  object: JSON.stringify
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

    if (!body[key]) return;

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
    if (!body[key] && value !== '@updatedAt') return { ...acc };

    let formattedValue: any;
    if (value === '@updatedAt') {
      formattedValue = new Date();
    } else {
      formattedValue = formatters[typeof body[key]](body[key]);
    }

    return {
      ...acc,
      [key]: {
        value: formattedValue,
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
      const val = formatReadFilter(
        queryParams,
        param as Record<string, GetFilterParam>
      ) as Record<string, FilterParam>;

      // skip missing query params
      if (!Object.keys(val).length) return;
      result[key] = val;
    } else {
      // skip missing query params
      if (!queryParams[key]) return;

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
