import { Rule } from "./interface";

export function sortByPriority(a: Rule, b: Rule): number {
  if (a.priority > b.priority) return -1;
  if (a.priority < b.priority) return 1;
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
