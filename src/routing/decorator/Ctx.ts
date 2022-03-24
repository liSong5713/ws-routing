import { ParamMetadata } from './../metadata/Param';
import { getMetadataStorage } from '../builder';

// param decorator
export function Ctx() {
  return function (target, key, index) {
    const { params: paramsStorage } = getMetadataStorage();
    const metadata = new ParamMetadata();
    metadata.id = 'Ctx';
    metadata.target = target;
    metadata.methodname = key;
    metadata.order = index;
    if (paramsStorage.has(target)) {
      const params = paramsStorage.get(target)!;
      params.push(metadata);
    } else {
      paramsStorage.set(target, [metadata]);
    }
  };
}
