import * as http from "http";

/**
 * Unwrap union type of T and undefined
 * @param value
 */
function unwrapUndefined<T>(value: T | undefined): T {
  return value as T;
}

type ReqRes = {req: http.IncomingMessage, res: http.ServerResponse};
type ReqResOrError =
  {
    kind: "REQ_RES",
    req: http.IncomingMessage,
    res: http.ServerResponse
  } |
  {
    kind: "ERROR",
    error: Error
  };

export class PromiseHttpServer {
  private resolveAndRejectQueue: ({resolve: (reqRes: ReqRes) => void, reject: (err: Error) => void})[] = [];
  private reqResOrErrorQueue: ReqResOrError[] = [];

  readonly server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse)=>{
    if(this.resolveAndRejectQueue.length === 0) {
      // Push request and response
      this.reqResOrErrorQueue.push({
        kind: "REQ_RES",
        req: req,
        res: res
      });
    } else {
      // Get the first resolve and reject functions
      const resolveAndReject: {resolve: (reqRes: ReqRes) => void, reject: (err: Error) => void}
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
      const resolveAndReject: {resolve: (reqRes: ReqRes) => void, reject: (err: Error) => void}
        = unwrapUndefined(this.resolveAndRejectQueue.shift());
      // Resolve
      resolveAndReject.reject(err);
    }
  });

  /**
   * Wait for request and response
   */
  accept(): Promise<ReqRes> {
    return new Promise<ReqRes>(((resolve, reject) => {
      if(this.reqResOrErrorQueue.length === 0) {
        // Append resolver
        this.resolveAndRejectQueue.push({
          resolve: resolve,
          reject: reject
        });
      } else {
        // Get the first request and response
        const reqResOrError: ReqResOrError = unwrapUndefined(this.reqResOrErrorQueue.shift());
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
      this.server.close(resolve);
    });
  }
}
