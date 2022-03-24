import { MetadataStorage } from './MetadataStorage';
let ins: MetadataStorage;

export function getMetadataStorage() {
  if (!ins) {
    ins = new MetadataStorage();
  }
  return ins;
}
