import { WsRouting } from '../../../src';
import path from 'path';
import { createServer } from 'http';
const server = createServer();
server.listen(8080);
const wr = new WsRouting({
  controller: [path.join(process.cwd(), './test/app/src/controller')],
  common: [path.join(process.cwd(), './test/app/src/common')],
  ws: { server },
});
/* wr.on('error', (error) => {
  console.error(error);
});
wr.on('connection', (...args) => {
  // 创建连接
  console.log('connection');
});
wr.on('close', (...args) => {
  console.log('close');
});

wr.on('open', (...args) => {
  console.log('open');
});
wr.on('ping', (...args) => {
  console.log('ping');
}); */
// wr.listen(8080);
