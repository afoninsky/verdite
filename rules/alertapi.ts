import { RequestDetail } from "anyproxy";
import { URL } from "url";

export const priority = 10;

export async function beforeSendRequest(
  req: RequestDetail
): Promise<RequestDetail> {
  const url = new URL(req.url);
  if (url.host !== "httpbin.org") {
    return req;
  }

  const headers = (req.requestOptions.headers =
    req.requestOptions.headers || {});
  headers["x-alert-downgraded"] = "true";

  // downgrade alertmanager protocol to alertapi
  const { alerts } = JSON.parse(req.requestData);

  // add required annotation if not exists
  alerts.forEach((alert: any) => {
    const annotations = (alert.annotations = alert.annotations || {});
    if (!annotations.alert_name_tmpl) {
      annotations.alert_name_tmpl = "kubernetes.$cluster.$alertname.$severity";
    }
    // https://alertapi.booking.com/opdocs/HOWTO-101#Using
    if (!annotations.opdoc) {
      annotations.opdoc = "NOOP";
    }
  });

  req.requestData = Buffer.from(JSON.stringify(alerts));
  return req;
}
