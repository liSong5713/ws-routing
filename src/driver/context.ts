import { IncomingMessage } from 'http';
import { URL } from 'url';
import WebSocket from 'ws';

export default class Context {
  // === http ===
  constructor(public wss: WebSocket.Server, public ws: WebSocket.WebSocket, public req: IncomingMessage) {}
  get socket() {
    return this.req.socket;
  }
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
  send(data: any, cb?: (err?: Error) => void): void;
  send(
    data: any,
    options: {
      mask?: boolean | undefined;
      binary?: boolean | undefined;
      compress?: boolean | undefined;
      fin?: boolean | undefined;
    },
    cb?: (err?: Error) => void,
  ): void;
  send(...args) {
    // @ts-ignore
    this.ws.send(...args);
  }
  // broadcast to all clients
  broadcast(data: any) {
    // TODO test
    if (!data) return;
    for (const client of this.wss.clients) {
      client.send(data);
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
