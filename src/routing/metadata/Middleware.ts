import { MiddlewareInterface } from './interface/MiddlewareInterface';
export class MiddlewareMetadata {
  type = 'middleware';
  target: object;
  order: number;
  ins: MiddlewareInterface;
}
