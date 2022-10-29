const { PROXY_HTTP_PORT = "8080", PROXY_RULES = "" } = process.env;

import { Interceptor } from ".";

const server = new Interceptor({
  port: PROXY_HTTP_PORT,
});

PROXY_RULES.split(",")
  .map((rule) => rule.trim())
  .filter((rule) => !!rule)
  .forEach((rule) => {
    console.log("Loading rule:", rule);
    server.addRule(rule);
  });

server.start().then(() => {
  console.log("Proxy server started on port", PROXY_HTTP_PORT);
});
