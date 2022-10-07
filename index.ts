import * as glob from 'glob'
import { ProxyServer, RuleModule, RequestDetail, ResponseDetail, BeforeSendResponseResult } from 'anyproxy'

interface Rule {
  priority: number
  beforeSendRequest(requestDetail: RequestDetail): Promise<any>
  beforeSendResponse(requestDetail: RequestDetail, responseDetail: ResponseDetail): Promise<any>
}

// load interceptor modules sorted by { priority }
const interceptors: Rule[] = glob.sync(process.env.PROXY_RULES_GLOB || './rules/*.ts')
  .map(file => require(file))
  .sort((a: Rule, b: Rule) => {
    if (a.priority > b.priority) return -1
    if (a.priority < b.priority) return 1
    return 0
  })

// init proxy server
new ProxyServer({
    port: process.env.PROXY_HTTP_PORT || '8080',
    rule: createGenericRule(),
    webInterface: {
      enable: !!process.env.PROXY_ADMIN_PORT,
      webPort: parseInt(process.env.PROXY_ADMIN_PORT || '8081', 10),
    },
    dangerouslyIgnoreUnauthorized: true,
    forceProxyHttps: true,
}).start()

function createGenericRule(): RuleModule {
  return {
    // http://anyproxy.io/en/#beforesendrequest
    beforeSendRequest(requestDetail: RequestDetail): Promise<RequestDetail> {
      return new Promise(resolve => {
        interceptors.map(async (rule: Rule) => {
          const { beforeSendRequest } = rule
          if (!beforeSendRequest) { return }
          await beforeSendRequest(requestDetail)
        })
        resolve(requestDetail)
      })
    },
    // http://anyproxy.io/en/#beforesendresponse
    beforeSendResponse(requestDetail: RequestDetail, responseDetail: ResponseDetail): Promise<BeforeSendResponseResult> {
      return new Promise(resolve => {
        interceptors.map(async (rule: Rule) => {
          const { beforeSendResponse } = rule
          if (!beforeSendResponse) { return }
          await beforeSendResponse(requestDetail, responseDetail)
        })
        resolve(responseDetail)
      })
    }
  }
}