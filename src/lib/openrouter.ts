/**
 * openrouter.ts — Thin wrapper around OpenRouter's /chat/completions endpoint.
 *
 * OpenRouter is an API aggregator that gives you access to 200+ models
 * (GPT-4o, Claude, Gemini, Mistral, Llama, …) via a single API key.
 * Get a free key at https://openrouter.ai/keys
 *
 * Used here for the Journal AI insights feature.
 */

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ORMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OROptions {
  model: string;
  messages: ORMessage[];
  temperature?: number;
  max_tokens?: number;
  /** Called with each streamed text chunk when stream=true */
  onChunk?: (chunk: string) => void;
}

/** Popular models available on OpenRouter (free tier marked) */
export const OPENROUTER_MODELS = [
  // Free / very cheap
  { id: 'google/gemini-flash-1.5',        label: 'Gemini Flash 1.5 (free)',   free: true },
  { id: 'google/gemini-flash-1.5-8b',     label: 'Gemini Flash 1.5 8B (free)',free: true },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (free)', free: true },
  { id: 'mistralai/mistral-7b-instruct:free',    label: 'Mistral 7B (free)',    free: true },
  // Paid — better quality
  { id: 'anthropic/claude-sonnet-4-5',    label: 'Claude Sonnet 4.5',         free: false },
  { id: 'anthropic/claude-haiku-3-5',     label: 'Claude Haiku 3.5',          free: false },
  { id: 'openai/gpt-4o-mini',             label: 'GPT-4o Mini',               free: false },
  { id: 'openai/gpt-4o',                  label: 'GPT-4o',                    free: false },
  { id: 'google/gemini-pro-1.5',          label: 'Gemini Pro 1.5',            free: false },
  { id: 'mistralai/mistral-large',        label: 'Mistral Large',             free: false },
];

// ─── Core call ────────────────────────────────────────────────────────────────

/**
 * Call OpenRouter. Returns the full response text.
 * If `onChunk` is provided the response is streamed and each text token
 * is passed to the callback in real time.
 */
export async function callOpenRouter(
  apiKey: string,
  options: OROptions
): Promise<string> {
  const stream = !!options.onChunk;

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Self Monitor — Journal',
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 800,
      stream,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  // ── Non-streaming ────────────────────────────────────────────────────────
  if (!stream) {
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  // ── Streaming (SSE) ──────────────────────────────────────────────────────
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // SSE lines: "data: {...}\n\n"
    for (const line of chunk.split('\n')) {
      const clean = line.replace(/^data:\s*/, '').trim();
      if (!clean || clean === '[DONE]') continue;
      try {
        const json = JSON.parse(clean);
        const text = json.choices?.[0]?.delta?.content ?? '';
        if (text) {
          full += text;
          options.onChunk?.(text);
        }
      } catch {
        // Ignore malformed SSE lines
      }
    }
  }

  return full;
}

// ─── Journal prompts ──────────────────────────────────────────────────────────

type Tone = 'coach' | 'therapist' | 'mentor' | 'friend';

const TONE_SYSTEM: Record<Tone, string> = {
  coach:
    'You are a high-performance life coach. Be direct, actionable, and energising. ' +
    'Identify patterns in the journal entry and suggest concrete next steps. ' +
    'Keep your response under 200 words. Use bullet points sparingly.',
  therapist:
    'You are a compassionate therapist practising CBT and positive psychology. ' +
    'Reflect feelings back, gently challenge distortions, and validate effort. ' +
    'Keep your response under 200 words. Be warm and non-judgmental.',
  mentor:
    'You are a wise mentor who has seen a lot of life. ' +
    'Offer perspective, share a relevant principle or insight, and ask one powerful question. ' +
    'Keep your response under 200 words. Be thoughtful and concise.',
  friend:
    'You are a kind, supportive friend who is also sharp and honest. ' +
    'Celebrate wins, acknowledge struggles, and offer one practical idea. ' +
    'Keep your response casual, warm, and under 150 words.',
};

export interface JournalPayload {
  mood: number;        // 1–5
  energy: number;      // 1–5
  freeWrite: string;
  gratitude: string[];
  intention: string;
  tone: Tone;
  recentContext?: string; // optional: last 3 days' moods/intentions as a string
}

export function buildJournalMessages(payload: JournalPayload): ORMessage[] {
  const moodLabel = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great'][payload.mood];
  const energyLabel = ['', 'Drained', 'Low', 'Moderate', 'High', 'Electric'][payload.energy];

  const userContent = `
Today's journal entry:

Mood: ${moodLabel} (${payload.mood}/5)
Energy: ${energyLabel} (${payload.energy}/5)

Free write:
${payload.freeWrite || '(nothing written)'}

Gratitude:
${payload.gratitude.filter(Boolean).map((g, i) => `${i + 1}. ${g}`).join('\n') || '(none)'}

Tomorrow's intention:
${payload.intention || '(not set)'}

${payload.recentContext ? `Recent context (last few days):\n${payload.recentContext}` : ''}

Please give me your insight based on this entry.
`.trim();

  return [
    { role: 'system', content: TONE_SYSTEM[payload.tone] },
    { role: 'user', content: userContent },
  ];
}
