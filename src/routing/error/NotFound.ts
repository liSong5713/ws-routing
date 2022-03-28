export class NotFound {
  code = '404';
  name = 'MessageNotMatch';
  message?: string;
  constructor(message?: string) {
    this.message = message;
  }
}
