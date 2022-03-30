import { IncomingMessage } from 'http';
import { EventEmitter } from 'events';
import WebSocket from 'ws';

const userStorageSymbol = Symbol('__user_storage__');
export default class Context extends EventEmitter {
  route: string; //per message route

  body: any; //per message body

  private [userStorageSymbol] = new Map();

  setData(key: string, value: any) {
    this[userStorageSymbol].set(key, value);
  }
  getData(key: string) {
    return this[userStorageSymbol].get(key);
  }
  getAllData() {
    return Array.from(this[userStorageSymbol]);
  }
  // === http ===
  constructor(public wss: WebSocket.Server, public ws: WebSocket.WebSocket, public req: IncomingMessage) {
    super();
  }
  get socket() {
    return this.req.socket;
  }
  // request.url
  get path() {
    return this.req.url;
  }
  get origin() {
    return this.req.headers.origin;
  }
  get host() {
    return this.req.headers.host;
  }
  get header() {
    return this.req.headers;
  }
  get ip() {
    const { socket } = this.req;
    const proxyIps = (this.req.headers['X-Forwarded-For'] as string)?.split(/\s*,\s*/) || [];
    return proxyIps[0] || socket.remoteAddress;
  }

  //   ==== ws ===
  get clients() {
    return this.wss.clients;
  }
  /** Indicates whether the websocket is paused */
  get isPaused() {
    return this.ws.isPaused;
  }
  get protocol() {
    return this.ws.protocol;
  }
  /** The current state of the connection */
  get readyState() {
    return this.ws.readyState;
  }
  send(data: any): Promise<boolean | Error>;
  send(
    data: any,
    options: {
      mask?: boolean | undefined;
      binary?: boolean | undefined;
      compress?: boolean | undefined;
      fin?: boolean | undefined;
    },
  );
  send(...args): Promise<boolean | Error> {
    return new Promise((resolve, reject) => {
      if (!args.length) return reject(new Error(`message not be undefined`));
      const callback = (err) => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      };
      args.push(callback);
      const dataType = typeof args[0];
      if (dataType === 'string') {
        // @ts-ignore
        return this.ws.send(...args);
      }
      if (Buffer.isBuffer(args[0])) {
        // @ts-ignore
        return this.ws.send(...args);
      }
      if (args[0] !== undefined) {
        args[0] = JSON.stringify(args[0]);
        // @ts-ignore
        return this.ws.send(...args);
      }
    });
  }
  // broadcast to all clients
  broadcast(data: any): Promise<PromiseSettledResult<boolean>[]> {
    try {
      if (data === undefined) return Promise.allSettled([Promise.reject(new Error(`message not be undefined`))]);
      if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
        data = JSON.stringify(data);
      }
      const sendMsgPromiseList = Array.from(this.wss.clients).map(
        (client) =>
          new Promise((resolve, reject) => {
            client.send(data, (error) => {
              if (error) return reject(error);
              resolve(true);
            });
          }),
      );
      return Promise.allSettled(sendMsgPromiseList) as any;
    } catch (error) {
      return Promise.allSettled([Promise.reject(error)]);
    }
  }
  close(code?: number, data?: string | Buffer) {
    this.ws.close(code, data);
  }
  ping(data?: any, mask?: boolean, cb?: (err: Error) => void) {
    this.ws.ping(data, mask, cb);
  }
  pong(data?: any, mask?: boolean, cb?: (err: Error) => void) {
    this.ws.pong(data, mask, cb);
  }
  terminate() {
    this.ws.terminate();
  }

  /**
   * Pause the websocket causing it to stop emitting events. Some events can still be
   * emitted after this is called, until all buffered data is consumed. This method
   * is a noop if the ready state is `CONNECTING` or `CLOSED`.
   */
  pause() {
    this.ws.pause();
  }
  /**
   * Make a paused socket resume emitting events. This method is a noop if the ready
   * state is `CONNECTING` or `CLOSED`.
   */
  resume() {
    this.ws.resume();
  }
}
