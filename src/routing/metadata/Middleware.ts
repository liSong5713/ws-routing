import { MiddlewareInterface } from './../interface/Middleware';
export class MiddlewareMeta {
  type = 'middleware';
  target: object;
  order: number;
  ins: MiddlewareInterface;
}
