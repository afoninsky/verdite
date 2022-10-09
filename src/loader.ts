import * as glob from "glob";
import { RequestDetail, ResponseDetail } from "anyproxy";

export interface Rule {
  priority: number;
  onStart(): Promise<any>;
  beforeSendRequest(requestDetail: RequestDetail): Promise<any>;
  beforeSendResponse(
    requestDetail: RequestDetail,
    responseDetail: ResponseDetail
  ): Promise<any>;
}

function sortByPriority(a: Rule, b: Rule): number {
  if (a.priority > b.priority) return -1;
  if (a.priority < b.priority) return 1;
  return 0;
}

// loads sorted set of interceptors, calls init function if exists
export async function initRules(path: string): Promise<Rule[]> {
  const interceptors: Rule[] = glob
    .sync(path)
    .map((file) => require(file))
    .sort(sortByPriority);

  interceptors.map(async (rule: Rule) => {
    if (rule.onStart) {
      await rule.onStart();
    }
  });

  return interceptors;
}
