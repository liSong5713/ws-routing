import { Subscribe, Event } from '../../../../../src';

@Subscribe()
export class SubscribeCenter {
  @Event('error')
  handleError(...args) {
    console.log('error');
  }
  @Event('wss:connection')
  handleWssConnection(...args) {
    console.log('wss:connection1');
  }
  @Event('wss:connection')
  handleWss2Connection(...args) {
    console.log('connection2');
  }
  @Event('ws:close')
  handleWSClose(...args) {
    console.log('ws:close');
  }
  @Event('ws:error')
  handleWSError(...args) {
    console.log('ws:error');
  }
}
