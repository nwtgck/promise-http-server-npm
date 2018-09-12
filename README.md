# promise-http-server
[![npm](https://img.shields.io/npm/v/promise-http-server.svg)](https://www.npmjs.com/package/promise-http-server)
 [![Build Status](https://travis-ci.com/nwtgck/promise-http-server-npm.svg?token=TuxNpqznwwyy7hyJwBVm&branch=develop)](https://travis-ci.com/nwtgck/promise-http-server-npm) [![Greenkeeper badge](https://badges.greenkeeper.io/nwtgck/promise-http-server-npm.svg?token=b9adcffa0bb1bc9b8cbfde2c9781d4cc00cdb5f7035552c84a0aabb0c7a44987&ts=1536742116756)](https://greenkeeper.io/)

Promise-based HTTP server

## Create a server

Here is a simple HTTP server written in JavaScript.

```js
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

`req` and `res` in the example are pure request and response used in `http.createServer()` callback. You can also get a pure HTTP server object by  `promiseServer.server`.
