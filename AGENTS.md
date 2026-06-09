# VibeGen AI Project Rules

## Project Scope

This repository is an e-commerce AIGC short video generation system. The core workflow is:

1. Material library setup
2. Product analysis
3. Script generation
4. Storyboard generation
5. Video prompt generation
6. Video generation task creation
7. Task progress query
8. Preview and export

Work must be staged. Do not rewrite the whole project in one pass. Keep changes narrow, easy to review, and compatible with the existing frontend.

## Backend Rules

- Backend code lives under `backend/`.
- Keep API responses as JSON.
- Keep route, controller, service, agent, data, utility, and type responsibilities separated.
- Stage 1 routes must use mock JSON only.
- Do not break existing endpoints while adding new ones.
- Prefer clear request validation and readable error messages.
- Do not log request headers that may contain secrets.

## Agent Rules

- Agent output should be structured and demo-friendly.
- Product information, selling points, platform, tone, duration, and video type must affect mock output.
- Agent workflow should be easy to replace with a real LLM client later.
- The planned agent chain is:
  - ProductAnalysisAgent
  - ScriptAgent
  - StoryboardAgent
  - VideoPromptAgent
  - TaskOrchestratorAgent

## API Key Safety Rules

- Never write real API keys into source code.
- Never write real API keys into README, AGENTS.md, tests, or commit messages.
- API keys must be read only from environment variables.
- `.env.example` may contain placeholders only.
- `.env`, `.env.local`, and `.env.*.local` must not be committed.
- Real Ark API calls must be disabled by default.
- When `ARK_MOCK=true`, return mock data only.
- Only when `ARK_MOCK=false` may backend code call the real Volcengine Ark API.
- Do not log API keys, `Authorization` headers, or Bearer tokens.
- If a real key starting with `ark-` is found, remove it without printing it and remind the owner to rotate the key in the provider console.

## Current Stage

Stage 1 is backend skeleton and mock API only. Real Ark integration, real model calls, embeddings, retry, trace, and orchestration belong to later stages.
