# Create a Server Sent Event Service using Node.js

SSE (server-sent events) example using Node.js

[SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) is a easy way to commutate with the client side in a single direction. it has loss cost and efficiency way compared to other protocols like Socket or polling query.

Here is a minium checklist to create a SSE service:

## Server Side

1. response three HTTP headers that tell the client that the response is a SSE stream:

   - Connection: keep-alive
   - Content-Type: text/event-stream
   - Cache-Control: no-cache

2. response data with `data` , `event` and `id` attributes

3. That's all

## Client Side

1. create a `EventSource` object

2. addEventListener to the `EventSource` object

3. That's all

---

There is a simple example to show how to create a SSE service using Node.js.

## Installation

Install dependencies before running example.

```bash
$ yarn
```

## Start

```bash
$ yarn start // start client
$ yarn run server // start server
```

After run command above, you can open `http://localhost:1234` see the result in the browser.

## Server

The server is a simple Node.js application that listens on port 3000. I create a Server Sent Event while sends data to the client interval in one second. Here is the core core of the server.

```javascript
ctx.set({
  // necessary HTTP Headers for server sent events
  Connection: "keep-alive",
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",

  // CORS settings
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
});

const pipe = new stream.PassThrough();
// normalize message without event name specified
pipe.write(`id: ${Math.random()}\ndata: hello from steam\n\n`);

const interval = setInterval(() => {
  // normalize message with event name(eg:currentTime) specified
  pipe.write(`id: ${Math.random()}\nevent: currentTime\ndata: ${new Date().toUTCString()}\n\n`);
}, 1000);

ctx.body = pipe;

// clear interval and destroy stream object while client disconnect
ctx.res.on("close", () => {
  clearInterval(interval);
  pipe.destroy();
});
```

## Client

In the client side, it's easy to create a event source to listen on the server. the `EventSource` object return a readable stream which you can addEventListener by `open`, `message` and `error` event. Also, you can create custom event listeners by `addEventListener` method. see example below:

```javascript
const source = new EventSource(API, {
  withCredentials: true,
});

source.addEventListener("open", (e: Event) => {
  console.log("event source is open");
});

// event name not specified, message is default
source.addEventListener("message", (e: MessageEvent) => {
  console.log("'message' event received:", e.data);
});

// event name(eg:currentTime) specified
source.addEventListener("currentTime", (e: any) => {
  console.log("'currentTime' event received:", e.data);
});

source.addEventListener("error", (e: Event) => {
  console.error("event source error", e);
  source.close();
});
```

## Related repository: [sse-example](https://github.com/chen86860/sse-example)

**Enjoy Hacking!**
