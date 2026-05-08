import { Conversation } from "../lib/chatModels";
import { DEFAULT_MODEL, MAX_TOKENS } from "../lib/chatUtils";

type MetricsPanelProps = {
  activeConversation: Conversation | null;
  usagePercent: number;
  usageColor: string;
};

export function MetricsPanel({ activeConversation, usagePercent, usageColor }: MetricsPanelProps) {
  return (
    <aside className="panel right metrics-panel">
      <div className="toolbar-row">
        <h2 className="title-lg">Token Usage</h2>
        <span className="subtle">Session</span>
      </div>

      <div className="metric-card">
        <p className="section-label">Usage</p>
        <div className="metric-value">
          {activeConversation?.tokenUsage.totalTokens.toLocaleString() || 0} / {MAX_TOKENS.toLocaleString()}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${usagePercent}%`, background: usageColor }} />
        </div>
        <div className="subtle" style={{ marginTop: 8 }}>
          {usagePercent.toFixed(1)}% used
        </div>
      </div>

      <div className="metric-card">
        <p className="section-label">Token Breakdown</p>
        <div className="metric-row">
          <span>Prompt</span>
          <strong>{activeConversation?.tokenUsage.promptTokensTotal.toLocaleString() || 0}</strong>
        </div>
        <div className="metric-row">
          <span>Completion</span>
          <strong>{activeConversation?.tokenUsage.completionTokensTotal.toLocaleString() || 0}</strong>
        </div>
        <div className="metric-row">
          <span>Total</span>
          <strong>{activeConversation?.tokenUsage.totalTokens.toLocaleString() || 0}</strong>
        </div>
      </div>

      <div className="metric-card">
        <p className="section-label">Performance</p>
        <div className="metric-grid">
          <div>
            <div className="subtle">Avg Response</div>
            <div>
              {activeConversation?.tokenUsage.averageResponseTimeMs
                ? `${Math.round(activeConversation.tokenUsage.averageResponseTimeMs)} ms`
                : "-"}
            </div>
          </div>
          <div>
            <div className="subtle">Last Response</div>
            <div>
              {activeConversation?.tokenUsage.lastResponseTimeMs
                ? `${Math.round(activeConversation.tokenUsage.lastResponseTimeMs)} ms`
                : "-"}
            </div>
          </div>
          <div>
            <div className="subtle">Tokens / sec</div>
            <div>
              {activeConversation?.tokenUsage.tokensPerSecond
                ? `${activeConversation.tokenUsage.tokensPerSecond.toFixed(2)}`
                : "-"}
            </div>
          </div>
          <div>
            <div className="subtle">Requests</div>
            <div>{activeConversation?.tokenUsage.requestCount || 0}</div>
          </div>
        </div>
        <div className="metric-row">
          <span>Error rate</span>
          <strong>
            {activeConversation && activeConversation.tokenUsage.requestCount > 0
              ? `${(
                  (activeConversation.tokenUsage.errorCount /
                    (activeConversation.tokenUsage.requestCount + activeConversation.tokenUsage.errorCount)) *
                  100
                ).toFixed(1)}%`
              : "0%"}
          </strong>
        </div>
      </div>

      <div className="metric-card">
        <p className="section-label">Cost Estimate</p>
        <div className="metric-value">${activeConversation?.tokenUsage.estimatedCost.toFixed(4) || "0.0000"}</div>
        <div className="subtle">Estimated this session ({activeConversation?.tokenUsage.currency || "USD"})</div>
        <div className="metric-row">
          <span>Model</span>
          <strong>{activeConversation?.tokenUsage.modelName || DEFAULT_MODEL}</strong>
        </div>
      </div>
    </aside>
  );
}
