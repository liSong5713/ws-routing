import 'reflect-metadata';
import { Constructable, Container, Inject, Service } from 'typedi';

function Agent() {
  return function (object: Constructable<Object>, propertyName: string, index?: number) {
    Container.registerHandler({ object, value: (containerInstance) => {} });
  };
}

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleClass {
  @Inject()
  withDecorator: InjectedExampleClass;

  withoutDecorator: InjectedExampleClass;
}

const instance = Container.get(ExampleClass);
const instance2 = Container.get(ExampleClass);

instance.withDecorator.print();
