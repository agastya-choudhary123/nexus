export default function DashboardHome() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Nexus</h1>
      <p className="text-slate-600 mb-8">
        Your agentic control plane for cross-tool orchestration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">🔌 Connect Tools</h3>
          <p className="text-sm text-slate-600">
            Set up your MCP servers and enable the tools you want to use.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">💬 Start a Chat</h3>
          <p className="text-sm text-slate-600">
            Express an intent and let the agent orchestrate across your tools.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">🔒 Manage Permissions</h3>
          <p className="text-sm text-slate-600">
            Control which tools the agent can access in this session.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">📋 View History</h3>
          <p className="text-sm text-slate-600">
            Inspect every decision the agent made in past sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
