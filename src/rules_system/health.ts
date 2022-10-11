import { RequestDetail } from "../interface";

export const priority = -1;

export async function beforeSendRequest(
  req: RequestDetail
): Promise<RequestDetail> {
  if (req.url != "/health") {
    return req;
  }

  const response = {
    statusCode: 200,
    header: { "Content-Type": "application/json" },
    body: "response",
  };
  return { response };
}
