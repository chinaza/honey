import { Request } from 'express';
import { ICreate, IUpdateById } from '../interfaces/crud';
import {
  Filter,
  FilterLocation,
  FilterOps,
  FilterParam,
  GetFilterParam,
  GetQueryFilter,
  UpdateOpParam
} from '../shared/interface';
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

    if (!Object.keys(body).includes(key)) return;

    const formatter = formatters[value];
    result[key] =
      formatter && ![null, undefined].includes(body[key])
        ? formatter(body[key])
        : body[key];
  });

  return result;
};

export const generateUpdateData = (
  body: Record<string, any>,
  params: IUpdateById['params']
) => {
  const result = Object.entries(params).reduce((acc, [key, value]) => {
    if (!Object.keys(body).includes(key) && value !== '@updatedAt')
      return { ...acc };

    let formattedValue: any;
    if (value === '@updatedAt') {
      formattedValue = new Date();
    } else {
      formattedValue = ![null, undefined].includes(body[key])
        ? formatters[typeof body[key]](body[key])
        : body[key];
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

const retrieveParamFromLocation = (
  req: Request,
  location: FilterLocation,
  key: string
) => {
  if (location === 'request') return (req as any)[key];

  return req[location][key];
};

export const formatReadFilter = (
  filterParams: Record<string, any>,
  filter: GetQueryFilter,
  req: Request
) => {
  const result: Filter = {};

  Object.entries(filter).forEach(([key, param]) => {
    if (key === '$or') {
      const val = formatReadFilter(
        filterParams,
        param as Record<string, GetFilterParam>,
        req
      ) as Record<string, FilterParam>;

      result[key] = val;
    } else {
      let valueToUse: any;
      if (param.overrideValue) {
        if (typeof param.overrideValue === 'function') {
          valueToUse = param.overrideValue(req);
        } else {
          valueToUse = param.overrideValue;
        }
      } else if (!!param.location) {
        valueToUse = retrieveParamFromLocation(
          req,
          param.location as FilterLocation,
          key
        );
      } else {
        valueToUse = filterParams[key];
      }

      if (!valueToUse) {
        throw new HttpError('Missing filter parameter', 400);
      }

      const valueFormatter = formatters[(param as GetFilterParam).value];
      result[key] = {
        operator: param.operator as FilterOps,
        value: valueFormatter(valueToUse)
      };
    }
  });

  return result;
};
