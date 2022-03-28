import Context from '../../driver/context';

export interface MiddlewareInterface {
  use(ctx: Context, next: () => Promise<any>): Promise<any>;
}
