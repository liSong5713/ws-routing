import { WsRouting } from '../../../src';
import path from 'path';

const wr = new WsRouting({
  controller: [path.join(process.cwd(), './test/app/src/controller')],
  middleware: [path.join(process.cwd(), './test/app/src/middleware')],
  ws: { port: 8080 },
});
wr.on('error', (error) => {
  console.error(error);
});
// wr.listen(8080);
