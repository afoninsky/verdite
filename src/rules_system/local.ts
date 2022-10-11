import { Request } from "../interface";

export const priority = -1;

export function beforeSendRequest(req: Request) {
  // TODO: handle requests not to proxy and return 404

  console.log(req);
  if (req.requestOptions.path != "/health") {
    return;
  }

  req.response = {
    statusCode: 200,
    header: { "Content-Type": "application/json" },
    body: "OK",
  };
}
