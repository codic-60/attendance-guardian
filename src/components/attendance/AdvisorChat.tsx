import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X } from "lucide-react";
import advisorLogo from "@/assets/advisor-logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "attendance-advisor-chat-v1";

const loadMessages = (): UIMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
};

const SUGGESTIONS = [
  "If I take a 3-day sick leave from tomorrow, which subject drops below 75%?",
  "Which subject needs the most attention right now?",
  "How many classes can I safely skip this month?",
];

export function AdvisorChat({ snapshot }: { snapshot: string }) {
  const [open, setOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: { messages: msgs, snapshot: snapshotRef.current },
      }),
    }),
    onError: () =>
      setErrorText("The advisor couldn't answer that just now. Try asking again in a moment."),
  });

  useEffect(() => {
    const saved = loadMessages();
    if (saved.length) setMessages(saved);
    setRestored(true);
  }, [setMessages]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages, restored]);

  useEffect(() => {
    if (open || status === "ready") textareaRef.current?.focus();
  }, [open, status, messages.length]);

  const busy = status === "submitted" || status === "streaming";

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    setErrorText(null);
    void sendMessage({ text: text.trim() });
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
        >
          <MessageCircle className="size-4" />
          Attendance Advisor
        </button>
      )}

      {open && (
        <div className="panel fixed bottom-6 right-4 z-50 flex h-[34rem] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <img
              src={advisorLogo}
              alt=""
              width={816}
              height={816}
              loading="lazy"
              className="size-8 rounded-md"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">Attendance Advisor</p>
              <p className="text-xs text-muted-foreground">Reads your dashboard, answers plainly</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close advisor">
              <X className="size-4" />
            </Button>
          </header>

          <Conversation className="flex-1">
            <ConversationContent className="gap-4">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Ask about your attendance"
                  description="Plan leaves, check risk, and see what a skipped week really costs."
                  icon={
                    <img
                      src={advisorLogo}
                      alt=""
                      width={816}
                      height={816}
                      loading="lazy"
                      className="size-12"
                    />
                  }
                >
                  <div className="mt-3 flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => ask(s)}
                        className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-left text-xs text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent variant={message.role === "user" ? "contained" : "flat"}>
                      {message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>
                        ) : null,
                      )}
                    </MessageContent>
                  </Message>
                ))
              )}
              {status === "submitted" && <Shimmer className="text-sm">Checking your timetable...</Shimmer>}
              {errorText && <p className="text-xs text-destructive">{errorText}</p>}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border p-3">
            <PromptInput
              onSubmit={(message) => {
                ask(message.text ?? "");
              }}
            >
              <PromptInputTextarea ref={textareaRef} placeholder="Ask about leaves, risk, or targets..." />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit size="icon-sm" status={status} onClick={busy ? () => stop() : undefined} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      )}
    </>
  );
}
