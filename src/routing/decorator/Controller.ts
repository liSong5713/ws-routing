import { ControllerMetadata } from './../metadata/Controller';
import { getMetadataStorage } from '../builder';

// class decorator
export function Controller(namespace: string) {
  return function (target) {
    const { controllers } = getMetadataStorage();
    const values = controllers.values();
    for (const item of values) {
      if (item.namespace === namespace) {
        throw new Error(`${namespace} is duplicated`);
      }
    }
    const metadata = new ControllerMetadata();
    metadata.ins = new target();
    metadata.target = target.prototype;
    metadata.namespace = namespace;
    controllers.set(metadata.target, metadata);
  };
}
