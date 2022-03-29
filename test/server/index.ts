import { MiddlewareInterface } from '../../src/routing/interface/Middleware';
import 'reflect-metadata';
import { WsRouting, Controller, Body, Ctx, Route, Middleware, Service, Inject, Agent } from '../../src';
import Context from '../../src/driver/context';

@Agent()
class MyAgent {
  doAgentThing() {
    console.log('do agent thing~');
  }
}

@Service()
class MyService {
  @Inject()
  myAgent: MyAgent;
  doSomething() {
    this.myAgent.doAgentThing();
    console.log('service do something~');
  }
}

@Middleware({ type: 'before' })
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

@Controller('logs')
class ExampleController {
  @Inject()
  myService: MyService;
  count = 1;
  creatMessage(title: string, om: string) {
    return JSON.stringify({
      title: title,
      originalMessage: om,
      tip: `调用次数:${++this.count}`,
      time: new Date().toLocaleString(),
    });
  }
  @Route('insert')
  insertLogs(@Body() body, @Ctx() ctx: Context) {
    const message = this.creatMessage('logs/insert', body);
    this.myService.doSomething();
    ctx.send(message);
  }
  // Test: 参数位置乱序
  @Route('put')
  async putLogs(@Ctx() ctx: Context, @Body() body) {
    const message = this.creatMessage('logs/get', body);
    try {
      const res = await ctx.send(message);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
  @Route('get')
  getLogs(@Ctx() ctx: Context, @Body() body) {
    // undefined null ''  true/false  plain text
    ctx.send('');
    ctx.send(false);
    ctx.send(null);
    ctx.send('hello');
    ctx.send(Buffer.from('from buffer', 'utf-8'));
  }
  @Route('broadcast')
  broadcast(@Ctx() ctx, @Body() body) {
    const message = this.creatMessage('logs/broadcast', body);
    const res = ctx.broadcast(message);
    res.then((v) => {
      console.log(v);
    });
  }
}

const wr = new WsRouting();
wr.on('error', (error) => {
  console.error(error);
});
wr.listen(8080);
