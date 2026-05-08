import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AppTheme,
  ChatApiResponse,
  Conversation,
  Message,
  PersistedWorkspace,
  SessionMetrics,
  UserProfile
} from "../lib/chatModels";
import {
  createDefaultMetrics,
  createNewConversation,
  makeId,
  STORAGE_KEY,
  updateEstimatedCost
} from "../lib/chatUtils";

const markActiveConversation = (items: Conversation[], activeId: string): Conversation[] => {
  return items.map((item) => ({
    ...item,
    isActive: item.id === activeId
  }));
};

const DEFAULT_USER_PROFILE: UserProfile = {
  id: "local-user",
  displayName: "You",
  avatarEmoji: "🧑‍💻",
  bio: "Building with AI"
};

type UseChatWorkspaceResult = {
  activeConversation: Conversation | null;
  visibleMessages: Message[];
  filteredConversations: Conversation[];
  activeConversationId: string;
  searchQuery: string;
  messageSearchQuery: string;
  currentInput: string;
  isThinking: boolean;
  isUserTyping: boolean;
  isPeerTyping: boolean;
  socketConnected: boolean;
  theme: AppTheme;
  errorMessage: string;
  userProfile: UserProfile;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  usagePercent: number;
  usageColor: string;
  setSearchQuery: (value: string) => void;
  setMessageSearchQuery: (value: string) => void;
  onCurrentInputChange: (value: string) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  toggleTheme: () => void;
  setLeftSidebarCollapsed: (value: boolean) => void;
  setRightSidebarCollapsed: (value: boolean) => void;
  switchConversation: (id: string) => void;
  handleNewChat: () => void;
  clearConversation: () => void;
  deleteConversationById: (conversationId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  sendMessage: (event: FormEvent) => Promise<void>;
};

export function useChatWorkspace(): UseChatWorkspaceResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("dark");
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const typingSignalAtRef = useRef(0);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const clientIdRef = useRef(`client-${makeId()}`);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createNewConversation();
      setConversations([initial]);
      setActiveConversationId(initial.id);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedWorkspace;
      if (!parsed.conversations?.length) {
        const fallback = createNewConversation();
        setConversations([fallback]);
        setActiveConversationId(fallback.id);
        return;
      }

      const fallbackId = parsed.conversations[0].id;
      const hasActive = parsed.conversations.some((item) => item.id === parsed.activeConversationId);
      const resolvedActiveId = hasActive ? parsed.activeConversationId : fallbackId;

      setConversations(markActiveConversation(parsed.conversations, resolvedActiveId));
      setActiveConversationId(resolvedActiveId);
      setTheme(parsed.theme === "light" ? "light" : "dark");
      setUserProfile(parsed.userProfile ?? DEFAULT_USER_PROFILE);
      setLeftSidebarCollapsed(Boolean(parsed.leftSidebarCollapsed));
      setRightSidebarCollapsed(Boolean(parsed.rightSidebarCollapsed));
    } catch {
      const fallback = createNewConversation();
      setConversations([fallback]);
      setActiveConversationId(fallback.id);
    }
  }, []);

  useEffect(() => {
    if (!conversations.length || typeof window === "undefined") {
      return;
    }

    const payload: PersistedWorkspace = {
      conversations,
      activeConversationId,
      theme,
      userProfile,
      leftSidebarCollapsed,
      rightSidebarCollapsed
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [conversations, activeConversationId, theme, userProfile, leftSidebarCollapsed, rightSidebarCollapsed]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const socket = new WebSocket("wss://echo.websocket.events");
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketConnected(true);
    };

    socket.onclose = () => {
      setSocketConnected(false);
    };

    socket.onerror = () => {
      setSocketConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { type?: string; clientId?: string };
        if (data.type !== "typing" || data.clientId === clientIdRef.current) {
          return;
        }

        setIsPeerTyping(true);
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = window.setTimeout(() => {
          setIsPeerTyping(false);
        }, 1300);
      } catch {
        // Ignore non-JSON events emitted by the echo service.
      }
    };

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const activeConversation = useMemo(() => {
    return conversations.find((item) => item.id === activeConversationId) ?? null;
  }, [conversations, activeConversationId]);

  const filteredConversations = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.title.toLowerCase().includes(needle) ||
        conversation.previewText.toLowerCase().includes(needle)
      );
    });
  }, [conversations, searchQuery]);

  const visibleMessages = useMemo(() => {
    if (!activeConversation) {
      return [];
    }

    const needle = messageSearchQuery.trim().toLowerCase();
    if (!needle) {
      return activeConversation.messages;
    }

    return activeConversation.messages.filter((message) => {
      return message.content.toLowerCase().includes(needle);
    });
  }, [activeConversation, messageSearchQuery]);

  const usagePercent = activeConversation
    ? Math.min(
        100,
        (activeConversation.tokenUsage.totalTokens / activeConversation.tokenUsage.maxTokens) * 100
      )
    : 0;

  const usageColor =
    usagePercent >= 90 ? "var(--danger)" : usagePercent >= 70 ? "var(--warning)" : "var(--accent)";

  const patchConversation = (conversationId: string, patch: (conversation: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((item) => (item.id === conversationId ? patch(item) : item)));
  };

  const switchConversation = (id: string) => {
    setConversations((prev) => markActiveConversation(prev, id));
    setActiveConversationId(id);
    setMessageSearchQuery("");
    setErrorMessage("");
  };

  const handleNewChat = () => {
    const created = createNewConversation();
    setConversations((prev) => markActiveConversation([...prev, created], created.id));
    setActiveConversationId(created.id);
    setCurrentInput("");
    setIsUserTyping(false);
    setMessageSearchQuery("");
    setErrorMessage("");
  };

  const clearConversation = () => {
    if (!activeConversation) {
      return;
    }

    const now = new Date().toISOString();

    setConversations((prev) => {
      return prev.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation;
        }

        return {
          ...conversation,
          title: "New Conversation",
          messages: [],
          previewText: "",
          messageCount: 0,
          totalTokens: 0,
          lastUpdatedAt: now,
          tokenUsage: createDefaultMetrics()
        };
      });
    });

    setErrorMessage("");
    setMessageSearchQuery("");
  };

  const deleteConversationById = (conversationId: string) => {
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId);

    if (!remaining.length) {
      const created = createNewConversation();
      setConversations([created]);
      setActiveConversationId(created.id);
      setErrorMessage("");
      setMessageSearchQuery("");
      setIsUserTyping(false);
      setCurrentInput("");
      return;
    }

    const nextActiveId = remaining.some((conversation) => conversation.id === activeConversationId)
      ? activeConversationId
      : remaining[0].id;

    setConversations(markActiveConversation(remaining, nextActiveId));
    setActiveConversationId(nextActiveId);

    if (conversationId === activeConversationId) {
      setErrorMessage("");
      setMessageSearchQuery("");
      setIsUserTyping(false);
      setCurrentInput("");
    }
  };

  const emitTypingSignal = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = Date.now();
    if (now - typingSignalAtRef.current < 800) {
      return;
    }

    typingSignalAtRef.current = now;
    socket.send(
      JSON.stringify({
        type: "typing",
        at: now,
        clientId: clientIdRef.current
      })
    );
  };

  const onCurrentInputChange = (value: string) => {
    setCurrentInput(value);
    setIsUserTyping(Boolean(value.trim()));
    if (value.trim()) {
      emitTypingSignal();
    }
  };

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...patch
    }));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!activeConversation) {
      return;
    }

    patchConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        const reactions = message.reactions ?? {};
        return {
          ...message,
          reactions: {
            ...reactions,
            [emoji]: (reactions[emoji] ?? 0) + 1
          }
        };
      })
    }));
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = currentInput.trim();
    if (!trimmed || !activeConversation || isThinking) {
      return;
    }

    const now = new Date().toISOString();
    const userMessage: Message = {
      id: makeId(),
      conversationId: activeConversation.id,
      role: "user",
      content: trimmed,
      createdAt: now,
      senderName: userProfile.displayName,
      senderAvatar: userProfile.avatarEmoji,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      responseTimeMs: 0,
      status: "sent",
      reactions: {}
    };

    const conversationMessages = [...activeConversation.messages, userMessage];

    patchConversation(activeConversation.id, (conversation) => {
      const firstUserMessage = conversation.messages.filter((item) => item.role === "user").length === 0;
      return {
        ...conversation,
        title: firstUserMessage ? trimmed.slice(0, 52) : conversation.title,
        messages: conversationMessages,
        previewText: trimmed,
        messageCount: conversationMessages.length,
        lastUpdatedAt: now
      };
    });

    setCurrentInput("");
    setIsUserTyping(false);
    setErrorMessage("");
    setIsThinking(true);

    try {
      const payload = conversationMessages
        .filter((item) => item.role === "user" || item.role === "assistant" || item.role === "system")
        .map((item) => ({ role: item.role, content: item.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: payload })
      });

      if (!response.ok) {
        const failed = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(failed?.error || `Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ChatApiResponse;
      const assistantMessage: Message = {
        id: makeId(),
        conversationId: activeConversation.id,
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
        senderName: "Assistant",
        senderAvatar: "🤖",
        promptTokens: data.usage.promptTokens,
        completionTokens: data.usage.completionTokens,
        totalTokens: data.usage.totalTokens,
        responseTimeMs: data.responseTimeMs,
        status: "received",
        reactions: {}
      };

      patchConversation(activeConversation.id, (conversation) => {
        const updatedMessages = [...conversation.messages, assistantMessage];
        const requestCount = conversation.tokenUsage.requestCount + 1;

        const nextMetrics: SessionMetrics = {
          ...conversation.tokenUsage,
          promptTokensTotal: conversation.tokenUsage.promptTokensTotal + data.usage.promptTokens,
          completionTokensTotal:
            conversation.tokenUsage.completionTokensTotal + data.usage.completionTokens,
          totalTokens: conversation.tokenUsage.totalTokens + data.usage.totalTokens,
          modelName: data.modelName,
          lastResponseTimeMs: data.responseTimeMs,
          averageResponseTimeMs:
            (conversation.tokenUsage.averageResponseTimeMs * conversation.tokenUsage.requestCount +
              data.responseTimeMs) /
            requestCount,
          tokensPerSecond: data.tokensPerSecond,
          requestCount,
          estimatedCost: 0
        };

        nextMetrics.estimatedCost = updateEstimatedCost(nextMetrics);

        return {
          ...conversation,
          messages: updatedMessages,
          previewText: assistantMessage.content.slice(0, 84),
          messageCount: updatedMessages.length,
          modelUsed: data.modelName,
          totalTokens: nextMetrics.totalTokens,
          lastUpdatedAt: assistantMessage.createdAt,
          tokenUsage: nextMetrics
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while contacting Groq.";
      setErrorMessage(message);

      patchConversation(activeConversation.id, (conversation) => ({
        ...conversation,
        tokenUsage: {
          ...conversation.tokenUsage,
          errorCount: conversation.tokenUsage.errorCount + 1
        }
      }));
    } finally {
      setIsThinking(false);
    }
  };

  return {
    activeConversation,
    visibleMessages,
    filteredConversations,
    activeConversationId,
    searchQuery,
    messageSearchQuery,
    currentInput,
    isThinking,
    isUserTyping,
    isPeerTyping,
    socketConnected,
    theme,
    errorMessage,
    userProfile,
    leftSidebarCollapsed,
    rightSidebarCollapsed,
    usagePercent,
    usageColor,
    setSearchQuery,
    setMessageSearchQuery,
    onCurrentInputChange,
    updateUserProfile,
    toggleTheme,
    setLeftSidebarCollapsed,
    setRightSidebarCollapsed,
    switchConversation,
    handleNewChat,
    clearConversation,
    deleteConversationById,
    addReaction,
    sendMessage
  };
}
