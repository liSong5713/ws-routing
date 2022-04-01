import { Service as collect, Constructable } from 'typedi';

// register event class
export function Subscribe() {
  return function (target: Constructable<object>) {
    collect()(target);
  };
}
