import { MiddlewareMetadata } from './../metadata/Middleware';
import { getMetadataStorage } from '../builder';

export function Middleware(options: { type: 'before' | 'after'; order?: number }) {
  const { beforeMiddleware, afterMiddleware } = getMetadataStorage();
  return function (target: any) {
    if (typeof target.prototype.use !== 'function') {
      throw new Error(`${target.name} not implement ${target.name}.prototype.use`);
    }
    const { order, type } = options;
    const mm = new MiddlewareMetadata();
    mm.type = type;
    mm.order = order || 0;
    mm.target = target;
    mm.ins = new target();
    if (type === 'before') {
      beforeMiddleware.push(mm);
    }
    if (type === 'after') {
      afterMiddleware.push(mm);
    }
  };
}
