import { ParamMetadata } from './Param';

export class ExecutorMetadata {
  target: object;
  route: string;
  methodname: string;
  params: ParamMetadata[];
  ins: object;
}
