// Import "promise-http-server"
const {PromiseHttpServer} = require("promise-http-server");

(async ()=>{
  // Create promise-based HTTP server
  const promiseServer = new PromiseHttpServer();
  const port = 8899;
  // Listen
  await promiseServer.listen(port);
  console.log(`Listening on ${port}...`);

  while(true) {
    // Wait for request
    const {req, res} = await promiseServer.accept();
    // Write request path and end
    res.end(`<h1>Your path: ${req.url}</h1>\n`);
  }
})();

