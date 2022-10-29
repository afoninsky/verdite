import { Interceptor } from "..";
import http from "http";
import { expect } from "chai";

const message = "Hello, World!";
const httpPort = 9999;
const proxyPort = 9998;
const proxyURL = "http://localhost:${proxyPort}";

describe("ensures Verdite core works", () => {
  let server: any;
  let proxy: Interceptor;

  before("start server", () => {
    server = http.createServer((req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify({ message }));
    });
    server.listen(httpPort);
  });

  before("start proxy", async () => {
    proxy = new Interceptor({
      port: proxyPort,
    });
    await proxy.start();
  });

  it("intercepts requests", async () => {
    // TODO: send http request
    // https://stackoverflow.com/questions/3862813/how-can-i-use-an-http-proxy-with-node-js-http-client
  });
  it("intercept responses", function () {});
  it("acts as http server", function () {});

  after("stop server", (done) => server.close(done));
  after("stop proxy", async () => proxy.close());
});
