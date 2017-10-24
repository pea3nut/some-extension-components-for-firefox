# Chaz.js

A communication library for WebExtensions.

English document is [here](./README-English.md).

# Chaz.js 可以做什么？

Chaz.js是为[WebExtensions](https://developer.mozilla.org/zh-CN/Add-ons/WebExtensions)打造的通信库，可以极大的简化WebExtensions不同类型的脚本传递消息。

目前支持的类型脚本有：content script、background script、 privileged scripts（如 popup scripts 、page scripts）

Chaz.js为上述脚本提供统一的发送接口，比如：

```js
// background.js

const Content =new Chaz('background','content');
Content.on('hello',function(data ,sender ,callback){
    console.log(`background.js: receive content.js's hello "${data}"`);
});
```

```js
// content.js

const Background =new Chaz('content','background');
Background.send('hello','hello background.js, this is content.js');
```

详细的使用可以参考项目中`background.js`、`content.js`、`popup.js`文件。

需要额外注意的是，若想要content与popup通信，你必须在background中实例化一个Chaz实例，哪怕不传入第二个参数：

```js
// background.js
new Chaz('background');
```

# APIs

## Chaz#constructor(selfType,targetType)

- selfType：当前运行的脚本类型
- targetType：想与之通信的脚本类型

## Chaz#on(type ,listener)

- type：监听的事件类型
- listener：监听器

当事件发生，监听器将会被传入：

- data：被发送的数据
- sender：有关发送方的信息
- callback：响应这个事件并返回值

### callback

A function to call, at most once, to send a response to the message. The function takes a single argument, which may be any JSON-ifiable object. This argument is passed back to the message sender.

If you have more than one onMessage listener in the same document, then only one may send a response.

To send a response synchronously, call sendResponse before the listener function returns. To send a response asynchronously:


- either keep a reference to the sendResponse argument and return true from the listener function. You will then be able to call sendResponse after the listener function has returned.
- or return a Promise from the listener function and resolve the promise when the response is ready.

## Chaz#send(eventType ,data ,tabId=null)

- eventType：发送的事件类型
- data：发送的消息

该方法返回一个Promise对象，对应`Chaz#on`的callback
