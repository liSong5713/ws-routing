import { MessageMetadata } from './driver/metadata/message';
import path from 'path';
import { getMetadataStorage } from './routing/builder';
import { ExecutorMetadata } from './routing/metadata/Executor';
import { NotFound } from './routing/error/NotFound';
import { InternalServerError } from './routing/error/InternalServerError';
import { ServerOptions } from 'ws';

// driver
import { Application } from './driver/application';
import { compose } from './routing/util/compose-middleware';

// decorator
export { Middleware } from './routing/decorator/Middleware';
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
export class WsRouting extends Application {
  routes: Map<string, ExecutorMetadata> = new Map();
  beforeMiddleware: Function[] = [];
  afterMiddleware: Function[] = [];
  constructor(options?: ServerOptions) {
    super(options);
    // TODO 加载文件目录
    this.load();
    this.createExecutor();
  }
  load() {}
  onError(error) {
    this.emit('error', error);
  }
  createExecutor() {
    const {
      controllers: controllersStorage,
      actions: actionsStorage,
      params: paramsStorage,
      beforeMiddleware: beforeMiddlewareStorage,
      afterMiddleware: afterMiddlewareStorage,
    } = getMetadataStorage();
    this.beforeMiddleware = beforeMiddlewareStorage
      .sort((p1, p2) => p1.order - p2.order)
      .map((mw) => mw.ins.use.bind(mw.ins));
    this.afterMiddleware = afterMiddlewareStorage
      .sort((p1, p2) => p1.order - p2.order)
      .map((mw) => mw.ins.use.bind(mw.ins));

    for (const action of actionsStorage) {
      const { pathname, target, id } = action;
      if (!controllersStorage.has(target)) {
        continue;
      }
      const executor = new ExecutorMetadata();
      const { namespace, ins } = controllersStorage.get(target)!;
      const paramsOfTarget = paramsStorage.get(target) || [];
      const paramsOfMethod = paramsOfTarget
        .filter((paramMetadata) => paramMetadata.methodname === id)
        .sort((p1, p2) => p1.order - p2.order);
      executor.route = path.join(namespace, pathname);
      executor.params = paramsOfMethod;
      executor.ins = ins;
      executor.methodname = id;
      this.routes.set(executor.route, executor);
    }
  }
  async handlePerMessage(messageObj: MessageMetadata) {
    const { route, message, ctx } = messageObj;
    const { routes, beforeMiddleware, afterMiddleware } = this;
    let executorMiddleware;
    const executor = routes.get(route);
    if (!executor) {
      executorMiddleware = (_, next) => {
        this.emit('error', new NotFound(`${route} is not match`));
        return next();
      };
    } else {
      const { params, ins, methodname } = executor;
      const finalParams = params.map(({ id }) => {
        switch (id) {
          case 'Body':
            return message;
          case 'Ctx':
            return ctx;
        }
      });
      executorMiddleware = async (_, next) => {
        await ins[methodname](...finalParams);
        return next();
      };
    }
    const middlewares = beforeMiddleware.concat(executorMiddleware).concat(afterMiddleware);
    const fnChain = compose(middlewares);
    fnChain(ctx).catch((error) => {
      this.emit('error', new InternalServerError(error));
    });
  }
}
