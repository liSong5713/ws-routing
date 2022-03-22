import { log } from 'console';
import 'reflect-metadata';
import { Controller, Route, Body, Ctx } from './routing/metadata';
import Application from './driver/application';

//  调用 /logs/insert => println 方法
@Controller('logs')
class Example {
  count = 1;
  @Route('insert')
  println(@Body() body, @Ctx() ctx) {
    log('Count:', ++this.count, body, ctx);
  }
}

const app = new Application();
app.listen(8080);
