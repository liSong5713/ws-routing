import path from 'path';
import { Action } from '../metadatas/action';
import { Service } from 'typedi';

// Map<target,MethodsMap>
// MethodsMap<methodname,Option>
class Option {
  params: Array<{ name: string; order: number }>;
  namespace: string;
  pathname: string;
  route: string;
}
class Config {}
const caches = new Map();
export const routes = new Map();

export function Controller(namespace: string) {
  return function (target) {
    const ins = new target();
    const methodsList = caches.get(target.prototype).entries();
    for (const [methodname, option] of methodsList) {
      const { pathname, params } = option;
      const route = (option.route = path.join(namespace, pathname));
      const sortableParams = params.sort((param1, param2) => param1.order - param2.order);
      routes.set(route, (action: Action) => {
        const finalParams = sortableParams.map((param) => {
          const { name } = param;
          switch (name) {
            case 'Body':
              return action.message;
            case 'Ctx':
              return action.ctx;
          }
        });
        ins[methodname](...finalParams);
      });
    }
  };
}

export function Route(pathname: string) {
  return function (target, key, descriptor) {
    if (!caches.has(target)) {
      caches.set(target, new Map());
    }
    const desc = caches.get(target);
    if (!desc.has(key)) {
      desc.set(key, new Option());
    }
    const option = desc.get(key);
    option.pathname = pathname;
    return descriptor;
  };
}

// params
export function Body() {
  return function (target, key, index) {
    if (!caches.has(target)) {
      caches.set(target, new Map());
    }
    const desc = caches.get(target);
    const param = { name: 'Body', order: index };
    if (!desc.has(key)) {
      const option = { params: [param] };
      desc.set(key, option);
    } else {
      const option = desc.get(key);
      option.params.push(param);
    }
  };
}
export function Ctx() {
  return function (target, key, index) {
    if (!caches.has(target)) {
      caches.set(target, new Map());
    }
    const desc = caches.get(target);
    const param = { name: 'Ctx', order: index };
    if (!desc.has(key)) {
      const option = { params: [param] };
      desc.set(key, option);
    } else {
      const option = desc.get(key);
      option.params.push(param);
    }
  };
}
// 待支持params  Ctx , Body
