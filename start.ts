import { resolve } from "path";
import { sync as globSync } from "glob";
const { PROXY_HTTP_PORT, PROXY_RULES } = process.env;

import { Interceptor } from "./src";

const server = new Interceptor({
  port: PROXY_HTTP_PORT || "8080",
});

if (!PROXY_RULES) {
  console.log("ERROR: environment variable PROXY_RULES is empty");
  process.exit(1);
}
const proxyRulesFolder = resolve(process.cwd(), PROXY_RULES);
console.log("Loading rules from:", proxyRulesFolder);
const rules = globSync(proxyRulesFolder);
for (const rule of rules) {
  server.addRule(rule);
}

server.start();
