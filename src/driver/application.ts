import { WebSocketServer, ServerOptions } from 'ws';
import { EventEmitter } from 'events';
import { Context } from './context';

export class Application extends EventEmitter {
  wss: WebSocketServer;
  constructor(options?: ServerOptions) {
    super();
    const { noServer, server } = options || {};
    const self = this;
    const wss = (this.wss = new WebSocketServer(options));
    if (this.listenerCount('error')) {
      this.on('error', console.error);
    }
    if (noServer && server) {
      server.on('upgrade', function upgrade(request, socket, head) {
        self.wss.handleUpgrade(request, socket, head, function done(ws) {
          self.wss.emit('connection', ws, request);
        });
      });
    }
    const proxyFn = function proxyFn(eventName) {
      return function (...args) {
        self.emit(eventName, ...args);
      };
    };
    wss.on('ping', proxyFn('ping'));
    wss.on('error', proxyFn('error'));
    wss.on('close', proxyFn('close'));
    wss.on('connection', (ws, request) => {
      this.emit('connection', ws, request);
      ws.on('message', function message(data, isBinary) {
        const ctx = new Context(wss, ws, request);
        const originMessage = data.toString();
        try {
          const { route, message } = JSON.parse(originMessage);
          ctx.body = message;
          ctx.route = route;
        } catch (error) {
          // Non-standard message
          ctx.body = originMessage;
        }
        self.handlePerMessage(ctx);
      });
    });
  }
  handlePerMessage(ctx: Context) {
    // override by routing
  }
}
