import { ActionMetadata } from './../metadata/Action';
import { getMetadataStorage } from '../builder';

// method decorator
export function Route(pathname: string) {
  return function (target, key, descriptor) {
    const { actions } = getMetadataStorage();
    const isExist = actions.some((item) => item.target === target && item.pathname === pathname);
    if (isExist) {
      throw new Error(`${pathname} is duplicated of class ${target.constructor.name}`);
    }
    const metadata = new ActionMetadata();
    metadata.id = key;
    metadata.target = target;
    metadata.pathname = pathname;
    actions.push(metadata);
    return descriptor;
  };
}
