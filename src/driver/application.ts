import { Action } from './../metadatas/action';
import { createServer } from 'http';
import { WebSocketServer, ServerOptions } from 'ws';
import { EventEmitter } from 'events';
import { routes } from '../routing/metadata';
import Context from './context';

export default class Application extends EventEmitter {
  wsOptions?: ServerOptions;
  constructor(options?: ServerOptions) {
    super();
    this.wsOptions = options;
  }
  listen(port: number) {
    const wss = new WebSocketServer(Object.assign(this.wsOptions || {}, { noServer: true }));
    const server = createServer();
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
      const ctx = new Context(wss, ws, request);
      ws.on('message', function message(data, isBinary) {
        try {
          // TODO 可执行参数
          const { route, message } = JSON.parse(data.toString());
          const action: Action = {
            ctx,
            message,
          };
          routes.get(route)(action);
        } catch (error) {
          console.error(error);
          // send error body
        }
      });
    });

    server.on('upgrade', function upgrade(request, socket, head) {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    });
    server.listen(port);
  }
}
