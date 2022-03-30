import { ServerOptions } from 'ws';

export type RoutingOptions = {
  middleware?: string | string[];
  controller?: string | string[];
  ws: ServerOptions;
};
