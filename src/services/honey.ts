import Config from '@src/config';
import {
  createController,
  deleteByIdController,
  getByIdController,
  getByQueryController,
  updateByIdController
} from '@src/controllers';
import {
  ICreate,
  ICrud,
  IDeleteById,
  IGet,
  IGetById,
  IUpdateById
} from '@src/interfaces/crud';
import { NextFunction, Request, Response } from 'express';
import ExpressApp, { Middleware } from './express';
import Postgres from './postgres';

export default class Honey {
  constructor(public express: ExpressApp, private postgres: Postgres) {}

  get routes() {
    return this.express.appRoutes;
  }

  get rawRoutes() {
    return this.express.rawRoutes;
  }

  get db() {
    return Config.db;
  }

  private crud({
    method,
    path,
    controller,
    middleware = [],
    exitMiddleware = []
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
    exitMiddleware
  }: ICreate) {
    const path = pathOverride || `/${resource}`;

    const controller = createController(
      this.postgres,
      resource,
      params,
      message
    );

    this.crud({ method: 'post', path, controller, middleware, exitMiddleware });
  }

  public get({
    resource,
    fields,
    filter,
    format,
    middleware,
    pathOverride,
    exitMiddleware
  }: IGet) {
    const path = pathOverride || `/${resource}`;
    const controller = getByQueryController(
      this.postgres,
      resource,
      fields,
      filter,
      format
    );
    this.crud({ method: 'get', path, controller, middleware, exitMiddleware });
  }

  public getById({
    resource,
    fields,
    idField,
    middleware,
    pathOverride,
    exitMiddleware
  }: IGetById) {
    const path = pathOverride || `/${resource}/:id`;

    const controller = getByIdController(
      this.postgres,
      resource,
      fields,
      idField || 'id'
    );

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

    const controller = updateByIdController(
      this.postgres,
      resource,
      params,
      message,
      idField
    );
    this.crud({ method: 'put', path, controller, middleware, exitMiddleware });
  }

  public deleteById({
    resource,
    message,
    middleware,
    pathOverride,
    exitMiddleware
  }: IDeleteById) {
    const path = pathOverride || `/${resource}/:id`;
    const controller = deleteByIdController(this.postgres, resource, message);
    this.crud({
      method: 'delete',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }
}
