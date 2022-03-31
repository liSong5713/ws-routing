import { ServerOptions } from 'ws';

export type RoutingOptions = {
  // common directory will loaded auto by ws-routing
  common?: string | string[];
  controller?: string | string[];
  ws: ServerOptions;
};
