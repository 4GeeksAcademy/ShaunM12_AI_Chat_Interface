import { useState } from "react";
import { Conversation, UserProfile } from "../lib/chatModels";
import { formatDateLabel } from "../lib/chatUtils";

type HistoryPanelProps = {
  filteredConversations: Conversation[];
  activeConversationId: string;
  searchQuery: string;
  userProfile: UserProfile;
  onSearchChange: (value: string) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversationById: (id: string) => void;
  onNewChat: () => void;
  onCollapse: () => void;
};

export function HistoryPanel({
  filteredConversations,
  activeConversationId,
  searchQuery,
  userProfile,
  onSearchChange,
  onUpdateProfile,
  onSwitchConversation,
  onDeleteConversationById,
  onNewChat,
  onCollapse
}: HistoryPanelProps) {
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  return (
    <aside className="panel history-panel">
      <div className="toolbar-row">
        <h1 className="title-lg">Conversations</h1>
        <button className="btn" onClick={onCollapse} aria-label="Collapse history panel">
          Hide
        </button>
      </div>

      <button className="btn btn-primary" onClick={onNewChat}>
        + New Chat
      </button>

      <div className="profile-card">
        <div className="profile-avatar" aria-hidden="true">
          {userProfile.avatarEmoji}
        </div>
        <div className="profile-content">
          <div className="profile-name">{userProfile.displayName}</div>
          <div className="profile-bio">{userProfile.bio}</div>
        </div>
        <button type="button" className="btn profile-edit-btn" onClick={() => setShowProfileEditor((prev) => !prev)}>
          Profile
        </button>
      </div>

      {showProfileEditor && (
        <div className="profile-editor">
          <label className="subtle" htmlFor="profile-name-input">
            Display Name
          </label>
          <input
            id="profile-name-input"
            className="input"
            value={userProfile.displayName}
            onChange={(event) => onUpdateProfile({ displayName: event.target.value })}
            placeholder="Your name"
          />

          <label className="subtle" htmlFor="profile-avatar-input">
            Avatar Emoji
          </label>
          <input
            id="profile-avatar-input"
            className="input"
            value={userProfile.avatarEmoji}
            onChange={(event) => onUpdateProfile({ avatarEmoji: event.target.value || "🧑‍💻" })}
            placeholder="🧑‍💻"
          />

          <label className="subtle" htmlFor="profile-bio-input">
            Bio
          </label>
          <input
            id="profile-bio-input"
            className="input"
            value={userProfile.bio}
            onChange={(event) => onUpdateProfile({ bio: event.target.value })}
            placeholder="What are you building?"
          />
        </div>
      )}

      <input
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        className="input"
        placeholder="Search conversations"
        aria-label="Search conversations"
      />

      <div className="conversation-list">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${conversation.id === activeConversationId ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSwitchConversation(conversation.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSwitchConversation(conversation.id);
              }
            }}
          >
            <div className="conversation-row">
              <p className="conversation-title">{conversation.title || "Untitled Chat"}</p>
              <button
                type="button"
                className="btn conversation-delete-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteConversationById(conversation.id);
                }}
              >
                Delete
              </button>
            </div>
            <div className="conversation-meta">
              {conversation.messageCount} messages · {formatDateLabel(conversation.lastUpdatedAt)}
            </div>
          </div>
        ))}

        {!filteredConversations.length && (
          <div className="empty-state">No conversations match your search.</div>
        )}
      </div>
    </aside>
  );
}
