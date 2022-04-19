import { WebSocketServer, ServerOptions } from 'ws';
import { EventEmitter } from 'events';
import { Context } from './context';

export class Application extends EventEmitter {
  wss: WebSocketServer;
  constructor(options?: ServerOptions) {
    super();
    const self = this;
    const wss = (this.wss = new WebSocketServer(options));
    if (this.listenerCount('error')) {
      this.on('error', console.error);
    }
    wss.on('connection', (ws, request) => {
      ws.on('close', (...args) => {
        self.emit('ws:close', wss, ws, ...args);
      });
      ws.on('error', (...args) => {
        self.emit('ws:error', wss, ws, ...args);
      });
      ws.on('unexpected-response', (...args) => {
        self.emit('ws:unexpected-response', wss, ws, ...args);
      });
      ws.on('message', function message(data, isBinary) {
        const ctx = new Context(wss, ws, request);
        // @ts-ignore
        ctx.size = data.length || data.byteLength;
        ctx.originMessage = data.toString();
        try {
          const { route, message } = JSON.parse(ctx.originMessage);
          ctx.body = message;
          ctx.route = route;
        } catch (error) {
          // Non-standard message
        }
        self.handlePerMessage(ctx);
      });
    });
  }
  handlePerMessage(ctx: Context) {
    // override by routing
  }
}
