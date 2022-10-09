import { Middleware } from '@src/services/express';
import { GetQueryFilter } from '@src/shared/interface';

interface CrudParams {
  resource: string;
  pathOverride?: string;
}

export type ICreate = CrudParams & {
  params: Record<string, 'string' | 'number' | 'boolean' | '@updatedAt'>;
  message: string;
  middleware?: Middleware[];
};

export type IUpdateById = CrudParams & {
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  message: string;
  middleware?: Middleware[];
};

export type IGet = CrudParams & {
  fields: string[];
  filter: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    sortField: string;
  };
  middleware?: Middleware[];
};

export type IGetById = CrudParams & {
  fields: string[];
  middleware?: Middleware[];
  idField?: string;
};

export type IDeleteById = CrudParams & {
  message: string;
  middleware?: Middleware[];
};
