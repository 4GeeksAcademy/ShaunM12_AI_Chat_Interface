# Context
Project Overview
This project is a React and Next.js AI chat interface integrated with the Groq API. The application uses Meta's Llama 3 model through Groq and provides a full chat experience with conversation history, session persistence, token usage metrics, and response performance data.

The interface should feel like a focused developer tool rather than a casual messaging app. It combines a standard AI chat experience with operational visibility, so users can see not only the conversation, but also the token usage, model information, response timing, and session-level metrics.

Core Product Concept
The product is a developer-focused chat workspace with three main areas:

A left history panel for previous conversations and navigation.
A center chat panel for the active conversation.
A right metrics panel for token usage, performance, and model details.
The layout should answer three user questions at the same time:

What have I talked about before?
What conversation am I having now?
What is this session consuming or costing?
Each panel has a distinct purpose, but the experience should feel like one unified AI workspace.

Tech Stack
The project uses React for component state and UI behavior, Next.js for the application framework, and the Groq API for AI responses. The chat model should be Meta's Llama 3 served through Groq.

Expected stack:

React
Next.js
Groq API
Meta Llama 3 model through Groq
Environment Configuration
The project should include an environment file for storing the Groq API key. The API key must not be hardcoded into the application source.

Environment variable:

GROQ_API_KEY
The application should read the key from environment configuration when calling the Groq API.

Visual Direction
The UI should use a dark, developer-tool aesthetic inspired by the provided screenshot.

The visual style should include:

Deep black or near-black backgrounds.
Thin borders between major layout regions.
Muted gray text for secondary metadata.
Bright blue for active user actions and user message bubbles.
Subtle dark cards for assistant messages and metric panels.
Clear spacing between message turns.
Minimal decoration.
Strong readability and fast scanning.
The design should feel closer to an observability dashboard, IDE, or API console than a social chat app.

Layout Architecture
The application is organized into three primary regions: the history panel, the main chat area, and the token usage sidebar.

History Panel
The history panel is the left sidebar. It provides navigation between saved conversations and gives users a quick view of recent sessions.

Visual guide:

Full-height left column.
New Chat button at the top.
Search field below the creation action.
Conversation list below search.
Active conversation shown with a darker filled background.
Each conversation item shows title, message count, and date.
Thin dividers separate larger sections.
Primary responsibilities:

Start a new chat.
Search previous conversations.
Switch between existing conversations.
Show recent conversation activity at a glance.
Primary model:

Conversation
- id
- title
- messageCount
- lastUpdatedAt
- createdAt
- isActive
- previewText
- modelUsed
- totalTokens
- archived
- pinned
Example display:

Understanding React hooks
6 messages · May 8

TypeScript generics tutorial
4 messages · May 8

Building REST APIs with Node.js
12 messages · May 7
Main Chat Area
The main chat area is the center panel and primary interaction space. It displays the active conversation and contains the message input.

Visual guide:

Header at the top with the current conversation title.
Collapse controls near the panel edges.
Message timeline below the header.
User messages aligned to the right.
Assistant messages aligned to the left.
Message metadata near each turn.
Subtle horizontal dividers between larger message groups.
Message input field and send button anchored near the bottom.
Primary responsibilities:

Display the full conversation history.
Show user messages and AI responses with distinct visual treatments.
Let the user type and send a new message.
Preserve conversational context across turns.
Show loading feedback while waiting for the AI response.
Show human-readable errors when API requests fail.
Primary model:

Message
- id
- conversationId
- role
- content
- createdAt
- senderName
- promptTokens
- completionTokens
- totalTokens
- responseTimeMs
- status
Supported message roles:

user
assistant
system
tool
The main visible roles in this interface are user and assistant.

Token Usage Sidebar
The token usage sidebar is the right panel. It provides operational visibility into the current session.

Visual guide:

Header labeled Token Usage.
Prominent total usage number.
Progress bar showing usage against a limit.
Percentage label under the progress bar.
Breakdown card for prompt and completion tokens.
Performance section with response metrics.
Cost or session estimate section when available.
Primary responsibilities:

Display total token usage for the session.
Show prompt tokens sent across the full session.
Show completion tokens received across the full session.
Show combined tokens consumed so far.
Display model name.
Display response time.
Display tokens per second.
Update after each AI response.
Primary model:

TokenUsageSummary
- usedTokens
- maxTokens
- usagePercent
- promptTokens
- completionTokens
- cachedTokens
- reasoningTokens
- totalCost
- currency
Example display:

Usage
12,847 / 100,000
12.8% used

Prompt
5,234

Completion
7,613
Component Concepts
App Shell
The app shell owns the overall layout and global UI state.

Visual guide:

Full-screen three-column layout.
Fixed sidebars.
Scrollable center message area.
Consistent border and background treatment.
Model:

ChatWorkspace
- activeConversationId
- conversations
- messages
- tokenUsage
- uiState
New Chat Control
The New Chat control is the primary creation action in the history panel.

Visual guide:

Full-width button.
Plus icon on the left.
Clear label.
Stronger visual weight than conversation items.
Model:

NewChatAction
- label
- icon
- disabled
- defaultModel
- initialSystemPrompt
Conversation Search
The search field filters the conversation history.

Visual guide:

Search icon.
Placeholder text.
Muted background.
Rounded input container.
Model:

ConversationSearch
- query
- resultCount
- filteredConversationIds
Conversation List Item
Each list item represents one saved conversation.

Visual guide:

Chat icon on the left.
Conversation title in primary text.
Metadata below in muted text.
Active state uses a filled background.
Unselected rows remain visually quieter.
Model:

ConversationListItem
- id
- title
- messageCount
- lastUpdatedLabel
- isSelected
- unreadCount
- pinned
- archived
Chat Header
The chat header identifies the active conversation and provides layout controls.

Visual guide:

Conversation title appears bold.
Collapse icons sit near panel boundaries.
Bottom border separates the header from messages.
Model:

ChatHeader
- conversationId
- title
- leftPanelCollapsed
- rightPanelCollapsed
- status
- modelName
Message Timeline
The message timeline displays the active conversation in chronological order.

Visual guide:

Vertically stacked message turns.
Clear spacing between turns.
User and assistant messages use different alignment and color.
Metadata is visually secondary.
Model:

MessageTimeline
- conversationId
- messages
- isLoading
- scrollPosition
- selectedMessageId
User Message
User messages are visually prominent and action-colored.

Visual guide:

Right-aligned.
Bright blue message bubble.
White text.
User avatar to the far right.
Metadata above the bubble.
Model:

UserMessage
- id
- role
- content
- createdAt
- senderName
- avatar
- tokenCount
Example:

You · 02:25 PM
Can you explain how useEffect works in React?
Assistant Message
Assistant messages are calmer, darker, and more document-like.

Visual guide:

Left-aligned.
Assistant icon on the left.
Bordered dark message card.
Comfortable line height for longer reading.
Token metadata below the response.
Model:

AssistantMessage
- id
- role
- content
- createdAt
- modelName
- promptTokens
- completionTokens
- totalTokens
- responseTimeMs
Example:

Assistant · 02:26 PM
useEffect is a React Hook that lets you synchronize a component with an external system...

45 prompt · 78 completion
Message Input
The message input lets the user compose and send a new prompt.

Visual guide:

Text input or textarea near the bottom of the main chat area.
Send button placed beside or inside the input area.
Disabled or loading state while the API request is processing.
Clear focus state for keyboard use.
Model:

MessageInput
- currentValue
- isSending
- placeholder
- disabled
- errorMessage
Loading State
The loading state appears while the Groq API is processing a request.

Visual guide:

thinking... text or small animated indicator.
Displayed in the chat timeline or near the input.
Should not block reading previous messages.
Model:

LoadingState
- isThinking
- label
- startedAt
Error Message
The error message appears when the API request fails or returns a non-2xx status.

Visual guide:

Human-readable message.
Visually distinct from normal assistant messages.
Should explain that the request failed without crashing the app.
Model:

ErrorMessage
- message
- statusCode
- timestamp
- retryable
Avatar System
Avatars help distinguish message ownership quickly.

Visual guide:

Circular identity markers.
User avatar uses blue.
Assistant avatar uses dark neutral styling.
Icons remain consistent in size.
Model:

Participant
- id
- type
- displayName
- avatarIcon
- avatarColor
Usage Progress
The progress bar summarizes total token consumption.

Visual guide:

Thin horizontal bar.
Blue fill.
Dark track.
Percentage label nearby.
Model:

TokenProgress
- current
- limit
- percentage
- warningThreshold
- dangerThreshold
Color behavior:

blue: normal usage
yellow: warning threshold
red: near or over limit
Token Breakdown Card
This card separates token categories.

Visual guide:

Rounded card container.
Metric rows for prompt and completion tokens.
Colored icon block per row.
Label on the left.
Numeric value aligned to the right.
Model:

TokenBreakdown
- promptTokens
- completionTokens
- cachedTokens
- reasoningTokens
Performance Metrics
Performance metrics communicate how the assistant is behaving operationally.

Visual guide:

Section label.
Metric cards.
Icon on the left.
Small label.
Larger value.
Model:

PerformanceMetrics
- averageResponseTimeMs
- lastResponseTimeMs
- requestsToday
- errorRate
- throughput
- averageTokensPerRequest
- tokensPerSecond
Example:

Avg Response
847ms
Cost Estimate
The cost estimate card translates token usage into spend when pricing information is available.

Visual guide:

Same card style as performance metrics.
Cost value is emphasized.
Supporting label explains the billing period.
Model:

CostEstimate
- estimatedCost
- currency
- billingPeriod
- inputCost
- outputCost
- modelRate
Clear Conversation Control
The clear conversation control resets the current chat session.

Visual guide:

Secondary or destructive action.
Should be visually less prominent than Send or New Chat.
Should clearly communicate that it clears local conversation history.
Model:

ClearConversationAction
- label
- clearsMessages
- clearsLocalStorage
- disabled
State Management
The app should use React state for live chat behavior.

State responsibilities:

Store the list of messages in the active session.
Store the current input value.
Track whether the API is currently processing.
Store and display any error message.
Track accumulated token usage.
Track panel visibility and selected conversation.
State model:

UIState
- leftSidebarCollapsed
- rightSidebarCollapsed
- activeConversationId
- searchQuery
- isSendingMessage
- selectedMessageId
- scrollPosition
Message state:

ChatState
- messages
- currentInput
- isThinking
- errorMessage
- tokenUsage
Groq API Flow
When the user sends a message, the application should append the user's message to local state, then send the full conversation history to the Groq API. The full history should include all previous user and assistant turns so the model can preserve context.

The API request should use async/await. While the request is in progress, the UI should show a loading or thinking... state. If the API response succeeds, the assistant message should be appended to the conversation and usage metrics should update. If the response fails or returns a non-2xx status, the app should catch the error and display a clear message to the user.

Expected flow:

User types message
→ user clicks Send
→ append user message to message state
→ set thinking state to true
→ send full conversation history to Groq API
→ receive assistant response
→ append assistant response to message state
→ read usage object from response
→ update token and performance metrics
→ save updated conversation to localStorage
→ set thinking state to false
Error flow:

User sends message
→ API request fails or returns non-2xx status
→ catch the error
→ show human-readable error message
→ keep existing conversation visible
→ set thinking state to false
Token Usage And Metrics
After each Groq response, the application should read the usage object from the response payload.

The app should maintain running totals for the current session:

Prompt tokens sent.
Completion tokens received.
Combined total tokens consumed.
Model name.
Response time.
Tokens per second.
Metrics model:

SessionMetrics
- promptTokensTotal
- completionTokensTotal
- totalTokens
- modelName
- lastResponseTimeMs
- tokensPerSecond
- requestCount
Session Persistence
The conversation should survive a page refresh by using localStorage.

On component mount, the app should load saved conversation history from localStorage. After every new message or assistant response, the app should save the updated conversation back to localStorage.

The interface should include a Clear Conversation button. This action should reset the message state and remove the saved conversation data from localStorage.

Persistence model:

PersistedSession
- messages
- tokenUsage
- lastUpdatedAt
- modelName
Interaction Flow
Typical user flow:

User opens workspace
→ app loads saved conversation from localStorage
→ history panel loads recent conversations
→ user selects or starts a conversation
→ center panel displays message history
→ right panel calculates usage stats
→ user sends a message
→ message appears in timeline
→ loading state appears
→ assistant response appears
→ token usage and performance metrics update
→ conversation is saved locally
Design Priorities
The interface should prioritize readability over decoration. The layout should be stable, dense enough for developer workflows, and easy to scan without feeling cramped.

Important priorities:

Clear separation between navigation, conversation, and analytics.
Strong contrast for active actions.
Muted styling for supporting metadata.
Stable layout with minimal visual shift.
Human-readable loading and error states.
Persistent conversation history.
Accurate session token metrics.
A visual style aligned with the provided screenshot.
Concept Summary
This UI is a chat interface with operational awareness. It should feel like a focused AI workspace for users who care about message history, model behavior, token usage, performance, and cost.
