import { ControllerMetadata } from './../metadata/Controller';
import { getMetadataStorage } from '../builder';
import { Service as collect } from 'typedi';
// Controller Layer
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
    metadata.target = target;
    metadata.namespace = namespace;
    controllers.set(target.prototype, metadata);
    // typedi serve single instance
    collect()(target);
  };
}
