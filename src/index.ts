import { ProxyServer, RuleModule } from "anyproxy";
import { sortByPriority, errorResponse } from "./helpers";
import {
  InterceptorOptions,
  Rule,
  RequestDetail,
  ResponseDetail,
} from "./interface";

const configDefaults = {
  port: 8080,
};

export class Interceptor {
  private config: InterceptorOptions;
  private rules: Rule[];
  private proxy: ProxyServer;

  constructor(userConfig?: InterceptorOptions) {
    this.config = Object.assign({}, configDefaults, userConfig);
  }

  async addRule(path: string) {
    const rule = require(path);
    this.rules.push(rule);
  }

  async start() {
    this.rules.sort(sortByPriority);
    for (const rule of this.rules) {
      if (rule.onStart) {
        await rule.onStart();
      }
    }

    this.proxy = new ProxyServer({
      port: this.config.port,
      forceProxyHttps: true,
      dangerouslyIgnoreUnauthorized: true,
      rule: this.createRulesWrapper(),
    });
    this.proxy.start();
  }

  // create a generic wrapper compatible with AnyProxy format
  // following methods can be used in rules:
  // - http://anyproxy.io/en/#beforesendrequest
  // - http://anyproxy.io/en/#beforesendresponse
  private createRulesWrapper(): RuleModule {
    return {
      beforeSendRequest(req: RequestDetail | any): Promise<any> {
        return new Promise(async (resolve) => {
          for (const rule of this.rules) {
            if (!rule.beforeSendRequest) {
              continue;
            }
            try {
              await rule.beforeSendRequest(req);
            } catch (err) {
              console.log(err.message || err);
              errorResponse(err);
            }
            // finish further processing if some rule already set response
            if (req.response) {
              break;
            }
          }
          resolve(req);
        });
      },
      beforeSendResponse(
        req: RequestDetail,
        res: ResponseDetail
      ): Promise<any> {
        return new Promise(async (resolve) => {
          for (const rule of this.rules) {
            if (!rule.beforeSendResponse) {
              continue;
            }
            try {
              await rule.beforeSendResponse(req, res);
            } catch (err) {
              console.log(err.message || err);
              return resolve(errorResponse(err));
            }
          }
          resolve(res);
        });
      },
    };
  }
}
