import { WsRouting } from '../../../src';
import path from 'path';

const wr = new WsRouting({
  controller: [path.join(process.cwd(), './test/app/src/controller')],
  common: [path.join(process.cwd(), './test/app/src/common')],
  ws: { port: 8080 },
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
