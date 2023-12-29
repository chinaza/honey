import Config from '@src/config';
import {
  createController,
  deleteByIdController,
  getByIdController,
  getByQueryController,
  updateByIdController,
  upsertByIdController
} from '@src/controllers';
import {
  ICreate,
  ICrud,
  IDeleteById,
  IGet,
  IGetById,
  IUpdate,
  IUpdateById,
  IUpsert,
  IUpsertById
} from '@src/interfaces/crud';
import { ExitMiddleware, Middleware } from '@src/interfaces/express';
import { NextFunction, Request, Response } from 'express';
import ExpressApp from './express';
import Postgres from './postgres';
import { upsertController } from '@src/controllers/upsert';
import { updateController } from '@src/controllers/update';

// eslint-disable-next-line
const defaultExitMiddleware: ExitMiddleware = (data, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.log('Response:', data);
};

export default class Honey {
  constructor(public express: ExpressApp, private postgres: Postgres) {}

  get routes() {
    return this.express.appRoutes;
  }

  get db() {
    return Config.db;
  }

  private crud({
    method,
    path,
    controller,
    middleware = [],
    exitMiddleware = [defaultExitMiddleware]
  }: ICrud) {
    const dbCheck = async (req: Request, res: Response, next: NextFunction) => {
      if (!Config.db) {
        return res.status(503).send({
          message: 'DB Initialization in progress'
        });
      } else {
        next();
      }
    };
    this.express.appRoutes[method](
      path,
      dbCheck,
      ...middleware,
      controller,
      ...exitMiddleware
    );
  }

  public addMiddleware(middleware: Middleware[]) {
    this.express.appRoutes.use(...middleware);
  }

  public startServer() {
    this.express.listen();
  }

  public create({
    resource,
    params,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    processResponseData
  }: ICreate) {
    const path = pathOverride || `/${resource}`;

    const controller = createController({
      db: this.postgres,
      resource,
      params,
      message,
      processResponseData
    });

    this.crud({ method: 'post', path, controller, middleware, exitMiddleware });
  }

  public get({
    resource,
    fields,
    filter,
    format,
    middleware,
    pathOverride,
    exitMiddleware,
    processResponseData
  }: IGet) {
    const path = pathOverride || `/${resource}`;
    const controller = getByQueryController({
      db: this.postgres,
      resource,
      fields,
      filterQuery: filter,
      format,
      processResponseData
    });
    this.crud({ method: 'get', path, controller, middleware, exitMiddleware });
  }

  public getById({
    resource,
    fields,
    idField,
    middleware,
    pathOverride,
    exitMiddleware,
    processResponseData
  }: IGetById) {
    const path = pathOverride || `/${resource}/:id`;

    const controller = getByIdController({
      db: this.postgres,
      resource,
      fields,
      idField: idField || 'id',
      processResponseData
    });

    this.crud({ method: 'get', path, controller, middleware, exitMiddleware });
  }

  public updateById({
    resource,
    params,
    idField,
    message,
    middleware,
    pathOverride,
    exitMiddleware
  }: IUpdateById) {
    const path = pathOverride || `/${resource}/:id`;

    const controller = updateByIdController({
      db: this.postgres,
      resource,
      params,
      message,
      idField
    });
    this.crud({ method: 'put', path, controller, middleware, exitMiddleware });
  }

  public update({
    resource,
    params,
    filter,
    message,
    middleware,
    pathOverride,
    exitMiddleware
  }: IUpdate) {
    const path = pathOverride || `/${resource}/:id`;

    const controller = updateController({
      db: this.postgres,
      resource,
      params,
      message,
      filterQuery: filter
    });
    this.crud({ method: 'put', path, controller, middleware, exitMiddleware });
  }

  public upsertById({
    resource,
    params,
    idField,
    message,
    middleware,
    pathOverride,
    exitMiddleware
  }: IUpsertById) {
    const path = pathOverride || `/${resource}/:id/upsert`;

    const controller = upsertByIdController({
      db: this.postgres,
      resource,
      params,
      message,
      idField
    });
    this.crud({ method: 'put', path, controller, middleware, exitMiddleware });
  }

  public upsert({
    resource,
    params,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    conflictTarget
  }: IUpsert) {
    const path = pathOverride || `/${resource}/:id/upsert`;

    const controller = upsertController({
      db: this.postgres,
      resource,
      params,
      message,
      conflictTarget
    });
    this.crud({ method: 'put', path, controller, middleware, exitMiddleware });
  }

  public deleteById({
    resource,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    processResponseData
  }: IDeleteById) {
    const path = pathOverride || `/${resource}/:id`;
    const controller = deleteByIdController({
      db: this.postgres,
      resource,
      message,
      processResponseData
    });
    this.crud({
      method: 'delete',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }
}
