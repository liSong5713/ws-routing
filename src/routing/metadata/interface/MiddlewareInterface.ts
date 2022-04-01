import { Context } from '../../../index';

export interface MiddlewareInterface {
  use(ctx: Context, next: () => Promise<any>): any;
}
