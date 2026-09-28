import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";
const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    getRunId: () => runId,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
  };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "The advisor is not configured yet." }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        let body: { messages?: UIMessage[]; snapshot?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request." }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const messages = body.messages ?? [];
        const snapshot = typeof body.snapshot === "string" ? body.snapshot : "";

        const runIdFetch = createRunIdFetch();
        const provider = createOpenAI({
          apiKey,
          baseURL: GATEWAY_URL,
          headers: {
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
          fetch: runIdFetch.fetch,
        });

        const system = [
          "You are the Attendance Advisor inside a college attendance planning dashboard.",
          "Answer only from the dashboard data given below. If the data does not contain the answer, say so plainly and ask the student to fill in the missing detail.",
          "Never invent subjects, dates, class counts or percentages.",
          "Never show formulas, equations, code, or calculation steps. Give the student the plain conclusion and the concrete number of classes involved.",
          "Be brief, direct and practical. Use short paragraphs or short bullet lists. Attendance below 75% means detention; 90% is the comfortable target.",
          "",
          "CURRENT DASHBOARD DATA:",
          snapshot || "The student has not filled in their attendance yet.",
        ].join("\n");

        try {
          const result = streamText({
            model: provider.responses(MODEL),
            system,
            messages: convertToModelMessages(messages),
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });

          const response = result.toUIMessageStreamResponse();
          const runId = runIdFetch.getRunId();
          if (runId) {
            response.headers.set(RUN_ID_HEADER, runId);
            response.headers.set("Access-Control-Expose-Headers", RUN_ID_HEADER);
          }
          return response;
        } catch (error) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Advisor chat failed:", message);
          return new Response(
            JSON.stringify({ error: "The advisor could not answer right now." }),
            { status: 502, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
