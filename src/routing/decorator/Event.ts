import { DefaultEvents, WSSEvents, WSEvents } from '../metadata/types/Events';
import { getMetadataStorage } from '../builder';
import { EventMetadata } from '../metadata/Event';

// register event class method
export function Event(eventName: DefaultEvents | WSSEvents | WSEvents) {
  return function (target, key, descriptor) {
    const { events } = getMetadataStorage();
    const em = new EventMetadata();
    em.target = target;
    em.id = key;
    em.eventName = eventName;
    events.push(em);
    return descriptor;
  };
}
