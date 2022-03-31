import { Service as collect } from 'typedi';
import { getMetadataStorage } from '../builder';
import { EventMetadata } from './../metadata/Event';

type EventName = 'error' | 'connection' | 'close' | 'open' | 'ping';

export function SubscribeEvent(eventName: EventName) {
  return function (target, key, descriptor) {
    const { events } = getMetadataStorage();
    const em = new EventMetadata();
    em.target = target;
    em.id = key;
    em.eventName = eventName;
    events.push(em);
    collect()(target.constructor);
    return descriptor;
  };
}
