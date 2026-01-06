import Config from '../config';
import {
  createController,
  deleteByIdController,
  getByIdController,
  getByQueryController,
  updateByIdController,
  upsertByIdController,
  upsertController,
  updateController,
  deleteController,
  queryController
} from '../controllers';
import {
  ICreate,
  ICrud,
  IDelete,
  IDeleteById,
  IGet,
  IGetById,
  IUpdate,
  IUpdateById,
  IUpsert,
  IUpsertById,
  IQuery
} from '../interfaces/crud';
import { ExitMiddleware, Middleware } from '../interfaces/express';
import { NextFunction, Request, Response } from 'express';
import ExpressApp from './express';
import Postgres from './postgres';

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
    table,
    methodOverride
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

    this.crud({
      method: methodOverride || 'post',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public get({
    resource,
    fields,
    filter,
    format,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    processResponseData,
    processErrorResponse,
    table,
    joins
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
      processErrorResponse,
      joins
    });
    this.crud({
      method: methodOverride || 'get',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public getById({
    resource,
    fields,
    idField,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    processResponseData,
    processErrorResponse,
    table,
    filter,
    joins
  }: IGetById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = getByIdController({
      db: this.postgres,
      resource,
      fields,
      idField: idField || 'id',
      processResponseData,
      processErrorResponse,
      filterQuery: filter,
      joins
    });

    this.crud({
      method: methodOverride || 'get',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public updateById({
    resource,
    params,
    idField,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    table,
    filter,
    processErrorResponse,
    processResponseData
  }: IUpdateById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = updateByIdController({
      db: this.postgres,
      resource,
      params,
      message,
      idField,
      filterQuery: filter,
      processErrorResponse,
      processResponseData
    });
    this.crud({
      method: methodOverride || 'put',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public update({
    resource,
    params,
    filter,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    table,
    processErrorResponse,
    processResponseData
  }: IUpdate) {
    const path = pathOverride || `/${resource}`;
    resource = table || resource;

    const controller = updateController({
      db: this.postgres,
      resource,
      params,
      message,
      filterQuery: filter,
      processErrorResponse,
      processResponseData
    });
    this.crud({
      method: methodOverride || 'put',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public upsertById({
    resource,
    params,
    idField,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    table,
    processErrorResponse,
    processResponseData,
    doNothingOnConflict
  }: IUpsertById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = upsertByIdController({
      db: this.postgres,
      resource,
      params,
      message,
      idField,
      processErrorResponse,
      processResponseData,
      doNothingOnConflict
    });
    this.crud({
      method: methodOverride || 'put',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public upsert({
    resource,
    params,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    conflictTarget,
    table,
    processErrorResponse,
    processResponseData,
    doNothingOnConflict
  }: IUpsert) {
    const path = pathOverride || `/${resource}`;
    resource = table || resource;

    const controller = upsertController({
      db: this.postgres,
      resource,
      params,
      message,
      conflictTarget,
      processErrorResponse,
      processResponseData,
      doNothingOnConflict
    });
    this.crud({
      method: methodOverride || 'put',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public deleteById({
    resource,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    idField,
    filter,
    table,
    processErrorResponse
  }: IDeleteById) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = deleteByIdController({
      db: this.postgres,
      resource,
      message,
      idField,
      filterQuery: filter,
      processErrorResponse
    });
    this.crud({
      method: methodOverride || 'delete',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public delete({
    resource,
    message,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    filter,
    table,
    processErrorResponse
  }: IDelete) {
    const path = pathOverride || `/${resource}/:id`;
    resource = table || resource;

    const controller = deleteController({
      db: this.postgres,
      resource,
      message,
      filterQuery: filter,
      processErrorResponse
    });
    this.crud({
      method: methodOverride || 'delete',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }

  public query({
    resource,
    query,
    middleware,
    pathOverride,
    exitMiddleware,
    methodOverride,
    processErrorResponse,
    processResponseData
  }: IQuery) {
    const path = pathOverride || `/${resource}`;

    const controller = queryController({
      db: this.postgres,
      query,
      processErrorResponse,
      processResponseData
    });
    this.crud({
      method: methodOverride || 'get',
      path,
      controller,
      middleware,
      exitMiddleware
    });
  }
}
