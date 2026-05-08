export type MessageRole = "user" | "assistant" | "system" | "tool";

export type MessageStatus = "sent" | "received" | "error";

export type Message = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  senderName: string;
  senderAvatar?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTimeMs: number;
  status: MessageStatus;
  reactions?: Record<string, number>;
};

export type UserProfile = {
  id: string;
  displayName: string;
  avatarEmoji: string;
  bio: string;
};

export type AppTheme = "dark" | "light";

export type SessionMetrics = {
  promptTokensTotal: number;
  completionTokensTotal: number;
  totalTokens: number;
  modelName: string;
  lastResponseTimeMs: number;
  averageResponseTimeMs: number;
  tokensPerSecond: number;
  requestCount: number;
  errorCount: number;
  maxTokens: number;
  estimatedCost: number;
  currency: string;
};

export type Conversation = {
  id: string;
  title: string;
  messageCount: number;
  lastUpdatedAt: string;
  createdAt: string;
  isActive: boolean;
  previewText: string;
  modelUsed: string;
  totalTokens: number;
  archived: boolean;
  pinned: boolean;
  messages: Message[];
  tokenUsage: SessionMetrics;
};

export type PersistedWorkspace = {
  conversations: Conversation[];
  activeConversationId: string;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  userProfile?: UserProfile;
  theme?: AppTheme;
};

export type ChatApiResponse = {
  message: string;
  modelName: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTimeMs: number;
  tokensPerSecond: number;
};
