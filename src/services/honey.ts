import ExpressApp, { Middleware } from './express';

export default class Honey {
  constructor(private express: ExpressApp) {}

  private crud(
    method: 'get' | 'post' | 'put' | 'delete',
    resource: string,
    middleware: Middleware[] = []
  ) {
    const path = `/api/${resource}`;
    this.express.appRoutes[method](path, ...middleware, (_, res) => {
      return res.send(
        `This is a ${String(method).toUpperCase()} request for ${String(
          resource
        ).toUpperCase()}`
      );
    });
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
    middleware?: Middleware[]
  ) {
    this.crud('post', resource, middleware);
  }

  public updateById(
    resource: string,
    params: Record<string, 'replace' | 'inc' | 'dec'>,
    middleware?: Middleware[]
  ) {
    this.crud('put', resource, middleware);
  }

  public getById(resource: string, middleware?: Middleware[]) {
    this.crud('get', resource, middleware);
  }

  public deleteById(resource: string, middleware?: Middleware[]) {
    this.crud('delete', resource, middleware);
  }
}
