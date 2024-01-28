import { Controller } from '@src/controllers/interfaces';
import Postgres from '@src/services/postgres';
import { GetQueryFilter } from '@src/shared/interface';
import { ExitMiddleware, Middleware } from './express';
import { Request } from 'express';

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
  params: Record<
    string,
    'string' | 'number' | 'boolean' | '@updatedAt' | 'json'
  >;
  /** Response message */
  message: string;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
};

export type IUpdateById = CrudParams & {
  /** Parameters in request body */
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  /** Response message */
  message: string;
  /** column to run filter by id on */
  idField?: string;
};

export type IUpdate = CrudParams & {
  /** Parameters in request body */
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  /** Response message */
  message: string;
  /** Filter builder for WHERE clause */
  filter: GetQueryFilter;
};

export type IUpsertById = CrudParams & {
  /** Parameters in request body */
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  /** Response message */
  message: string;
  /** column to run filter by id on */
  idField: string;
};

export type IUpsert = CrudParams & {
  /** Parameters in request body */
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  /** Response message */
  message: string;
  /** column to use to determine conflict */
  conflictTarget: string[];
};

export type IGet = CrudParams & {
  /** Fields to return in the response object */
  fields: string[];
  /** Filter builder for WHERE clause */
  filter?: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    /** column to sort by */
    sortField: string;
  };
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
};

export type IGetById = CrudParams & {
  /** Fields to return in the response object */
  fields: string[];
  /** column to run filter by id on */
  idField?: string;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
};

export type IDeleteById = CrudParams & {
  /** Response message */
  message: string;
};

export interface GetByQueryControllerParams {
  db: Postgres;
  resource: string;
  fields: string[];
  filterQuery?: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    sortField: string;
  };
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
}

export interface GetByIdControllerParams {
  db: Postgres;
  resource: string;
  fields: string[];
  idField?: string;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
}

export interface CreateControllerParams {
  db: Postgres;
  resource: string;
  params: ICreate['params'];
  message: string;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
}

export interface UpdateByIdControllerParams {
  db: Postgres;
  resource: string;
  params: IUpdateById['params'];
  message: string;
  idField?: string;
}

export interface UpdateControllerParams {
  db: Postgres;
  resource: string;
  params: IUpdateById['params'];
  message: string;
  filterQuery?: GetQueryFilter;
}

export interface UpsertByIdControllerParams {
  db: Postgres;
  resource: string;
  params: IUpdateById['params'];
  message: string;
  idField: string;
}

export interface UpsertControllerParams {
  db: Postgres;
  resource: string;
  params: IUpdateById['params'];
  message: string;
  conflictTarget: string[];
}

export interface deleteByIdControllerParams {
  db: Postgres;
  resource: string;
  message: string;
}
