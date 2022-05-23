import {
  Controller,
  createController,
  deleteByIdController,
  getByIdController,
  updateByIdController
} from '@src/controllers';
import ExpressApp, { Middleware } from './express';
import Postgres from './postgres';

export default class Honey {
  constructor(private express: ExpressApp, private postgres: Postgres) {}

  get routes() {
    return this.express.appRoutes;
  }

  private crud(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    controller: Controller,
    middleware: Middleware[] = []
  ) {
    this.express.appRoutes[method](path, ...middleware, controller);
  }

  public addMiddleware(middleware: Middleware[]) {
    this.express.appRoutes.use(...middleware);
  }

  public startServer() {
    this.express.listen();
  }

  public create(
    resource: string,
    params: Record<string, 'string' | 'number' | 'boolean'>,
    message: string,
    middleware?: Middleware[]
  ) {
    const path = `/api/${resource}`;

    const controller = createController(
      this.postgres,
      resource,
      params,
      message
    );

    this.crud('post', path, controller, middleware);
  }

  public getById(
    resource: string,
    fields: string[],
    middleware?: Middleware[]
  ) {
    const path = `/api/${resource}/:id`;

    const controller = getByIdController(this.postgres, resource, fields);

    this.crud('get', path, controller, middleware);
  }

  public updateById(
    resource: string,
    params: Record<string, 'replace' | 'inc' | 'dec'>,
    message: string,
    middleware?: Middleware[]
  ) {
    const path = `/api/${resource}/:id`;

    const controller = updateByIdController(
      this.postgres,
      resource,
      params,
      message
    );
    this.crud('put', path, controller, middleware);
  }

  public deleteById(
    resource: string,
    message: string,
    middleware?: Middleware[]
  ) {
    const path = `/api/${resource}/:id`;
    const controller = deleteByIdController(this.postgres, resource, message);
    this.crud('delete', path, controller, middleware);
  }
}
