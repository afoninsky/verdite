import { Rule } from "./loader";

import {
  RuleModule,
  RequestDetail,
  ResponseDetail,
  BeforeSendResponseResult,
  BeforeSendRequestResult,
} from "anyproxy";

function errorResponse(err: any): any {
  let text = "";
  if (typeof err === "string") {
    text = err;
  } else if (err instanceof Error) {
    text = err.message;
  }
  const response = {
    statusCode: 500,
    header: { "Content-Type": "application/json" },
    body: `{"error": "${text}"}`,
  };
  return { response };
}

export function createRulesWrapper(rules: Rule[]): RuleModule {
  return {
    // http://anyproxy.io/en/#beforesendrequest
    beforeSendRequest(requestDetail: RequestDetail | any): Promise<any> {
      return new Promise(async (resolve) => {
        for (const rule of rules) {
          if (!rule.beforeSendRequest) {
            continue;
          }
          try {
            await rule.beforeSendRequest(requestDetail);
          } catch (err) {
            console.log(err);
            errorResponse(err);
          }

          // finish further processing if someone already set response
          if (requestDetail.response) {
            break;
          }
        }
        resolve(requestDetail);
      });
    },
    // http://anyproxy.io/en/#beforesendresponse
    beforeSendResponse(
      requestDetail: RequestDetail,
      responseDetail: ResponseDetail
    ): Promise<BeforeSendResponseResult> {
      return new Promise(async (resolve) => {
        for (const rule of rules) {
          if (!rule.beforeSendResponse) {
            continue;
          }
          try {
            await rule.beforeSendResponse(requestDetail, responseDetail);
          } catch (err) {
            console.log(err);
            return resolve(errorResponse(err));
          }
        }
        resolve(responseDetail);
      });
    },
  };
}