import { RequestOptions } from "http";

export interface Request {
  protocol: string;
  url: string;
  requestOptions: RequestOptions;
  requestData: any;
  response?: Response;
}

export interface Response {
  statusCode: number;
  header: Record<string, string>;
  body: any;
}

export interface InterceptorOptions {
  port: string | number;
}

export interface Rule {
  priority: number;
  onStart(): Promise<any>;
  beforeSendRequest(request: Request);
  beforeSendResponse(request: Request, response: Response);
}
