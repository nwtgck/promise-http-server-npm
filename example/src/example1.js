// Import "promise-http-server"
const {PromiseHttpServer} = require("promise-http-server");

(async ()=>{
  // Create promise-based HTTP server
  const promiseServer = new PromiseHttpServer();
  // Listen on port 8899
  promiseServer.server.listen(8899);

  while(true) {
    // Wait for request
    const {req, res} = await promiseServer.accept();
    // Write request path and end
    res.end(`<h1>Your path: ${req.url}</h1>\n`);
  }
})();

