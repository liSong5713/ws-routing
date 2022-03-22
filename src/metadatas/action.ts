import Context from '../driver/context';

export interface Action {
  ctx: Context;
  message: any;
}
