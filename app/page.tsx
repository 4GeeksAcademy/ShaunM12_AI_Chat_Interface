"use client";

import { ChatPanel } from "./components/ChatPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { MetricsPanel } from "./components/MetricsPanel";
import { useChatWorkspace } from "./hooks";

export default function HomePage() {
  const {
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
  } = useChatWorkspace();

  return (
    <main className="workspace">
      {!leftSidebarCollapsed && (
        <HistoryPanel
          filteredConversations={filteredConversations}
          activeConversationId={activeConversationId}
          searchQuery={searchQuery}
          userProfile={userProfile}
          onSearchChange={setSearchQuery}
          onUpdateProfile={updateUserProfile}
          onSwitchConversation={switchConversation}
          onDeleteConversationById={deleteConversationById}
          onNewChat={handleNewChat}
          onCollapse={() => setLeftSidebarCollapsed(true)}
        />
      )}

      <ChatPanel
        activeConversation={activeConversation}
        visibleMessages={visibleMessages}
        messageSearchQuery={messageSearchQuery}
        isThinking={isThinking}
        isUserTyping={isUserTyping}
        isPeerTyping={isPeerTyping}
        socketConnected={socketConnected}
        theme={theme}
        currentInput={currentInput}
        errorMessage={errorMessage}
        leftSidebarCollapsed={leftSidebarCollapsed}
        rightSidebarCollapsed={rightSidebarCollapsed}
        onMessageSearchChange={setMessageSearchQuery}
        onCurrentInputChange={onCurrentInputChange}
        onToggleTheme={toggleTheme}
        onAddReaction={addReaction}
        onSubmit={sendMessage}
        onClearConversation={clearConversation}
        onExpandHistory={() => setLeftSidebarCollapsed(false)}
        onHideMetrics={() => setRightSidebarCollapsed(true)}
        onShowMetrics={() => setRightSidebarCollapsed(false)}
      />

      {!rightSidebarCollapsed && (
        <MetricsPanel
          activeConversation={activeConversation}
          usagePercent={usagePercent}
          usageColor={usageColor}
        />
      )}
    </main>
  );
}
