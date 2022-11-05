import { Rule } from "./interface";

export function sortByPriority(a: Rule, b: Rule): number {
  const p1 = a.priority || 1;
  const p2 = b.priority || 1;
  if (p1 > p2) {
    return -1;
  }
  if (p1 < p2) {
    return 1;
  }
  return 0;
}

export function errorResponse(err: any): any {
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
