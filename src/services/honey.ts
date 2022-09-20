import config from '@src/config';
import {
  Controller,
  createController,
  deleteByIdController,
  getByIdController,
  getByQueryController,
  updateByIdController
} from '@src/controllers';
import { ICreate, IUpdateById } from '@src/interfaces/crud';
import { GetQueryFilter } from '@src/shared/interface';
import { NextFunction, Request, Response } from 'express';
import ExpressApp, { Middleware } from './express';
import Postgres from './postgres';

interface IGet {
  resource: string;
  fields: string[];
  filter: GetQueryFilter;
  format?: {
    sort: 'ASC' | 'DESC';
    sortField: string;
  };
  middleware?: Middleware[];
}

interface IGetById {
  resource: string;
  fields: string[];
  middleware?: Middleware[];
  idField?: string;
}

interface IDeleteById {
  resource: string;
  message: string;
  middleware?: Middleware[];
}

export default class Honey {
  constructor(private express: ExpressApp, private postgres: Postgres) {}

  get routes() {
    return this.express.appRoutes;
  }

  get db() {
    return config.db;
  }

  private crud(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    controller: Controller,
    middleware: Middleware[] = []
  ) {
    const dbCheck = async (req: Request, res: Response, next: NextFunction) => {
      if (!config.db) {
        return res.status(503).send({
          message: 'DB Initialization in progress'
        });
      } else {
        next();
      }
    };
    this.express.appRoutes[method](path, dbCheck, ...middleware, controller);
  }

  public addMiddleware(middleware: Middleware[]) {
    this.express.appRoutes.use(...middleware);
  }

  public startServer() {
    this.express.listen();
  }

  public create({ resource, params, message, middleware }: ICreate) {
    const path = `/api/${resource}`;

    const controller = createController(
      this.postgres,
      resource,
      params,
      message
    );

    this.crud('post', path, controller, middleware);
  }

  public get({ resource, fields, filter, format, middleware }: IGet) {
    const path = `/api/${resource}`;
    const controller = getByQueryController(
      this.postgres,
      resource,
      fields,
      filter,
      format
    );
    this.crud('get', path, controller, middleware);
  }

  public getById({ resource, fields, idField, middleware }: IGetById) {
    const path = `/api/${resource}/:id`;

    const controller = getByIdController(
      this.postgres,
      resource,
      fields,
      idField || 'id'
    );

    this.crud('get', path, controller, middleware);
  }

  public updateById({ resource, params, message, middleware }: IUpdateById) {
    const path = `/api/${resource}/:id`;

    const controller = updateByIdController(
      this.postgres,
      resource,
      params,
      message
    );
    this.crud('put', path, controller, middleware);
  }

  public deleteById({ resource, message, middleware }: IDeleteById) {
    const path = `/api/${resource}/:id`;
    const controller = deleteByIdController(this.postgres, resource, message);
    this.crud('delete', path, controller, middleware);
  }
}
