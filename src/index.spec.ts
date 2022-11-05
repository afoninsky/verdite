import { Interceptor, Request, Response } from ".";
import http from "http";
import { expect } from "chai";
import axios from "axios";

const httpPort = 9999;
const proxyPort = 9998;

axios.defaults.baseURL = `http://localhost:${httpPort}`;
axios.defaults.proxy = {
  protocol: "http",
  host: "localhost",
  port: proxyPort,
};

class TestRule {
  async beforeSendRequest(req: Request): Promise<Request> {
    req.requestOptions.headers = req.requestOptions.headers || {};
    req.requestOptions.headers["x-request-modified"] = "true";
    return req;
  }
  async beforeSendResponse(req: Request, res: Response): Promise<Response> {
    res.header["x-response-modified"] = "true";
    return res;
  }
}

describe("core functionality", () => {
  let server: any;
  let proxy: Interceptor;

  before("start server", () => {
    server = http.createServer((req, res) => {
      const data = {
        url: req.url,
        method: req.method,
        headers: req.headers,
      };

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(data));
    });
    server.listen(httpPort);
  });

  before("start proxy", async () => {
    proxy = new Interceptor({
      port: proxyPort,
    });
    const rule = new TestRule();
    proxy.addRule(rule);
    await proxy.start();
  });

  it("modify request and response", async () => {
    const body = { json: true };
    const { data, headers } = await axios.post("/test", body);
    expect(headers["x-response-modified"]).equal("true");
    expect(data.url).equal("/test");
    expect(data.headers["x-request-modified"]).equal("true");
  });

  it.skip("serves local requests");

  after("stop server", (done) => server.close(done));
  after("stop proxy", async () => proxy.close());
});
