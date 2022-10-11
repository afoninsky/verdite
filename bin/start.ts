import { Interceptor } from "../src";

const server = new Interceptor({
  port: process.env.PROXY_HTTP_PORT || "8080",
});
server.addRule("../rules/alertapi");
server.addRule("../rules/last");

server.start();

// resolve(process.cwd(), process.env.PROXY_RULES_GLOB || "./rules/*.ts")
