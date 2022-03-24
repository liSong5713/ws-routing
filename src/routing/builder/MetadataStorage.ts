import { ControllerMetadata } from '../metadata/Controller';
import { ActionMetadata } from './../metadata/Action';
import { ParamMetadata } from './../metadata/Param';

export class MetadataStorage {
  controllers: Map<object, ControllerMetadata> = new Map();
  params: Map<object, ParamMetadata[]> = new Map();
  actions: ActionMetadata[] = [];
}
