import { RequestDetail, ResponseDetail } from "anyproxy";

export { RequestDetail, ResponseDetail };

export interface InterceptorOptions {
  port: string | number;
}

export interface Rule {
  priority: number;
  onStart(): Promise<any>;
  beforeSendRequest(requestDetail: RequestDetail): Promise<any>;
  beforeSendResponse(
    requestDetail: RequestDetail,
    responseDetail: ResponseDetail
  ): Promise<any>;
}
