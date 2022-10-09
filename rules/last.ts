import { RequestDetail } from "anyproxy";

export const priority = 1000;

export async function beforeSendRequest(
  req: RequestDetail
): Promise<RequestDetail> {
  console.log("finalizer launched", req.url);
  return req;
}
