import { connection } from "next/server";
import { startAlertLoop } from "./alerts";
import { injectedLatencyMs } from "./controls";
import { recordRequest } from "./metrics";

/**
 * Wrap a route handler so every request is measured: route template, method,
 * status and duration. Unexpected exceptions become a plain 500 without
 * leaking details. During a controlled latency test, Gift Circle routes are
 * delayed by the configured amount and their samples are labelled.
 */
export function instrument<Ctx>(route: string, handler: (request: Request, context: Ctx) => Promise<Response>) {
  return async (request: Request, context: Ctx): Promise<Response> => {
    // Every instrumented route answers a specific request: never prerender it.
    await connection();
    startAlertLoop();
    const started = performance.now();
    let status = 500;
    let controlledTest = false;
    try {
      if (route.startsWith("/api/circles")) {
        const extra = await injectedLatencyMs();
        if (extra > 0) {
          controlledTest = true;
          await new Promise((resolve) => setTimeout(resolve, extra));
        }
      }
      const response = await handler(request, context);
      status = response.status;
      return response;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") console.error(JSON.stringify({ scope: "festiva.api", route, error: (error as Error).name, message: (error as Error).message.slice(0, 200) }));
      return Response.json({ error: "Something went wrong on the server. Try again." }, { status: 500, headers: { "cache-control": "no-store" } });
    } finally {
      recordRequest({ route, method: request.method, status, ms: Math.round(performance.now() - started), controlledTest });
    }
  };
}
