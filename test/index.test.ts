import * as assert from 'power-assert';
import thenRequest from 'then-request';
import {PromiseHttpServer} from "../lib";
import * as http from "http";

/**
 * Request to body buffer
 * @param req
 */
export async function reqToBodyBuffer(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    // (from: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/)
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    }).on('end', () => {
      // Concat buffers
      const buff = Buffer.concat(chunks);
      resolve(buff);
    }).on('error', (err)=>{
      reject(err);
    });
  });
}

describe('PromiseHttpServer', () => {
  it('should have a request', async () => {
    assert.equal(1, 1);

    const promiseServer = new PromiseHttpServer();
    const promisePort: number = 8899;

    // Listen
    await promiseServer.listen(promisePort);

    const promiseUrl: string = `http://localhost:${promisePort}`;

    // Give a POST request
    thenRequest("POST", promiseUrl, {
      body: "this is a request"
    });

    // Wait for the request
    const {req, res} = await promiseServer.accept();
    res.end();

    // Get request body string
    const requestBodyStr: string = await reqToBodyBuffer(req)
      .then(b => b.toString("UTF-8"));

    // Request should be the same as given one
    assert.equal(requestBodyStr, "this is a request");

    // Close the server
    promiseServer.server.close();
  });
});
