class RoutingTest {
  constructor() {
    this.createWsConnection();
    this.attachEvents();
    this.panel = document.querySelector('.message-box');
  }
  attachEvents() {
    const self = this;
    document.querySelector('#btn').onclick = function sendMsg() {
      self.sendMessage();
    };
  }
  createWsConnection() {
    this.ws = new WebSocket('ws://localhost:8080/usr/test');
    this.ws.addEventListener('message', (event) => {
      this.handlePerMessage(event.data);
    });
  }
  sendMessage() {
    const route = document.querySelector('.route-box').value;
    const content = document.querySelector('.input-box').value;
    if (/2|3/.test(this.ws.readyState)) {
      return alert('链接WS Server 失败');
    }
    if (!content) {
      return alert('请写点什么');
    }
    this.ws.send(JSON.stringify({ route: route, message: content }));
  }
  handlePerMessage(data) {
    const { time,title,originalMessage,tip } = JSON.parse(data);
    const div = document.createElement('div')
    div.textContent = `time:${time}  | tile:${title} | originalMessage: ${originalMessage} | tip: ${tip}`
    this.panel.appendChild(div);
  }
}

new RoutingTest();
