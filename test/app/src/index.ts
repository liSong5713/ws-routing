import { WsRouting } from '../../../src';
import path from 'path';
import { createServer } from 'http';


const server = createServer();
server.listen(8080);
const wr = new WsRouting({
  controller: [path.join(process.cwd(), './test/app/src/controller')],
  common: [path.join(process.cwd(), './test/app/src/common')],
  ws: { noServer: true },
});

server.on('upgrade', function upgrade(request, socket, head) {
  // TODO authorize 实现
  wr.wss.handleUpgrade(request, socket, head, function done(ws) {
    wr.wss.emit('connection', ws, request);
  });
});
/* wr.on('connection', (...args) => {
  // 创建连接
  console.log('wr.connection');
});

wr.on('error', (error) => {
  console.error(error);
});
 */