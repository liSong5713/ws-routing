import { getMetadataStorage } from '../builder';
import { ParamMetadata } from '../metadata/Param';

// param decorator
export function Body() {
  return function (target, key, index) {
    const { params: paramsStorage } = getMetadataStorage();
    const metadata = new ParamMetadata();
    metadata.id = 'Body';
    metadata.methodname = key;
    metadata.order = index;
    metadata.target = target;
    if (paramsStorage.has(target)) {
      const params = paramsStorage.get(target)!;
      params.push(metadata);
    } else {
      paramsStorage.set(target, [metadata]);
    }
  };
}
