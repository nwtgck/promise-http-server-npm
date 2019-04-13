import * as http from "http";
import * as https from "https";
import * as http2 from "http2";
import * as net from "net";

/**
 * Unwrap union type of T and undefined
 * @param value
 */
function unwrapUndefined<T>(value: T | undefined): T {
  return value as T;
}

type ReqResOrError<Req, Res> =
  {
    kind: "REQ_RES",
    req: Req,
    res: Res
  } |
  {
    kind: "ERROR",
    error: Error
  };


/**
 * Base Promise HTTPX server
 */
export abstract class BasePromiseHttpServer<Req extends (http.IncomingMessage | http2.Http2ServerRequest), Res extends (http.ServerResponse | http2.Http2ServerResponse), Server extends net.Server> {
  private resolveAndRejectQueue: ({resolve: (reqRes: {req: Req, res: Res}) => void, reject: (err: Error) => void})[] = [];
  private reqResOrErrorQueue: ReqResOrError<Req, Res>[] = [];

  abstract createServer(handler: (req: Req, res: Res) => void): Server

  readonly server: Server = this.createServer((req: Req, res: Res)=>{
    if(this.resolveAndRejectQueue.length === 0) {
      // Push request and response
      this.reqResOrErrorQueue.push({
        kind: "REQ_RES",
        req: req,
        res: res
      });
    } else {
      // Get the first resolve and reject functions
      const resolveAndReject: {resolve: (reqRes: {req: Req, res: Res}) => void, reject: (err: Error) => void}
        = unwrapUndefined(this.resolveAndRejectQueue.shift());
      // Resolve
      resolveAndReject.resolve({
        req: req,
        res: res
      })
    }
  }).on('error', (err) => {
    if(this.resolveAndRejectQueue.length === 0) {
      // Push error
      this.reqResOrErrorQueue.push({
        kind: "ERROR",
        error: err
      });
    } else {
      // Get the first resolve and reject functions
      const resolveAndReject: {resolve: (reqRes: {req: Req, res: Res}) => void, reject: (err: Error) => void}
        = unwrapUndefined(this.resolveAndRejectQueue.shift());
      // Resolve
      resolveAndReject.reject(err);
    }
  });

  /**
   * Wait for request and response
   */
  accept(): Promise<{req: Req, res: Res}> {
    return new Promise<{req: Req, res: Res}>(((resolve, reject) => {
      if(this.reqResOrErrorQueue.length === 0) {
        // Append resolver
        this.resolveAndRejectQueue.push({
          resolve: resolve,
          reject: reject
        });
      } else {
        // Get the first request and response
        const reqResOrError: ReqResOrError<Req, Res> = unwrapUndefined(this.reqResOrErrorQueue.shift());
        switch (reqResOrError.kind) {
          case "REQ_RES":
            // Resolve by the request and response
            resolve({
              req: reqResOrError.req,
              res: reqResOrError.res
            });
            break;
          case "ERROR":
            // Reject by error
            reject(reqResOrError.error);
            break;
        }
      }
    }));
  }

  /**
   * Listen on the specific port
   * @param port
   */
  listen(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, resolve);
    });
  }

  /**
   * Close the server
   */
  close(): Promise<void> {
    return new Promise<void>((resolve)=>{
      this.server.close(()=>resolve());
    });
  }
}

/**
 * Promise HTTP server
 */
export class PromiseHttpServer extends BasePromiseHttpServer<http.IncomingMessage, http.ServerResponse, http.Server> {
  createServer(handler: (req: http.IncomingMessage, res: http.ServerResponse) => void): http.Server {
    return http.createServer(handler);
  }
}

/**
 * Promise HTTPS server
 */
export class PromiseHttpsServer extends BasePromiseHttpServer<http.IncomingMessage, http.ServerResponse, https.Server> {
  constructor(readonly options: https.ServerOptions) {
    super();
  }
  createServer(handler: (req: http.IncomingMessage, res: http.ServerResponse) => void): https.Server {
    return https.createServer(this.options, handler);
  }
}

/**
 * Promise HTTP2 server
 */
export class PromiseHttp2Server extends BasePromiseHttpServer<http2.Http2ServerRequest, http2.Http2ServerResponse, http2.Http2Server> {
  createServer(handler: (req: http2.Http2ServerRequest, res: http2.Http2ServerResponse) => void): http2.Http2Server {
    return http2.createServer(handler);
  }
}


/**
 * Promise HTTP2 Secure server
 */
export class PromiseHttp2SecureServer extends BasePromiseHttpServer<http2.Http2ServerRequest, http2.Http2ServerResponse, http2.Http2SecureServer> {
  constructor(readonly options: http2.SecureServerOptions) {
    super();
  }
  createServer(handler: (req: http2.Http2ServerRequest, res: http2.Http2ServerResponse) => void): http2.Http2SecureServer {
    return http2.createSecureServer(this.options, handler);
  }
}
