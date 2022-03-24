import { log } from 'console';
import 'reflect-metadata';
import { WsRouting, Controller, Body, Ctx, Route } from '../../src';

//  调用 /logs/insert => println 方法
@Controller('logs')
class Example {
  count = 1;
  @Route('insert')
  println(@Body() body, @Ctx() ctx) {
    log('Count:', ++this.count, body, ctx);
  }
}

const ws = new WsRouting();
ws.listen(8080);
