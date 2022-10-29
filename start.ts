import { resolve } from "path";
const { PROXY_HTTP_PORT = "8080", PROXY_RULES = "" } = process.env;

process.chdir(process.cwd());

import { Interceptor } from "./src";

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

server.start();
