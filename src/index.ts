import 'reflect-metadata';
import path from 'path';
import { Container } from 'typedi';
import { getMetadataStorage } from './routing/builder';
import { ExecutorMetadata } from './routing/metadata/Executor';
import { NotFound } from './routing/error/NotFound';
import { InternalServerError } from './routing/error/InternalServerError';
import { ServerOptions } from 'ws';
import { compose } from './routing/util/compose-middleware';
import { Application } from './driver/application';
import Context from './driver/context';

// decorator
export { Middleware } from './routing/decorator/Middleware';
export { Service } from './routing/decorator/Service';
export { Agent } from './routing/decorator/Agent';
export { Inject } from './routing/decorator/Inject';
export { Controller } from './routing/decorator/Controller';
export { Route } from './routing/decorator/Route';
export { Body } from './routing/decorator/Body';
export { Ctx } from './routing/decorator/Ctx';

// errors
export { NotFound } from './routing/error/NotFound';
export { InternalServerError } from './routing/error/InternalServerError';
export { UnauthorizedError } from './routing/error/UnauthorizedError';
// interface
export { MiddlewareInterface } from './routing/interface/Middleware';

const MDSymbol = Symbol('__middleware_dispatcher__');
export class WsRouting extends Application {
  private [MDSymbol]: Function;
  constructor(options?: ServerOptions) {
    super(options);
    // TODO 加载文件目录
    this.registerRoutes();
    const [beforeMiddleware, afterMiddleware] = this.sortMiddleware();
    const routeMiddleware = this.getRouteMiddleware();
    this[MDSymbol] = this.composeMiddleware(beforeMiddleware, routeMiddleware, afterMiddleware);
  }
  load() {}

  onError(error) {
    this.emit('error', error);
  }
  sortMiddleware() {
    const { beforeMiddleware: beforeMiddlewareStorage, afterMiddleware: afterMiddlewareStorage } = getMetadataStorage();
    const beforeMiddleware = beforeMiddlewareStorage
      .sort((p1, p2) => p1.order - p2.order)
      .map((mw) => mw.ins.use.bind(mw.ins));
    const afterMiddleware = afterMiddlewareStorage
      .sort((p1, p2) => p1.order - p2.order)
      .map((mw) => mw.ins.use.bind(mw.ins));
    return [beforeMiddleware, afterMiddleware];
  }
  registerRoutes() {
    const {
      controllers: controllersStorage,
      actions: actionsStorage,
      params: paramsStorage,
      routes: routesStorage,
    } = getMetadataStorage();
    for (const action of actionsStorage) {
      const { pathname, target: _prototype, id } = action;
      if (!controllersStorage.has(_prototype)) {
        continue;
      }
      const executor = new ExecutorMetadata();
      const { namespace, target: _constructor } = controllersStorage.get(_prototype)!;
      const paramsOfTarget = paramsStorage.get(_prototype) || [];
      const paramsOfMethod = paramsOfTarget
        .filter((paramMetadata) => paramMetadata.methodname === id)
        .sort((p1, p2) => p1.order - p2.order);
      executor.route = path.join(namespace, pathname);
      executor.params = paramsOfMethod;
      executor.ins = Container.get(_constructor); // lazy instantiation
      executor.methodname = id;
      // register routes
      routesStorage.set(executor.route, executor);
    }
  }
  composeMiddleware(beforeMiddleware: Function[], routeMiddleware: Function, afterMiddleware: Function[]) {
    const middlewareList = beforeMiddleware.concat(routeMiddleware).concat(afterMiddleware);
    return compose(middlewareList);
  }
  getRouteMiddleware() {
    const { routes } = getMetadataStorage();
    return async (ctx, next) => {
      const { route, body } = ctx;
      if (!routes.has(route)) {
        this.emit('error', new NotFound(`${route} is not match`));
        return next();
      }
      const { params, ins, methodname } = routes.get(route)!;
      const finalParams = params.map(({ id }) => {
        switch (id) {
          case 'Body':
            return body;
          case 'Ctx':
            return ctx;
        }
      });
      await ins[methodname](...finalParams);
      return next();
    };
  }
  // overwrite per message handle
  async handlePerMessage(ctx: Context) {
    this[MDSymbol](ctx).catch((error) => {
      this.emit('error', new InternalServerError(error));
    });
  }
}
