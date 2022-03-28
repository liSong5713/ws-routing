import { log } from 'console';
import 'reflect-metadata';
import { WsRouting, Controller, Body, Ctx, Route } from '../../src';
import Context from '../../src/driver/context';

//  调用 /logs/insert => println 方法
@Controller('logs')
class Example {
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
    ctx.send(message);
  }
  // Test: 参数位置乱序
  @Route('put')
  putLogs(@Ctx() ctx, @Body() body) {
    const message = this.creatMessage('logs/get', body);
    ctx.send(message);
  }
  @Route('broadcast')
  broadcast(@Ctx() ctx, @Body() body) {
    const message = this.creatMessage('logs/broadcast', body);
    ctx.broadcast(message);
  }
}

const ws = new WsRouting();
ws.listen(8080);
