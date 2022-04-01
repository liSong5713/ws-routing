import { SubscribeEvent } from '../../../../../src';

export class Subscribe {
  @SubscribeEvent('error')
  handleError(...args) {
    console.log('error');
  }
  @SubscribeEvent('wss:connection')
  handleWssConnection(...args) {
    console.log('connection1');
  }
  @SubscribeEvent('wss:connection')
  handleWss2Connection(...args) {
    console.log('connection2');
  }
  @SubscribeEvent('ws:close')
  handleWSClose(...args) {
    console.log('ws:close');
  }
  @SubscribeEvent('ws:error')
  handleWSError(...args) {
    console.log('ws:error');
  }
}
