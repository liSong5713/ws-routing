export class InternalServerError {
  code = '500';
  name = 'InternalServerError';
  message: string;
  stack: string | undefined;
  constructor(error: Error) {
    this.message = error.message;
    this.stack = error.stack;
  }
}
