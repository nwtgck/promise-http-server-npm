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

