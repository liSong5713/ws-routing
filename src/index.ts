import 'reflect-metadata';
import path from 'path';
import glob from 'glob';
import { Container } from 'typedi';
import { getMetadataStorage } from './routing/builder';
import { ExecutorMetadata } from './routing/metadata/Executor';
import { NotFound } from './routing/error/NotFound';
import { InternalServerError } from './routing/error/InternalServerError';
import { RoutingOptions } from './routing/metadata/types/RoutingOptions';
import { compose } from './routing/util/compose-middleware';
import { Application } from './driver/application';
import { Context } from './driver/context';

export { RoutingOptions } from './routing/metadata/types/RoutingOptions';
export { Context } from './driver/context';
// decorator
export { Middleware } from './routing/decorator/Middleware';
export { Service } from './routing/decorator/Service';
export { Agent } from './routing/decorator/Agent';
export { Inject } from './routing/decorator/Inject';
export { Controller } from './routing/decorator/Controller';
export { Route } from './routing/decorator/Route';
export { Body } from './routing/decorator/Body';
export { Ctx } from './routing/decorator/Ctx';
export { Subscribe } from './routing/decorator/Subscribe';
export { Event } from './routing/decorator/Event';

// errors
export { NotFound } from './routing/error/NotFound';
export { InternalServerError } from './routing/error/InternalServerError';
export { UnauthorizedError } from './routing/error/UnauthorizedError';
// interface
export { MiddlewareInterface } from './routing/metadata/interface/MiddlewareInterface';

const MDSymbol = Symbol('__middleware_dispatcher__');
export class WsRouting extends Application {
  private [MDSymbol]: Function;
  constructor(public options?: RoutingOptions) {
    super(options?.ws);
    this.loadClassesFromDirectory(); // load Middleware Controller Service Agent
    this.attachEvents();
    this.registerRoutes();
    const [beforeMiddleware, afterMiddleware] = this.sortMiddleware();
    const routeMiddleware = this.getRouteMiddleware();
    this[MDSymbol] = this.composeMiddleware(beforeMiddleware, routeMiddleware, afterMiddleware);
  }
  loadClassesFromDirectory() {
    const pattern = '/**/*.{ts,js}';
    const { controller = './controller', common = './common' } = this.options || {};
    const noTypeFiles = (filename) => !/\.d\.ts$/.test(filename);
    const loadFile = (dirs) => {
      if (!dirs || !dirs?.length) return;
      if (!Array.isArray(dirs)) {
        dirs = [dirs];
      }
      dirs.map((dir) => {
        const targetFilenames = glob.sync(dir + pattern).filter(noTypeFiles);
        targetFilenames.map((filename) => require(path.normalize(filename)));
      });
    };
    [common, controller].map(loadFile);
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
  attachEvents() {
    const { events: eventStorage } = getMetadataStorage();
    const eventMap: Map<string, Function[]> = new Map();
    for (const eventMetadata of eventStorage) {
      const { eventName, target, id: methodname } = eventMetadata;
      const executor = (...args) => {
        //@ts-ignore
        Container.get(target.constructor)[methodname](...args);
      };
      if (!eventMap.has(eventName)) {
        eventMap.set(eventName, [executor]);
        continue;
      }
      const executorList = eventMap.get(eventName)!;
      executorList.push(executor);
    }
    const proxyFn = function (eventName: string) {
      return (...args) => {
        const executorList = eventMap.get(eventName);
        executorList?.forEach((fn) => fn(...args));
      };
    };
    this.on('error', proxyFn('error'));
    // server
    this.wss.on('open', proxyFn('open'));
    this.wss.on('connection', proxyFn('connection'));
    this.wss.on('ping', proxyFn('ping'));
    this.wss.on('error', proxyFn('error'));
    this.wss.on('wss:close', proxyFn('close'));
    // socket
    this.on('ws:close', proxyFn('ws:close'));
    this.on('ws:error', proxyFn('ws:error'));
    this.on('ws:unexpected-response', proxyFn('ws:unexpected-response'));
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
        // this.emit('error', new NotFound(`not match ${route}`));
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
      try {
        await ins[methodname](...finalParams);
        ctx.status = 200;
      } catch (error) {
        ctx.status = 500;
        throw error;
      }
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
