import { Conversation, SessionMetrics } from "./chatModels";

export const STORAGE_KEY = "ai_workspace_session_v1";
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";
export const MAX_TOKENS = 100000;

const INPUT_COST_PER_MILLION = 0.59;
const OUTPUT_COST_PER_MILLION = 0.79;

export const createDefaultMetrics = (): SessionMetrics => ({
  promptTokensTotal: 0,
  completionTokensTotal: 0,
  totalTokens: 0,
  modelName: DEFAULT_MODEL,
  lastResponseTimeMs: 0,
  averageResponseTimeMs: 0,
  tokensPerSecond: 0,
  requestCount: 0,
  errorCount: 0,
  maxTokens: MAX_TOKENS,
  estimatedCost: 0,
  currency: "USD"
});

export const makeId = () => {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rand}`;
};

export const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
};

export const formatTimeLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const createNewConversation = (): Conversation => {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    title: "New Conversation",
    messageCount: 0,
    lastUpdatedAt: now,
    createdAt: now,
    isActive: true,
    previewText: "",
    modelUsed: DEFAULT_MODEL,
    totalTokens: 0,
    archived: false,
    pinned: false,
    messages: [],
    tokenUsage: createDefaultMetrics()
  };
};

export const updateEstimatedCost = (metrics: SessionMetrics): number => {
  const inputCost = (metrics.promptTokensTotal / 1000000) * INPUT_COST_PER_MILLION;
  const outputCost = (metrics.completionTokensTotal / 1000000) * OUTPUT_COST_PER_MILLION;
  return Number((inputCost + outputCost).toFixed(6));
};
