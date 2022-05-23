import { Filter } from '@src/shared/interface';

export const extractInsertData = (
  body: Record<string, any>,
  params: Record<string, 'string' | 'number' | 'boolean'>
) => {
  const formatter = {
    string: String,
    number: Number,
    boolean: Boolean
  };

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
  const result: Filter = {};

  Object.entries(params).forEach(([key, value]) => {
    result[key] = {
      value: body[key],
      operator: value
    };
  });

  return result;
};
