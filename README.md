# ws-routing

基于 [ws](https://github.com/websockets/ws#simple-server) ，通过声明的方式创建控制类并处理 websocket 请求。

![20220402161833-ws-routing-arch.png](http://m.elongstatic.com/hotel/one/ws-routing-arch.png)

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [更多用法](#更多用法)
  - [配置目录加载控制器](#配置目录加载控制器)
  - [指定路由器前缀](#指定路由器前缀)
  - [注入请求参数](#注入请求参数)
  - [使用中间件](#使用中间件)
  - [使用订阅器](#使用订阅器)
- [装饰器参考](#装饰器参考)
- [完整示例](https://github.com/liSong5713/ws-routing/tree/master/test)

## 安装

```shell
npm i ws-routing --save
```

#### 必要条件

tsconfig.json` 中需要设置以下配置项：

```json
{
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

## 快速开始

1.新建文件`hotels/index.ts`

```js
import { Controller, Route, Ctx, Body, Context } from 'ws-routing';

@Controller('hotel')
export class HotelController {
  @Route('query')
  queryHotel(@Ctx() ctx: Context, @Body() body: string) {
    ctx.send(body);
  }
}
```

该类将在`websocket`中自动注册路由被`Route`装饰的路由

2.新建文件`app.ts`

```js
import { WsRouting } from 'ws-routing';
import path from 'path';

const wr = new WsRouting({
  controller: path.join(process.cwd(), 'controllers'),
  common: [path.join(process.cwd(), './common')],
  ws: { port: 8080 },
});
```

## 更多用法
#### 配置目录加载控制器

在`controller`或`common `配置指定文件夹，则按照`xx/**/*.{ts,js}`可加载该目录下所有控制器：

```ts
import { WsRouting } from 'ws-routing';

const wr = new WsRouting({
  controller: [path.join(process.cwd(), './controller')], //控制器
  common: [path.join(process.cwd(), './common')], //中间件、订阅器类
  ws: { port: 8080 },
});
```

#### 指定路由器前缀

向控制器装饰器传递根路由参数，控制器下的路由将添加该跟路由前缀：

```ts
@Controller('/user')
export class Controller {
  // ...
}
```

#### 注入请求参数

目前只支持`@Ctx()`,`@Body()`两个参数装饰器

```ts
  @Route('query')
  queryHotel(@Ctx() ctx: Context, @Body() body:string) {

  }
```

####

#### 使用中间件

在`common`目录下新建`middleware.ts`，注册前置和后置中间件并通过`order`调节执行顺序

```ts
@Middleware({ type: 'before', order: 1 })
class BeforeMiddle implements MiddlewareInterface {
  use(ctx: Context, next) {
    console.log('before middleware 2 process');
    return next();
  }
}
@Middleware({ type: 'after' })
class AfterMiddle implements MiddlewareInterface {
  use(ctx: Context, next: () => Promise<any>): Promise<any> {
    console.log('after middleware process');
    return next();
  }
}
```

#### 使用订阅器

在`common`目录下新建`subscribe.ts`，通过`@Subscribe()`注册订阅类并通过`@Event(name:string)`注册订阅方法

```ts
@Subscribe()
export class SubscribeCenter {
  @Event('error')
  handleError(...args) {
    console.log('error');
  }
  @Event('wss:connection')
  handleWssConnection(...args) {
    console.log('wss:connection1');
  }
  @Event('ws:close')
  handleWSClose(...args) {
    console.log('ws:close');
  }
  @Event('ws:error')
  handleWSError(...args) {
    console.log('ws:error');
  }
}
```

## 装饰器参考

#### 类-装饰器

| 名称                             | 例子                                                            | 描述                                                                                               |
| -------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `@Controller(baseRoute: string)` | ` @Controller("/users")``class SomeController `                 | 被装饰的类将注册为控制层，该类下被装饰的函数将注册为路由。baseRoute 将作为该控制器所有路由的前缀。 |
| `@Service()`                     | `@Service()`       <br/>`class SomeService`                     | 被装饰的类将注册为业务层，该类将向控制层提供复杂逻辑处理。                                         |
| `@Agent()`                       | `@Agent()`           <br/> `class SomeAgent`                    | 被装饰的类将注册为数据代理层，该类将向业务逻辑层提供数据代理服务。                                 |
| `@Subscribe()`                   | `@Subscribe()`<br/>`class SomeSubscribe`                        | 被装饰的类将注册为订阅层，该类将监听 ws-routing 触发的事件。                                       |
| `@Middleware(options)`           | `@Middleware({type:'before',order:1})`<br/>Class SomeMiddleware | 被装饰的类将注册为中间件，该类需要实现`use`方法                                                    |

#### 类属性-装饰器

| 名称                       | 例子                                                 | 描述                                              |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| `@Route(route:string)`     | ` @Route("/users")``<br/> queryUsers() `             | 被装饰的函数将注册一个请求到给定路由。            |
| `@Event(eventname:string)` | `@Event("wss:connection") createConnection(...args)` | 被装饰的函数将订阅一个 `wss:connection`  的事件。 |
| `@Inject()`                | `@Inject()`<br/> `myservice:MyService`               | 被装饰的属性将引用到元信息中的类的实例。          |

#### 类方法参数-装饰器

| 名称     | 例子                               | 描述                          |
| -------- | ---------------------------------- | ----------------------------- |
| `@Ctx()` | `queryUsers(@Ctx() ctx: Context)`  | 注入请求上下文 Context 对象。 |
| `@Body`  | `queryUsers(@Body() body: string)` | 注入请求消息体内容。          |
