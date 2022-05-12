import { HotelService } from '../../service/hotels/index';
import { LogService } from '../../service/logs/index';
import { Body, Controller, Ctx, Route, Context, Inject } from '../../../../../src';

@Controller('hotel')
export class HotelController {
  @Inject()
  logService: LogService;

  @Inject()
  hotelService: HotelService;

  @Route('query')
  async queryHotel(@Ctx() ctx: Context, @Body() body) {
    this.logService.doSomething();
    ctx.send(body);
  }
  @Route('put')
  async putHotel(@Ctx() ctx: Context, @Body() body) {
    const result = this.hotelService.testServiceInService();
    await ctx.send(body + ' : ' + result);
  }
}
