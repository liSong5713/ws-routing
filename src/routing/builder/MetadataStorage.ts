import { EventMetadata } from './../metadata/Event';
import { ExecutorMetadata } from './../metadata/Executor';
import { MiddlewareMetadata } from './../metadata/Middleware';
import { ControllerMetadata } from '../metadata/Controller';
import { ActionMetadata } from './../metadata/Action';
import { ParamMetadata } from './../metadata/Param';

export class MetadataStorage {
  controllers: Map<object, ControllerMetadata> = new Map();
  params: Map<object, ParamMetadata[]> = new Map();
  actions: ActionMetadata[] = [];
  beforeMiddleware: MiddlewareMetadata[] = [];
  afterMiddleware: MiddlewareMetadata[] = [];
  routes: Map<string, ExecutorMetadata> = new Map();
  events: EventMetadata[] = [];
}
