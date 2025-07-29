import { Controller } from '../controllers/interfaces';
import Postgres from '../services/postgres';
import { GetQueryFilter } from '../shared/interface';
import { ExitMiddleware, Middleware } from './express';
import { Request } from 'express';

export interface ICrud {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  controller: Controller;
  middleware?: Middleware[];
  exitMiddleware?: ExitMiddleware[];
}

interface CrudParams {
  /** Table name which also serves as REST API resource name in path */
  resource: string;
  /** Postgres table name override */
  table?: string;
  /** Override path to access endpoint */
  pathOverride?: string;
  /** Override method to access endpoint */
  methodOverride?: ICrud['method'];
  /** Middleware to run before CRUD controller */
  middleware?: Middleware[];
  /** Middleware to run after CRUD controller returns response */
  exitMiddleware?: ExitMiddleware[];
  /** A function that is called to transform your error response data */
  processErrorResponse?: (err: Error) => Error;
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
  /** Filter builder for WHERE clause */
  filter?: GetQueryFilter;
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
  /** Filter builder for WHERE clause */
  filter?: GetQueryFilter;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
};

export type IDeleteById = CrudParams & {
  /** Response message */
  message: string;
  /** column to run filter by id on */
  idField?: string;
  /** Filter builder for WHERE clause */
  filter?: GetQueryFilter;
};

export type IDelete = CrudParams & {
  /** Response message */
  message: string;
  /** Filter builder for WHERE clause */
  filter?: GetQueryFilter;
};

interface ControllerParams {
  db: Postgres;
  resource: string;
  processErrorResponse?: (err: Error) => Error;
}

export interface GetByQueryControllerParams extends ControllerParams {
  fields: string[];
  filterQuery?: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    sortField: string;
  };
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
}

export interface GetByIdControllerParams extends ControllerParams {
  fields: string[];
  idField?: string;
  filterQuery?: GetQueryFilter;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
}

export interface CreateControllerParams extends ControllerParams {
  params: ICreate['params'];
  message: string;
  /** A function that is called to transform your response data */
  processResponseData?: (data: any, req: Request) => any;
}

export interface UpdateByIdControllerParams extends ControllerParams {
  params: IUpdateById['params'];
  message: string;
  idField?: string;
  filterQuery?: GetQueryFilter;
}

export interface UpdateControllerParams extends ControllerParams {
  params: IUpdateById['params'];
  message: string;
  filterQuery?: GetQueryFilter;
}

export interface UpsertByIdControllerParams extends ControllerParams {
  params: IUpdateById['params'];
  message: string;
  idField: string;
}

export interface UpsertControllerParams extends ControllerParams {
  params: IUpdateById['params'];
  message: string;
  conflictTarget: string[];
}

export interface DeleteByIdControllerParams extends ControllerParams {
  message: string;
  idField?: string;
  filterQuery?: GetQueryFilter;
}

export interface DeleteControllerParams extends ControllerParams {
  message: string;
  filterQuery?: GetQueryFilter;
}
