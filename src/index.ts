import {
  ProxyServer,
  RuleModule,
  RequestDetail,
  ResponseDetail,
} from "anyproxy";
import { resolve } from "path";
import { existsSync } from "fs";
import { sortByPriority, errorResponse } from "./helpers";
import { InterceptorOptions, Rule, Request, Response } from "./interface";

export { Request, Response, Rule, InterceptorOptions };

const configDefaults = {
  port: 8080,
};

export class Interceptor {
  private config: InterceptorOptions;
  private rules: Rule[] = [];
  private proxy!: ProxyServer;

  constructor(userConfig?: InterceptorOptions) {
    this.config = Object.assign({}, configDefaults, userConfig);
  }

  // load rule for interceptor
  addRule(rule: string | Rule) {
    // rule is already loaded module
    if (typeof rule !== "string") {
      return this.rules.push(rule);
    }
    // load rule from file or npm module
    const path = resolve(process.cwd(), rule);
    const loadedRule = existsSync(path) ? require(path) : require(rule);
    this.rules.push(loadedRule);
  }

  async start(): Promise<void> {
    this.rules.sort(sortByPriority);

    for (const rule of this.rules) {
      if (rule.onStart) {
        await rule.onStart();
      }
    }

    this.proxy = new ProxyServer({
      port: this.config.port,
      forceProxyHttps: true,
      silent: true,
      dangerouslyIgnoreUnauthorized: true,
      rule: this.createRulesWrapper(),
    });
    return new Promise((resolve) => {
      this.proxy.on("ready", () => resolve());
      this.proxy.start();
    });
  }

  async close(): Promise<void> {
    return this.proxy.close();
  }

  // create a generic wrapper compatible with AnyProxy format
  // following methods can be used in rules:
  // - http://anyproxy.io/en/#beforesendrequest
  // - http://anyproxy.io/en/#beforesendresponse
  private createRulesWrapper(): RuleModule {
    const self = this;
    return {
      beforeSendRequest(proxyReq: RequestDetail): Promise<any> {
        return new Promise(async (resolve) => {
          const { protocol, url, requestOptions, requestData } = proxyReq;
          const request: Request = {
            protocol,
            url,
            requestOptions,
            requestData,
          };

          for (const rule of self.rules) {
            if (!rule.beforeSendRequest) {
              continue;
            }
            try {
              await rule.beforeSendRequest(request);
            } catch (err) {
              console.log(err); // TODO: better logging
              errorResponse(err);
            }
            // finish further processing if some rule already set response
            if (request.response) {
              break;
            }
          }
          Object.assign(proxyReq, request);
          resolve(proxyReq);
        });
      },
      beforeSendResponse(
        proxyReq: RequestDetail,
        proxyRes: ResponseDetail
      ): Promise<any> {
        return new Promise(async (resolve) => {
          const { protocol, url, requestOptions, requestData } = proxyReq;
          const request: Request = {
            protocol,
            url,
            requestOptions,
            requestData,
          };
          const { statusCode, header, body } = proxyRes.response;
          const response: Response = { statusCode, header, body };

          for (const rule of self.rules) {
            if (!rule.beforeSendResponse) {
              continue;
            }
            try {
              await rule.beforeSendResponse(request, response);
            } catch (err) {
              console.log(err);
              return resolve(errorResponse(err));
            }
          }
          Object.assign(proxyRes, { response });
          resolve(proxyRes);
        });
      },
    };
  }
}
