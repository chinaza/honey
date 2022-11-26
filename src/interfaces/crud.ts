import { Controller } from '@src/controllers/interfaces';
import { ExitMiddleware, Middleware } from '@src/services/express';
import { GetQueryFilter } from '@src/shared/interface';

interface CrudParams {
  /** Table name which also serves as REST API resource name in path */
  resource: string;
  /** Override path to access endpoint */
  pathOverride?: string;
  /** Middleware to run before CRUD controller */
  middleware?: Middleware[];
  /** Middleware to run after CRUD controller returns response */
  exitMiddleware?: ExitMiddleware[];
}

export interface ICrud {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  controller: Controller;
  middleware?: Middleware[];
  exitMiddleware?: ExitMiddleware[];
}

export type ICreate = CrudParams & {
  /** Parameters in request body */
  params: Record<string, 'string' | 'number' | 'boolean' | '@updatedAt'>;
  /** Response message */
  message: string;
};

export type IUpdateById = CrudParams & {
  /** Parameters in request body */
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  /** Response message */
  message: string;
  /** column to run filter by id on */
  idField?: string;
};

export type IGet = CrudParams & {
  /** Fields to return in the response object */
  fields: string[];
  /** Filter builder for WHERE clause */
  filter: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    /** column to sort by */
    sortField: string;
  };
};

export type IGetById = CrudParams & {
  /** Fields to return in the response object */
  fields: string[];
  /** column to run filter by id on */
  idField?: string;
};

export type IDeleteById = CrudParams & {
  /** Response message */
  message: string;
};
