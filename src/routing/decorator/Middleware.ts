import { MiddlewareMeta } from './../metadata/Middleware';
import { getMetadataStorage } from '../builder';

export function Middleware(options: { type: 'before' | 'after'; order?: number }) {
  const { beforeMiddleware, afterMiddleware } = getMetadataStorage();
  return function (target: any) {
    if (Object.prototype.toString.call(target.prototype.use) !== '[object Function]') {
      throw new Error(`${target.name} not implement ${target.name}.prototype.use`);
    }
    const { order, type } = options;
    const mm = new MiddlewareMeta();
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
