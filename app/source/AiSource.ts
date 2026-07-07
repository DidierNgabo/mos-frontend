export type StatisticsChatEvent =
  | { type: 'meta'; data: { requestId: string; outreachId: string } }
  | { type: 'delta'; data: { text: string } }
  | {
      type: 'done';
      data: {
        domains: string[];
        dateRange: { startDate: string | null; endDate: string | null } | null;
        generatedAt: string;
      };
    };

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamStatisticsChat({
  outreachId,
  messages,
  signal,
  onEvent,
}: {
  outreachId: string;
  messages: ChatMessageInput[];
  signal: AbortSignal;
  onEvent: (event: StatisticsChatEvent) => void;
}): Promise<void> {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/ai/statistics-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ outreachId, messages: messages.slice(-10) }),
      signal,
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(body?.message)
      ? body.message.join('; ')
      : body?.message;
    throw new Error(message || 'The statistics assistant is unavailable.');
  }

  if (!response.body) throw new Error('The server returned an empty response.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      let eventName = '';
      const dataLines: string[] = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      if (!eventName || dataLines.length === 0) continue;
      const data = JSON.parse(dataLines.join('\n')) as unknown;
      if (eventName === 'error') {
        throw new Error(
          (data as { message?: string }).message ||
            'The statistics assistant could not answer.',
        );
      }
      if (eventName === 'meta' || eventName === 'delta' || eventName === 'done') {
        onEvent({ type: eventName, data } as StatisticsChatEvent);
      }
    }
    if (done) break;
  }
}

export function clearAiChatSessions(): void {
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith('mos-ai-chat:')) sessionStorage.removeItem(key);
  }
}
