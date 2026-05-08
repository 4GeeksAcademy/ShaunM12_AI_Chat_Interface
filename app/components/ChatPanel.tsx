import { FormEvent, useState } from "react";
import Image from "next/image";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { AppTheme, Conversation, Message } from "../lib/chatModels";
import { DEFAULT_MODEL, formatTimeLabel } from "../lib/chatUtils";

type ChatPanelProps = {
  activeConversation: Conversation | null;
  visibleMessages: Message[];
  messageSearchQuery: string;
  isThinking: boolean;
  isUserTyping: boolean;
  isPeerTyping: boolean;
  socketConnected: boolean;
  theme: AppTheme;
  currentInput: string;
  errorMessage: string;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  onMessageSearchChange: (value: string) => void;
  onCurrentInputChange: (value: string) => void;
  onToggleTheme: () => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onClearConversation: () => void;
  onExpandHistory: () => void;
  onHideMetrics: () => void;
  onShowMetrics: () => void;
};

export function ChatPanel({
  activeConversation,
  visibleMessages,
  messageSearchQuery,
  isThinking,
  isUserTyping,
  isPeerTyping,
  socketConnected,
  theme,
  currentInput,
  errorMessage,
  leftSidebarCollapsed,
  rightSidebarCollapsed,
  onMessageSearchChange,
  onCurrentInputChange,
  onToggleTheme,
  onAddReaction,
  onSubmit,
  onClearConversation,
  onExpandHistory,
  onHideMetrics,
  onShowMetrics
}: ChatPanelProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const reactionSet = ["👍", "❤️", "😂", "🎉"];

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onCurrentInputChange(`${currentInput}${emojiData.emoji}`);
  };

  return (
    <section className="chat-panel panel">
      <header className="chat-header">
        <div>
          <p className="title-md">{activeConversation?.title || "No Active Conversation"}</p>
          <div className="subtle">Model: {activeConversation?.modelUsed || DEFAULT_MODEL}</div>
        </div>

        <div className="toolbar-row" style={{ gap: 8 }}>
          {leftSidebarCollapsed && (
            <button className="btn" onClick={onExpandHistory}>
              Show History
            </button>
          )}
          {!rightSidebarCollapsed ? (
            <button className="btn" onClick={onHideMetrics}>
              Hide Metrics
            </button>
          ) : (
            <button className="btn" onClick={onShowMetrics}>
              Show Metrics
            </button>
          )}
          <button
            className="btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button className="btn" onClick={onClearConversation} disabled={!activeConversation?.messages.length}>
            Clear Conversation
          </button>
        </div>
      </header>

      <div className="message-search-row">
        <input
          value={messageSearchQuery}
          onChange={(event) => onMessageSearchChange(event.target.value)}
          className="input"
          placeholder="Search messages in this chat"
          aria-label="Search messages"
        />
        <div className="subtle socket-status">{socketConnected ? "Typing channel: connected" : "Typing channel: disconnected"}</div>
      </div>

      <div className="message-list">
        {!visibleMessages.length && !messageSearchQuery.trim() && (
          <div className="empty-state with-visual">
            <Image src="/chat-visual.svg" alt="Chat workspace visual" width={220} height={110} />
            <p className="empty-title">Start your next build conversation</p>
            <p className="empty-copy">Ask a question to start your session. History and token metrics will appear as you chat.</p>
          </div>
        )}

        {!visibleMessages.length && messageSearchQuery.trim() && (
          <div className="empty-state">No messages match your search.</div>
        )}

        {visibleMessages.map((message) => (
          <article key={message.id} className={`message-row ${message.role === "user" ? "user" : "assistant"}`}>
            <span className={`avatar ${message.role === "user" ? "user" : "assistant"}`}>
              {message.senderAvatar || (message.role === "user" ? "U" : "AI")}
            </span>

            <div className="message-block">
              <div className="message-meta">
                {message.senderName} · {formatTimeLabel(message.createdAt)}
              </div>
              <div className="message-bubble">{message.content}</div>
              {message.role === "assistant" && (
                <div className="message-token-meta">
                  {message.promptTokens} prompt · {message.completionTokens} completion · {message.responseTimeMs} ms
                </div>
              )}

              <div className="reaction-row">
                {Object.entries(message.reactions ?? {}).map(([emoji, count]) => (
                  <button
                    key={`${message.id}-${emoji}`}
                    className="reaction-pill"
                    onClick={() => onAddReaction(message.id, emoji)}
                    type="button"
                  >
                    {emoji} {count}
                  </button>
                ))}

                {reactionSet.map((emoji) => (
                  <button
                    key={`${message.id}-quick-${emoji}`}
                    className="reaction-add"
                    onClick={() => onAddReaction(message.id, emoji)}
                    type="button"
                    aria-label={`Add ${emoji} reaction`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}

        {isUserTyping && !isThinking && <div className="typing-line">You are typing...</div>}
        {isPeerTyping && !isThinking && <div className="typing-line">Other user is typing...</div>}
        {isThinking && <div className="thinking">Thinking...</div>}
      </div>

      <form className="input-shell" onSubmit={onSubmit}>
        <div className="emoji-row">
          <button type="button" className="btn" onClick={() => setShowEmojiPicker((prev) => !prev)}>
            Emoji
          </button>
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker-shell">
            <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis />
          </div>
        )}

        <div className="input-row">
          <textarea
            className="textarea"
            value={currentInput}
            onChange={(event) => onCurrentInputChange(event.target.value)}
            placeholder="Ask anything about your code, architecture, or debugging..."
            disabled={isThinking}
          />
          <button className="btn btn-primary" type="submit" disabled={!currentInput.trim() || isThinking}>
            {isThinking ? "Sending..." : "Send"}
          </button>
        </div>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}
      </form>
    </section>
  );
}
