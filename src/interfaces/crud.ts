import { Controller } from '@src/controllers/interfaces';
import { Middleware } from '@src/services/express';
import { GetQueryFilter } from '@src/shared/interface';

interface CrudParams {
  resource: string;
  pathOverride?: string;
  middleware?: Middleware[];
  exitMiddleware?: Middleware[];
}

export interface ICrud {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  controller: Controller;
  middleware?: Middleware[];
  exitMiddleware?: Middleware[];
}

export type ICreate = CrudParams & {
  params: Record<string, 'string' | 'number' | 'boolean' | '@updatedAt'>;
  message: string;
};

export type IUpdateById = CrudParams & {
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  message: string;
};

export type IGet = CrudParams & {
  fields: string[];
  filter: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    sortField: string;
  };
};

export type IGetById = CrudParams & {
  fields: string[];
  idField?: string;
};

export type IDeleteById = CrudParams & {
  message: string;
};
