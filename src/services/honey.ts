import Config from '../config';
import {
  createController,
  deleteByIdController,
  getByIdController,
  getByQueryController,
  updateByIdController,
  upsertByIdController
} from '../controllers';
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
} from '../interfaces/crud';
import { ExitMiddleware, Middleware } from '../interfaces/express';
import { NextFunction, Request, Response } from 'express';
import ExpressApp from './express';
import Postgres from './postgres';
import { upsertController } from '../controllers/upsert';
import { updateController } from '../controllers/update';

// eslint-disable-next-line
const defaultExitMiddleware: ExitMiddleware = (data, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.log('Response:', data);
};

export default class Honey {
  constructor(
    public express: ExpressApp,
    private postgres: Postgres
  ) {}

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
    processResponseData,
    processErrorResponse,
    table
  }: ICreate) {
    const path = pathOverride || `/${resource}`;
    resource = table || resource;

    const controller = createController({
      db: this.postgres,
      resource,
      params,
      message,
      processResponseData,
      processErrorResponse
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
    processResponseData,
    processErrorResponse,
    table
  }: IGet) {
    const path = pathOverride || `/${resource}`;
    resource = table || resource;

    const controller = getByQueryController({
      db: this.postgres,
      resource,
      fields,
      filterQuery: filter,
      format,
      processResponseData,
      processErrorResponse
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
    processResponseData,
    processErrorResponse,
    table
  }: IGetById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = getByIdController({
      db: this.postgres,
      resource,
      fields,
      idField: idField || 'id',
      processResponseData,
      processErrorResponse
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
    exitMiddleware,
    table
  }: IUpdateById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

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
    exitMiddleware,
    table
  }: IUpdate) {
    const path = pathOverride || `/${resource}`;
    resource = table || resource;

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
    exitMiddleware,
    table
  }: IUpsertById) {
    const path = pathOverride || `/${resource}/:id/upsert`;
    resource = table || resource;

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
    conflictTarget,
    table
  }: IUpsert) {
    const path = pathOverride || `/${resource}/:id/upsert`;
    resource = table || resource;

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
    idField,
    filter,
    table
  }: IDeleteById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = deleteByIdController({
      db: this.postgres,
      resource,
      message,
      idField,
      filterQuery: filter
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
