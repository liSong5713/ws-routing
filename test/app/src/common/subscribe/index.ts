import { SubscribeEvent } from '../../../../../src';

export class Subscribe {
  @SubscribeEvent('error')
  handleError(...args) {
    console.log('error');
  }
  @SubscribeEvent('connection')
  handleWssConnection(...args) {
    console.log('connection1');
  }
  @SubscribeEvent('connection')
  handleWss2Connection(...args) {
    console.log('connection2');
  }
}
