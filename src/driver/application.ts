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

    wss.on('headers', (...args) => {
      this.emit('headers', ...args);
    });
    wss.on('error', (error) => {
      this.emit('error', error);
    });
    wss.on('close', () => {
      this.emit('close');
    });
    wss.on('connection', (ws, request) => {
      this.emit('connection', ws, request);
      ws.on('message', function message(data, isBinary) {
        const { route, message } = JSON.parse(data.toString());
        const ctx = new Context(wss, ws, request);
        ctx.body = message;
        ctx.route = route;
        self.handlePerMessage(ctx);
      });
    });
  }
  handlePerMessage(ctx: Context) {
    // overwrite by customize
  }
}
