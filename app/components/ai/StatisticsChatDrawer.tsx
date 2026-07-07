'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  Square,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';
import { Textarea } from '@/app/components/ui/textarea';
import {
  StatisticsChatEvent,
  streamStatisticsChat,
} from '@/app/source/AiSource';
import { useAppSelector } from '@/app/hooks/redux';
import { cn } from '@/lib/utils';

interface MessageMetadata {
  domains: string[];
  dateRange: { startDate: string | null; endDate: string | null } | null;
  generatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'streaming' | 'complete' | 'error';
  metadata?: MessageMetadata;
}

const STARTERS = [
  'How many patients were registered today?',
  'Summarize the active queues.',
  'Which statistics need attention?',
];

export function StatisticsChatDrawer() {
  const user = useAppSelector((state) => state.auth.user);
  const activeOutreach = useAppSelector(
    (state) => state.outreachContext.activeOutreach,
  );
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const storageKey =
    user?.id && activeOutreach?.id
      ? `mos-ai-chat:${user.id}:${activeOutreach.id}`
      : null;
  const previousStorageKey = useRef<string | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    if (!storageKey) {
      setMessages([]);
      setHydratedStorageKey(null);
      previousStorageKey.current = storageKey;
      return;
    }

    if (previousStorageKey.current === null) {
      try {
        const stored = sessionStorage.getItem(storageKey);
        setMessages(stored ? (JSON.parse(stored) as ChatMessage[]) : []);
      } catch {
        setMessages([]);
      }
    } else if (previousStorageKey.current !== storageKey) {
      sessionStorage.removeItem(storageKey);
      setMessages([]);
    }
    setHydratedStorageKey(storageKey);
    previousStorageKey.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || hydratedStorageKey !== storageKey) return;
    const completed = messages
      .filter((message) => message.status !== 'streaming')
      .slice(-20);
    sessionStorage.setItem(storageKey, JSON.stringify(completed));
  }, [messages, storageKey, hydratedStorageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const updateAssistant = (
    assistantId: string,
    updater: (message: ChatMessage) => ChatMessage,
  ) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId ? updater(message) : message,
      ),
    );
  };

  const sendQuestion = async (
    question: string,
    appendUser = true,
    baseMessages = messages,
  ) => {
    const trimmed = question.trim();
    if (!trimmed || !activeOutreach?.id || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      status: 'complete',
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: 'streaming',
    };
    const history = appendUser ? [...baseMessages, userMessage] : baseMessages;

    setMessages([...history, assistantMessage]);
    setInput('');
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamStatisticsChat({
        outreachId: activeOutreach.id,
        messages: history
          .filter((message) => message.status !== 'error')
          .slice(-10)
          .map(({ role, content }) => ({ role, content })),
        signal: controller.signal,
        onEvent: (event: StatisticsChatEvent) => {
          if (event.type === 'delta') {
            updateAssistant(assistantId, (message) => ({
              ...message,
              content: message.content + event.data.text,
            }));
          }
          if (event.type === 'done') {
            updateAssistant(assistantId, (message) => ({
              ...message,
              status: 'complete',
              metadata: event.data,
            }));
          }
        },
      });
    } catch (error) {
      if (controller.signal.aborted) {
        updateAssistant(assistantId, (message) => ({
          ...message,
          status: 'complete',
          content: message.content || 'Response stopped.',
        }));
      } else {
        updateAssistant(assistantId, (message) => ({
          ...message,
          status: 'error',
          content:
            error instanceof Error
              ? error.message
              : 'The statistics assistant is unavailable.',
        }));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void sendQuestion(input);
  };

  const retryLast = () => {
    const lastUser = [...messages]
      .reverse()
      .find((message) => message.role === 'user');
    if (!lastUser) return;
    const withoutError = messages.filter(
      (message, index) =>
        !(index === messages.length - 1 && message.status === 'error'),
    );
    setMessages(withoutError);
    void sendQuestion(lastUser.content, false, withoutError);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* <SheetTrigger asChild>
        <Button
          className="rounded-full gap-2 shadow-sm"
          disabled={!activeOutreach}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Ask MOS-AI</span>
        </Button>
      </SheetTrigger> */}
      <SheetContent className="w-full sm:max-w-xl gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4 pr-14">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" /> Statistics Assistant
          </SheetTitle>
          <SheetDescription>
            {activeOutreach
              ? `Aggregate statistics for ${activeOutreach.name}`
              : 'Select an outreach to begin.'}
          </SheetDescription>
        </SheetHeader>

        <div className="border-b bg-amber-50 px-5 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Statistics only. Do not enter patient names, registration numbers, or
          other identifiers.
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-5 py-10 text-center">
              <div className="rounded-2xl bg-primary/10 p-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Ask about your outreach</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  I can summarize authorized counts, trends, queues, screenings,
                  and stock data.
                </p>
              </div>
              <div className="flex w-full max-w-md flex-col gap-2">
                {STARTERS.map((starter) => (
                  <Button
                    key={starter}
                    variant="outline"
                    className="h-auto justify-start whitespace-normal py-3 text-left"
                    onClick={() => void sendQuestion(starter)}
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-4 py-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'border bg-muted/40',
                      message.status === 'error' &&
                        'border-destructive/40 bg-destructive/5 text-destructive',
                    )}
                  >
                    {message.role === 'assistant' ? (
                      message.content ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-2 list-disc space-y-1 pl-5">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-2 list-decimal space-y-1 pl-5">
                                {children}
                              </ol>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                      )
                    ) : (
                      message.content
                    )}
                    {message.metadata && (
                      <div className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
                        <p>
                          Data:{' '}
                          {message.metadata.domains.join(', ') ||
                            'aggregate statistics'}
                        </p>
                        <p>
                          {message.metadata.dateRange?.startDate ||
                          message.metadata.dateRange?.endDate
                            ? `${message.metadata.dateRange.startDate ?? 'beginning'} – ${message.metadata.dateRange.endDate ?? 'today'}`
                            : 'All available dates'}{' '}
                          ·{' '}
                          {new Date(
                            message.metadata.generatedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-t p-4">
          {messages.at(-1)?.status === 'error' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mb-2 gap-2"
              onClick={retryLast}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retry last question
            </Button>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 2000))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (input.trim()) void sendQuestion(input);
                }
              }}
              placeholder="Ask about outreach statistics…"
              className="max-h-32 min-h-11 resize-none"
              disabled={!activeOutreach || isStreaming}
            />
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Stop response"
                onClick={() => abortRef.current?.abort()}
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || !activeOutreach}
                aria-label="Send question"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-2 text-right text-[11px] text-muted-foreground">
            {input.length}/2000
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
