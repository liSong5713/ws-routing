import { MyService } from './../../service/logs/index';
import { Body, Controller, Ctx, Route, Context, Inject } from '../../../../../src';

@Controller('hotel')
export class HotelController {
  @Inject()
  myService: MyService;
  @Route('query')
  queryHotel(@Ctx() ctx: Context, @Body() body) {
    this.myService.doSomething();
    ctx.send(body);
  }
}
