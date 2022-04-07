export class Response {
  size?: number;
  result?: Promise<PromiseSettledResult<boolean | Error>[]>;
  body?: any;
}
