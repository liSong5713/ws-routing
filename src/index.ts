import { NotFound } from './routing/error/NotFound';
import { InternalServerError } from './routing/error/InternalServerError';
import { ServerOptions } from 'ws';
import { MessageMetadata } from './driver/metadata/message';
import path from 'path';
import { getMetadataStorage } from './routing/builder';
import { ExecutorMetadata } from './routing/metadata/Executor';

// driver
import { Application } from './driver/application';
// decorator
export { Controller } from './routing/decorator/Controller';
export { Route } from './routing/decorator/Route';
export { Body } from './routing/decorator/Body';
export { Ctx } from './routing/decorator/Ctx';

export class WsRouting extends Application {
  routes: Map<string, ExecutorMetadata> = new Map();
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
    const { controllers: controllersStorage, actions: actionsStorage, params: paramsStorage } = getMetadataStorage();
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
    const executor = this.routes.get(route);
    if (!executor) return this.emit('error', new NotFound(`${route} is not match`));
    const { params, ins, methodname } = executor;
    const finalParams = params.map(({ id }) => {
      switch (id) {
        case 'Body':
          return message;
        case 'Ctx':
          return ctx;
      }
    });
    try {
      await ins[methodname](...finalParams);
    } catch (error) {
      this.emit('error', new InternalServerError(error as any));
    }
  }
}
