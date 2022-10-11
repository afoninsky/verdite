import { initRules } from "./loader";
import { createRulesWrapper } from "./interceptors";
import { resolve } from "path";
import { ProxyServer } from "anyproxy";

(async () => {
  const interceptors = await initRules(
    resolve(process.cwd(), process.env.PROXY_RULES_GLOB || "./rules/*.ts")
  );

  new ProxyServer({
    port: process.env.PROXY_HTTP_PORT || "8080",
    rule: createRulesWrapper(interceptors),
    webInterface: {
      enable: !!process.env.PROXY_ADMIN_PORT,
      webPort: parseInt(process.env.PROXY_ADMIN_PORT || "8081", 10),
    },
    dangerouslyIgnoreUnauthorized: true,
    forceProxyHttps: true,
  }).start();
})();
