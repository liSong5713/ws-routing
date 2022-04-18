import { Cookies } from './lib/cookies';
import { Response } from './response';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

const userStorageSymbol = Symbol('__user_storage__');
export class Context {
  cookies: Cookies;

  status: number = 404;

  // per message route
  route: string;

  // per message body
  body: any;

  // per message size
  size: number = 0;

  response = new Response();

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
    this.cookies = new Cookies(req);
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
      mask?: boolean;
      binary?: boolean;
      compress?: boolean;
      fin?: boolean;
    },
  );
  send(...args): Promise<boolean | Error> {
    const { response } = this;
    const promiseResult = new Promise<boolean | Error>((resolve, reject) => {
      if (!args.length) return reject(new Error(`message not be undefined`));
      response.body = args[0];
      const callback = (err) => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      };
      args.push(callback);
      const dataType = typeof args[0];
      if (dataType === 'string') {
        response.size = Buffer.byteLength(args[0]);
        // @ts-ignore
        return this.ws.send(...args);
      }
      if (Buffer.isBuffer(args[0])) {
        response.size = args[0].length;
        // @ts-ignore
        return this.ws.send(...args);
      }
      if (args[0] !== undefined) {
        args[0] = JSON.stringify(args[0]);
        response.size = Buffer.byteLength(args[0]);
        // @ts-ignore
        return this.ws.send(...args);
      }
    });
    response.result = Promise.allSettled([promiseResult]);
    return promiseResult;
  }
  // broadcast to all clients
  broadcast(data: any): Promise<PromiseSettledResult<boolean | Error>[]> {
    try {
      if (data === undefined) return Promise.allSettled([Promise.reject(new Error(`message not be undefined`))]);
      if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
        data = JSON.stringify(data);
      }
      const { response } = this;
      response.size = Buffer.byteLength(data);
      response.body = data;
      const sendMsgPromiseList = Array.from(this.wss.clients).map(
        (client) =>
          new Promise<boolean | Error>((resolve, reject) => {
            client.send(data, (error) => {
              if (error) return reject(error);
              resolve(true);
            });
          }),
      );
      return (response.result = Promise.allSettled(sendMsgPromiseList));
    } catch (error) {
      return (this.response.result = Promise.allSettled([Promise.reject(error)]));
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
