# promise-http-server
[![npm](https://img.shields.io/npm/v/promise-http-server.svg)](https://www.npmjs.com/package/promise-http-server)
 [![Build Status](https://travis-ci.com/nwtgck/promise-http-server-npm.svg?token=TuxNpqznwwyy7hyJwBVm&branch=develop)](https://travis-ci.com/nwtgck/promise-http-server-npm)

Promise-based HTTP server

## Install

```
npm i -S promise-http-server
```

## Create a server

Although this project is written in TypeScript, **you can also use JavaScript**.  
Here is a simple HTTP server written in JavaScript.

```js
// JavaScript
const {PromiseHttpServer} = require("promise-http-server");

(async ()=>{
  const promiseServer = new PromiseHttpServer();
  const port = 8899;
  // Listen on the port
  await promiseServer.listen(port);
  console.log(`Listening on ${port}...`);

  while(true) {
    try {
      // Wait for request
      const {req, res} = await promiseServer.accept();
      // Write request path and end
      res.end(`<h1>Your path: ${req.url}</h1>\n`);
    } catch (err) {
      // Print error
      console.error(`on-error: ${err}`);
    }
  }
})();
```

## Pure objects in `http` module

`req` and `res` above are pure Node.js object in [`http` module](https://nodejs.org/api/http.html).
`promiseServer.server` is also pure Node.js object.

Here are the types of those objects.
* `req`: [http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
* `res`: [http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)
* `promiseServer.server`: [http.Server](https://nodejs.org/api/http.html#http_class_http_server)


Pure objects allow you to create a server in your familiar way.

## HTTP, HTTPS, HTTP/2, Secure HTTP/2

Here are classes to handle HTTP-related protocols.

|                |                            |
|----------------|----------------------------|
| HTTP           | `PromiseHttpServer`        |
| HTTPS          | `PromiseHttpsServer`       |
| HTTP/2         | `PromiseHttp2Server`       |
| Secure HTTP/2  | `PromiseHttp2SecureServer` |
