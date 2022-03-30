import { MiddlewareInterface } from './interface/MiddlewareInterface';
export class MiddlewareMeta {
  type = 'middleware';
  target: object;
  order: number;
  ins: MiddlewareInterface;
}
