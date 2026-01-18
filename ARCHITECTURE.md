Cannabis Experience Selector — Authoritative Contract

This file is the single source of truth for system behavior.
Any agent, human or AI, must comply with this document before making changes.

0. PRIME DIRECTIVE

NO silent placeholders

NO UI rendering of internal engine objects

NO direct client → OpenAI calls

NO invented colors

NO mixed flows

If a requirement cannot be satisfied, STOP and report.

1. LAYER MODEL (AUTHORITATIVE)
Layer 0 — Static Presets

Stack Presets ONLY

No engine

No LLM

Deterministic, static data

Layer 1 — Deterministic Engine

Strain filtering

Terpene math

Scoring

Inventory constraints

No prose

No UI types

Layer 2 — LLM Orchestration

Optional but explicit

Runs after engine

Enhances clarity, reasoning, phrasing

Never invents strains or terpenes

May ask follow-up questions only if required

Layer 3 — UI Presentation

Consumes UI-safe contracts only

Never touches EngineResult directly

Never computes domain logic

2. FLOW SEPARATION (NON-NEGOTIABLE)
Stack Presets
PresetStacks
→ UIStackRecommendation
→ StackDetailScreen
(NO engine, NO LLM)

Blend Flow
User Input
→ IntentSeed(kind=blend, mode=engine)
→ Deterministic Engine
→ (Optional) LLM
→ UIBlendRecommendation
→ Blend Result UI


Preset blends are NOT results.
They only populate the input field.

3. CORE DATA CONTRACTS
IntentSeed (REQUIRED)
type IntentSeed = {
  kind: 'stack' | 'blend'
  mode: 'preset' | 'engine'
  text: string
  image?: string
}


❌ Partial objects forbidden
❌ Missing fields forbidden

Internal (ENGINE ONLY)
type EngineResult = {
  strains: string[]
  terpeneWeights: Record<string, number>
  score: number
}


❌ Must NEVER reach UI

UI Contracts (ONLY RENDERABLE TYPES)
type UIStackRecommendation = {
  kind: 'stack'
  stackId: string
  name: string
  description: string
}

type UIBlendRecommendation = {
  kind: 'blend'
  confidence: number
  strains: string[]
  terpeneProfile: Record<string, number>
  reasoning: string
}


confidence is mandatory

Derived deterministically (no constants, no stubs)

4. COLOR SYSTEM (GLOBAL INVARIANT)

All colors originate from the Strain Library

All terpene colors come from TERPENE_COLORS

No component invents color

If you see color on screen, it must answer:

“Which strain or terpene does this represent?”

If it can’t → remove it.

5. VISUAL RULES
Stack Detail

ONE card

Vertical layout only

Tip → Core → Base as sections

NO graphs

NO columns

NO grids

Graphs

Allowed ONLY on:

Stack preset cards

Blend result cards

Graph colors MUST map 1:1 to terpenes shown

6. LLM ORCHESTRATION RULES

Client NEVER calls OpenAI directly

All LLM calls go through /api/llm or server proxy

LLM must:

Name ≥3 terpenes when applicable

Respect strain library

Ask follow-ups only when necessary

If LLM fails:

UI still renders engine-derived result

Error logged once

7. SHARE SYSTEM

Share button must exist on:

Stack Detail

Blend Result

QR modal must be wired and mounted

No dead buttons

8. VERIFICATION GATE (MANDATORY)

Before ANY PR or deployment:

tsc passes with zero errors

No EngineResult reaches UI

No direct OpenAI calls in client

Colors trace back to library

Mobile layout fits without overflow

Changes are committed AND pushed

Deployment succeeded with no build errors

If any check fails → DO NOT CONTINUE

9. AGENT SAFETY CLAUSE (READ THIS)

Before executing ANY task, the agent must confirm:

Repo is clean

Branch is correct

Commits are pushed

Deployment completed successfully

Failure to verify is considered a violation.

INSTRUCTIONS (DO THIS NOW)

Create file: ARCHITECTURE.md

Paste exactly the content above

Commit with message:
chore: add authoritative architecture contract

Push to main

From now on, prepend this sentence to every Antigravity prompt:

“This repo is governed by ARCHITECTURE.md. You must comply fully before making changes.”
