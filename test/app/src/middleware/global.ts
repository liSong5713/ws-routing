import { Middleware, Context, MiddlewareInterface } from '../../../../src';

@Middleware({ type: 'before', order: 3 })
class BeforeMiddleTest implements MiddlewareInterface {
  use(ctx: Context, next) {
    console.log('before middleware 1 process');
    return next();
  }
}
@Middleware({ type: 'before', order: 2 })
class BeforeMiddle2Test implements MiddlewareInterface {
  use(ctx: Context, next) {
    console.log('before middleware 2 process');
    return next();
  }
}
@Middleware({ type: 'after' })
class AfterMiddleTest implements MiddlewareInterface {
  use(ctx: Context, next: () => Promise<any>): Promise<any> {
    console.log('after middleware process');
    return next();
  }
}
