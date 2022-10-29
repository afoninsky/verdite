// curl -k -v -X POST -H "Content-Type: application/json" -d @./examples/payload.json "https://httpbin.org/anything?qwe=asd"

import { Request, Response } from "..";
import { URL } from "url";

/**
 * Priority specifies interceptor load, the less number the earlier in the queue
 */
export const priority = 10;

/**
 * Perform preparation on module load
 */
export async function onStart() {
  console.log("[example] module started");
}

/**
 * Modify outgoing HTTP request via http or https
 */
export async function beforeSendRequest(req: Request): Promise<Request> {
  const url = new URL(req.url);
  const headers = (req.requestOptions.headers =
    req.requestOptions.headers || {});

  // serve local requests
  if (url.hostname == "localhost") {
    req.response = {
      statusCode: 404,
      header: {
        "x-request-modified": "false",
      },
      body: "404 HTTP not found",
    };
    return req;
  }

  // intercept only requests to httpbin.org
  if (url.host !== "httpbin.org") {
    return req;
  }

  // add custom request header
  headers["x-request-modified"] = "true";

  // modify json payload
  if (headers["Content-Type"] == "application/json") {
    const body = JSON.parse(req.requestData);
    body.isRequestModified = true;
    req.requestData = Buffer.from(JSON.stringify(body));
  }

  return req;
}

/**
 * Modify incomging HTTP response
 */
export async function beforeSendResponse(
  req: Request,
  res: Response
): Promise<Response> {
  res.header["x-response-modified"] = "true";
  return res;
}
