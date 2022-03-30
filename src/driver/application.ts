import { createServer } from 'http';
import { WebSocketServer, ServerOptions } from 'ws';
import { EventEmitter } from 'events';
import Context from './context';

export class Application extends EventEmitter {
  wsOptions?: ServerOptions;
  wss: WebSocketServer;
  constructor(options?: ServerOptions) {
    super();
    const self = this;
    this.wsOptions = options;
    const wss = (this.wss = new WebSocketServer(Object.assign(this.wsOptions || {}, { noServer: true })));
    if (this.listenerCount('error')) {
      this.on('error', console.error);
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
  listen(port: number) {
    const that = this;
    const server = createServer();
    server.on('upgrade', function upgrade(request, socket, head) {
      that.wss.handleUpgrade(request, socket, head, function done(ws) {
        that.wss.emit('connection', ws, request);
      });
    });
    server.listen(port);
  }
}
