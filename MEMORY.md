# Nexus: Agentic Control Plane — Implementation Memory

**Project**: Nexus (Agentic Control Plane)  
**GitHub**: https://github.com/agastya-choudhary123/nexus  
**User**: agastya (agastya.r.choudhary@gmail.com)  
**Current Date**: 2026-05-29  
**Status**: Checkpoint 1 Complete ✅

---

## Project Vision

Nexus is a unified middleware layer (Agentic Control Plane) that solves three compounding problems:

1. **SaaS Fragmentation** — Users manually orchestrate across 9-12 SaaS tools daily. Nexus automates multi-step cross-tool intents.
2. **Agent Trust Ceiling** — Existing agents can't execute real actions safely. Nexus adds a Verifier agent + human-in-the-loop confirmation gates.
3. **Integration Hell** — Every team rebuilds the same 50 integrations. Nexus standardizes on MCP (Model Context Protocol) servers.

### Core Features
- **Identity**: JWT-scoped agent sessions with explicit tool access
- **Toolbelt**: Live MCP server registry; agent discovers tools at runtime
- **Verifier**: Second AI model that reviews every proposed action before execution
- **Just-in-Time UI**: Dynamically rendered components (confirmation cards, dashboards, tables) from agent output
- **Human Gate**: `waitForEvent` pause when action needs human approval; Inngest resumes after user clicks Approve/Reject

---

## Tech Stack (Zero Cost)

| Layer | Technology | Cost | Notes |
|-------|-----------|------|-------|
| Frontend | Next.js 16.2.6 (App Router) | Free | Server Actions, streaming |
| Styling | Tailwind CSS + shadcn/ui | Free | Headless components |
| Workflow | Inngest | Free | 50k runs/month free tier |
| MCP Host | @modelcontextprotocol/sdk | Free | Official TypeScript SDK |
| LLM (Dev) | Ollama + llama3.1:8b | Free | Runs excellently on M-chip Macs |
| LLM (Demo) | Groq free tier | Free | Llama 3.1 8B/70B, 14.4k req/day |
| Auth | Auth.js v5 (NextAuth) | Free | Google OAuth, JWT custom claims |
| Database | Supabase (free tier) | Free | 500MB Postgres, pgvector, Realtime |
| Deployment | Vercel | Free | Zero-config Next.js hosting |

---

## Implementation Plan (8 Checkpoints, ~25 Days)

### Checkpoint 1: The Shell ✅ **COMPLETE**
**Status**: Verified and pushed to GitHub

**What was built**:
- Next.js 16.2.6 app with TypeScript, Tailwind, App Router
- Auth.js v5 configured with Google OAuth
- Dashboard shell: sidebar (Chat/Registry/Permissions/Logs), top nav, user footer
- Route structure:
  - `app/(auth)/sign-in/page.tsx` — Google OAuth sign-in
  - `app/api/auth/[...nextauth]/route.ts` — Auth.js endpoint
  - `app/dashboard/` — Protected dashboard routes
  - `app/dashboard/chat/page.tsx`, `registry`, `permissions`, `logs` — placeholders
- Supabase schema SQL (tables: user_profiles, mcp_registry, pending_actions, agent_logs)
- Environment variables template with AUTH_SECRET generated
- Auth flow verified: GET / → 307 redirect to /sign-in → OAuth → /dashboard

**Current .env.local** (credentials in .env.local only, not in version control):
- AUTH_SECRET: generated with `openssl rand -hex 32`
- AUTH_GOOGLE_ID: from Google Cloud Console
- AUTH_GOOGLE_SECRET: from Google Cloud Console
- NEXT_PUBLIC_SUPABASE_URL: from Supabase dashboard
- NEXT_PUBLIC_SUPABASE_ANON_KEY: from Supabase dashboard
- SUPABASE_SERVICE_ROLE_KEY: from Supabase dashboard

**⚠️ CRITICAL: .env.local is git-ignored. NEVER commit secrets.**

**Supabase schema**: Already created in SQL editor (run lib/supabase/schema.sql)

**GitHub commit**: `scaffold dashboard with google oauth and supabase integration`

---

### Checkpoint 2: One Tool, One Agent (Days 3–5) — **NEXT**

**Goal**: Type a message, the agent calls one real MCP tool, you see a result.

**Tasks**:
1. Install Ollama locally: `brew install ollama && ollama pull llama3.1:8b`
2. Install @modelcontextprotocol/sdk: `npm install @modelcontextprotocol/sdk`
3. Get a free Brave Search API key (2,000 queries/month free) from https://api.search.brave.com
4. Create `lib/llm/client.ts` — Provider-agnostic LLM client (Ollama default, Groq fallback)
5. Create `lib/agents/planner.ts` — Planner system prompt + JSON output schema
6. Create `lib/mcp/host.ts` — MCP client instantiation for Brave Search
7. Wire a Next.js Server Action in `/api/chat` (or use Server Action directly in page)
8. Render raw summary as plain text in MessageThread

**Key implementation details**:
- Use `fetch()` to call Ollama at `http://localhost:11434/v1/chat/completions`
- Planner returns JSON: `{ thought, tool_calls[], ui_hint, requires_confirmation, summary }`
- Single-retry loop for JSON parsing failures
- For now, hardcode Brave Search MCP server (no registry UI yet)

**Expected result**: Type "search for recent news about AI agents" → LLM calls Brave Search → see results as plain text

---

### Checkpoint 3: The Dynamic Renderer (Days 6–8) — FUTURE

**Goal**: Agent responses render as UI components, not text blobs.

**Tasks**:
- Build `components/renderer/DynamicRenderer.tsx` with type switch
- Build CardComponent, CardListComponent, TableComponent
- Update Server Action to extract + parse ui_hint block
- Add JSON extraction utility with single retry
- Add TEXT as fallback renderer

**Expected result**: Search results render as shadcn/ui card list (not paragraph)

---

### Checkpoint 4: The Confirmation Card + Verifier (Days 9–13) — FUTURE

**Goal**: Agent proposes dangerous action, Verifier reviews it, human must approve.

**This is the YC demo checkpoint.**

**Tasks**:
- Build ConfirmationCard.tsx
- Write `lib/agents/verifier.ts` with strict system prompt
- Install Inngest: `npm install inngest`
- Wire `app/api/inngest/route.ts`
- Create `inngest/functions/agentWorkflow.ts` with waitForEvent pause
- Create `app/api/agent/confirm/route.ts` (human decision endpoint)
- Mock AWS tool: fake EC2 instance data
- Full flow: chat input → Inngest → Planner → mock AWS → Verifier → pending_actions → Confirmation card → Approve → execute

**Expected result**: Type "terminate idle EC2 instances" → see CONFIRMATION card with fake data → click Approve → success state

---

### Checkpoint 5: Tool Activity Feed (Days 14–15) — FUTURE

**Goal**: Right sidebar shows agent thinking in real time.

**Tasks**:
- Enable Supabase Realtime on agent_logs table
- Add logEvent calls in Inngest workflow
- Build ToolActivityFeed.tsx (subscribes to Realtime, shows live events)

**Expected result**: See "🔍 Calling brave_search..." appear in sidebar as it happens

---

### Checkpoint 6: MCP Registry UI + Scoped Sessions (Days 16–19) — FUTURE

**Goal**: Users can connect/disconnect tools; agent's toolbelt is gated by what they've connected.

**Tasks**:
- Build registry/page.tsx with ServerCard components
- Update Auth.js JWT callback to encode enabled scopes
- Update MCP host to only instantiate for enabled servers
- Build permissions/page.tsx

**Expected result**: Disconnect Brave Search → agent says "I don't have access to search"

---

### Checkpoint 7: The AWS Audit (Real) (Days 20–23) — FUTURE

**Goal**: Full workflow with real AWS credentials.

**Tasks**:
- Replace mock AWS with real MCP server (use @modelcontextprotocol/server-aws or build wrapper)
- Add aws.read, aws.write scopes
- Gate ec2_terminate_instances by scope
- Test against real AWS test account

**Expected result**: Full AWS audit flow with real instance data

---

### Checkpoint 8: Logs Page (Days 24–25) — FUTURE

**Goal**: Complete the audit trail.

**Tasks**:
- Build logs/page.tsx with paginated session table
- Click any session → see full event stream with payloads

**Expected result**: Drill into any past session and see every decision in order

---

## Key Architectural Decisions

1. **Server Actions over API routes** — Credentials stay server-side, Suspense streaming works natively
2. **Inngest waitForEvent for human approval** — No polling, no websockets; pauses the workflow until user clicks Approve
3. **One MCP client per invocation** — Stateless, no connection management; instantiate → discover → execute → close
4. **Structured output via prompt engineering** — Open-weight models (Llama) don't have reliable JSON mode; use system prompt + worked example + single-retry loop
5. **Provider abstraction** — LLM_PROVIDER env var (ollama/groq/gemini); rest of codebase is agnostic

---

## Directory Structure (Current State)

```
nexus/
├── app/
│   ├── (auth)/
│   │   └── sign-in/page.tsx              # Google OAuth sign-in
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts   # Auth.js endpoint
│   ├── dashboard/
│   │   ├── layout.tsx                    # Shell: sidebar + top nav (server component)
│   │   ├── page.tsx                      # Home: welcome page
│   │   ├── chat/page.tsx                 # (CP2) Chat interface
│   │   ├── registry/page.tsx             # (CP6) Connect MCP servers
│   │   ├── permissions/page.tsx          # (CP6) Manage scopes
│   │   └── logs/page.tsx                 # (CP8) Execution history
│   ├── layout.tsx                        # Root layout with SessionProvider
│   ├── page.tsx                          # Redirect to /dashboard
│   └── globals.css                       # Tailwind styles
├── components/
│   ├── providers.tsx                     # SessionProvider wrapper
│   ├── dashboard-shell.tsx               # Client-side sidebar/nav (uses DashboardShell in layout)
│   └── (will add: renderer/, chat/, registry/ in future checkpoints)
├── lib/
│   ├── auth/
│   │   └── actions.ts                    # Server action: handleSignOut
│   ├── supabase/
│   │   ├── client.ts                     # Supabase client singleton
│   │   └── schema.sql                    # Database schema (run in Supabase SQL editor)
│   ├── llm/
│   │   └── client.ts                     # (CP2) Unified Ollama/Groq client
│   ├── agents/
│   │   ├── planner.ts                    # (CP2) Planner prompt + invocation
│   │   ├── verifier.ts                   # (CP4) Verifier prompt + verdict parsing
│   │   └── types.ts                      # (CP2) AgentOutput, UIHint, ToolCall types
│   ├── mcp/
│   │   ├── host.ts                       # (CP2) MCP client instantiation
│   │   ├── registry.ts                   # (CP6) Read enabled servers from Supabase
│   │   └── types.ts                      # MCPServer, MCPTool types
│   └── types/
│       └── index.ts                      # Global shared types
├── types/
│   └── index.ts                          # (CP2) Global types: UIHint, UIHintType, etc.
├── auth.config.ts                        # Auth.js config with Google OAuth
├── auth.ts                               # Auth.js handler export
├── .env.local                            # Credentials (git-ignored)
├── .env.example                          # Template for credentials
├── .gitignore                            # Includes .env.local
├── package.json                          # Dependencies
├── next.config.ts                        # Next.js config
├── tsconfig.json                         # TypeScript config
├── tailwind.config.ts                    # Tailwind config
└── MEMORY.md                             # This file

**Folders to create in CP2+**:
- `app/api/inngest/` (CP4)
- `inngest/` (CP4)
- `components/renderer/` (CP3)
- `components/chat/` (CP2)
```

---

## Important Notes & Gotchas

### Auth.js v5 with Next.js
- The `(auth)` route group doesn't create a URL segment; routes inside are at the URL level. Used `(auth)/sign-in/page.tsx` → `/sign-in`.
- Similarly, `dashboard` folder (not `(dashboard)`) → routes at `/dashboard/*`.
- Auth.js v5 uses `signIn()` and `signOut()` server actions; they're called from forms with `action=` prop.
- SessionProvider is required for `useSession()` in client components; wrapped at root in `components/providers.tsx`.

### Environment Variables
- `AUTH_SECRET` is required; generated with `openssl rand -hex 32`
- Google OAuth credentials from Google Cloud Console; set redirect URI to `http://localhost:3000/api/auth/callback/google` for dev
- Supabase credentials (URL, anon key, service role key) from Supabase dashboard
- `.env.local` is git-ignored; add it to `.gitignore` if not already

### Supabase Setup
- Create free Supabase project at https://supabase.com
- Copy the schema from `lib/supabase/schema.sql` into Supabase SQL editor and run it
- Enable RLS (Row-Level Security) on all tables — policies are in schema.sql
- The schema creates user_profiles, mcp_registry, pending_actions, agent_logs tables

### Ollama Setup (for Checkpoint 2)
- Install: `brew install ollama`
- Pull model: `ollama pull llama3.1:8b` (this is large; will take a few minutes)
- Start Ollama: It runs as a background service; the pull command starts it
- Verify: `curl http://localhost:11434/v1/models` should return JSON with model info
- API endpoint: `http://localhost:11434/v1/chat/completions` (OpenAI-compatible)

### Dev Server
- Run: `npm run dev`
- Builds on file changes (Turbopack is fast)
- Warning about multiple lockfiles can be ignored (one in /Users/agastya, one in nexus/)

### Git & GitHub
- Repo initialized with `create-next-app`; GitHub remote already added
- Commit convention: all-lowercase, human-written tone
- No 'EOF' or 'Written by Claude' in commit messages
- Push after each checkpoint

---

## What the Next Claude Instance Should Know

1. **This is Checkpoint 1 complete.** The shell works; OAuth redirects correctly; Supabase schema is created. Ready for Checkpoint 2 (LLM client + Brave Search).

2. **The user's setup is ready for local dev.** They have Ollama installed locally (for testing), Google OAuth credentials, and Supabase connected. ENV vars are populated in `.env.local`.

3. **Checkpoint 2 is the next priority.** Start with:
   - Create `lib/llm/client.ts` (provider abstraction)
   - Create `lib/agents/planner.ts` (system prompt + output schema)
   - Create `lib/mcp/host.ts` (Brave Search MCP client)
   - Create `app/dashboard/chat/page.tsx` (chat interface with Server Action)
   - Wire the full flow: user message → LLM → tool → render result

4. **Key constraints to follow:**
   - Don't add error handling for impossible cases; trust internal code
   - Don't create abstractions unless needed
   - Prefer editing existing files to creating new ones
   - Default to no comments; only add if WHY is non-obvious
   - No backwards-compatibility hacks

5. **The user's preferences** (from conversation):
   - Wants commits to sound natural and human-written
   - Wants to push to GitHub after each checkpoint
   - Wants detailed memory so future Claude instances can pick up seamlessly
   - Is building a specific product with a clear 8-checkpoint implementation plan

---

## Useful Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Check TypeScript
npm run type-check

# Ollama commands (CP2)
ollama pull llama3.1:8b
ollama list

# Git workflow
git status
git add -A
git commit -m "commit message"
git push origin main

# Supabase SQL editor
# Go to https://supabase.com → your project → SQL editor
# Paste lib/supabase/schema.sql and run it
```

---

## Links & Resources

- **GitHub Repo**: https://github.com/agastya-choudhary123/nexus
- **Implementation Plan**: Full 8-checkpoint spec (this file)
- **Supabase**: https://supabase.com (free Postgres, pgvector, Realtime)
- **Ollama**: https://ollama.ai (local LLM, M-chip optimized)
- **Brave Search API**: https://api.search.brave.com (free tier: 2,000 queries/month)
- **MCP Spec**: https://modelcontextprotocol.io
- **Inngest**: https://inngest.com (workflow orchestration)
- **Vercel**: https://vercel.com (deployment, free tier)

---

**Last Updated**: 2026-05-29  
**Next Claude**: Pick up at Checkpoint 2. Start with lib/llm/client.ts.
