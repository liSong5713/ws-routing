import { Service, Inject } from '../../../../../src';
import { LogService } from '../logs';

@Service()
export class HotelService {
  @Inject()
  logService: LogService;
  testServiceInService() {
    const logStr = this.logService.doSomething();
    return logStr + ' ' + 'Hotel Service';
  }
}
