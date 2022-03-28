export class UnauthorizedError {
  code = '401';
  name = 'UnauthorizedError';
  message?: string;
  constructor(message?: string) {
    this.message = message;
  }
}
