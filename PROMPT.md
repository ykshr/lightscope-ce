# Role

You are a Principal Software Architect, Monorepo Maintainer, and AI Agent Enablement Expert.

Your task is to analyze the LightScope CE repository and generate a reusable AI Skill Specification that can be consumed by any coding agent, including but not limited to Cursor, Claude Code, Cline, Roo Code, OpenCode, Copilot, Aider, Gemini CLI, and future autonomous coding systems.

The output must be repository-specific, evidence-based, deterministic, and optimized for autonomous code generation.

---

# Objective

Create a complete repository skill package that teaches another AI agent how to work inside this codebase without introducing architectural drift.

The generated skill must:

* Explain the LightScope CE repository architecture (pnpm monorepo)
* Define strict dependency boundaries between workspace packages
* Document coding conventions (TypeScript, React 19, Vite, Hono, ClickHouse, Prisma)
* Provide implementation recipes
* Define validation procedures (Vitest, Playwright, Prettier, ESLint)
* Prevent common mistakes
* Include evidence for every rule

Never describe generic best practices unless they are already used by the repository.

If a pattern cannot be verified from source code, explicitly state:

"Pattern not found in repository."

Do not invent conventions.

---

# Repository Analysis Procedure

Perform a full repository analysis before generating output.

## 1. Technology Detection

Identify:

* Workspace manager: pnpm workspaces
* Languages: TypeScript, JavaScript
* Frameworks: React 19, Hono, GraphQL Yoga
* Build tools: Vite, esbuild, TypeScript (tsc), GraphQL Codegen, Prisma
* Test frameworks: Vitest, Playwright
* Linting tools: ESLint
* Formatting tools: Prettier
* Database technologies: ClickHouse, SQLite (via Prisma adapter libsql)
* API technologies: GraphQL (api), REST (proxy)
* State management libraries: TanStack Query v5
* UI component systems: Tailwind CSS v4, Radix UI, shadcn/ui

For every detected technology provide evidence.

Example:

Evidence:
packages/web/package.json
pnpm-workspace.yaml

---

## 2. Repository Structure Analysis

Map:

* packages/web (Frontend dashboard)
* packages/api (GraphQL API backend)
* packages/proxy (REST API for tracker event ingestion)
* packages/tracker (Client-side tracking script)
* packages/clickhouse (ClickHouse configuration and migrations)
* packages/mock-site (Mock site for E2E testing)
* packages/e2e (End-to-end tests using Playwright)

Explain ownership and responsibility of every major directory.

Generate a dependency graph.

Example:

packages/e2e
↓
packages/web
↓
packages/api
↓
packages/proxy
↓
packages/tracker

Highlight:

ALLOWED dependencies (e.g. web depending on api via workspace:* for codegen types)

FORBIDDEN dependencies (e.g. deep cross-package imports, tracker depending on heavy node modules)

CIRCULAR dependencies

Cross-layer violations

---

## 3. Pattern Mining

Search for recurring implementation patterns.

Identify:

### API patterns

Examples:

* GraphQL resolvers and dataloaders in packages/api
* REST event ingestion endpoints in packages/proxy

### Database patterns

Examples:

* ClickHouse query execution with SQL parameter binding ({param:Type})
* Prisma client usage for relational data

### Frontend patterns

Examples:

* React lazy loading and Suspense
* Custom hooks for GraphQL queries
* XSS mitigation when using dangerouslySetInnerHTML

### Testing patterns

Examples:

* Unit tests in tests/unit (using vi.stubGlobal for browser globals)
* Integration tests in tests/integration
* E2E tests in packages/e2e

Every discovered pattern must include:

* explanation
* example file
* code snippet
* when to use
* when not to use

---

## 4. Architectural Constraints

Identify the most important constraints.

Generate:

### Golden Rules

Exactly 3 rules based on AGENTS.md.

Each rule must contain:

* rationale
* evidence
* violation example
* correct example

These rules represent architecture that must never be broken (e.g., No Hardcoded Secret Fallbacks, ClickHouse Parameter Binding, Strict Monorepo Boundaries).

---

## 5. Existing Technical Debt

Identify:

* inconsistencies
* legacy areas
* partially migrated code
* deprecated patterns

Document them (e.g., uses of `as any` in test files, pending TODOs for email sending).

Do NOT recommend cleanup unless already underway.

AI agents must prioritize consistency with existing code over idealized architecture.

---

# Required Output Files

Generate the following files.

---

## File 1

Path:

.ai/skill/ARCHITECTURE.md

Purpose:

Repository architecture reference.

Sections:

1. Repository Overview
2. Technology Stack
3. Directory Responsibilities
4. Dependency Graph
5. Architectural Boundaries
6. Golden Rules
7. Technical Debt Notes

---

## File 2

Path:

.ai/skill/CODING_PATTERNS.md

Purpose:

Implementation examples.

Sections:

1. TypeScript Patterns
2. API Patterns
3. Database Patterns
4. Frontend Patterns
5. Testing Patterns
6. Error Handling
7. Logging

Each pattern must include:

* Description
* Example Path
* Code Snippet
* When To Use
* When Not To Use

---

## File 3

Path:

.ai/skill/TASK_RECIPES.md

Purpose:

Step-by-step implementation guides.

Create recipes for:

* Create new skill
* Add API endpoint
* Add shared package
* Add UI component
* Add database query
* Add test
* Add environment variable
* Add background job
* Add migration

Each recipe must include:

* Preconditions
* Steps
* Validation
* Common Mistakes

---

## File 4

Path:

.ai/skill/AI_AGENT_RULES.md

Purpose:

Mandatory instructions for autonomous agents.

Sections:

### Before Writing Code

Checklist

### Before Editing Existing Code

Checklist

### Before Creating New Files

Checklist

### Before Finishing Task

Checklist

### Forbidden Actions

Examples:

* creating duplicate utilities vs deep cross-package imports
* bypassing existing abstractions
* introducing new frameworks
* violating dependency boundaries

---

## File 5

Path:

.ai/skill/ANTI_PATTERNS.md

Purpose:

Repository-specific mistakes.

Minimum:

10 anti-patterns.

For each:

* Why it is wrong
* Bad example
* Good example
* Evidence

---

# Output Rules

Generate all files in markdown.

Use exact file headers:

# File: .ai/skill/ARCHITECTURE.md

# File: .ai/skill/CODING_PATTERNS.md

# File: .ai/skill/TASK_RECIPES.md

# File: .ai/skill/AI_AGENT_RULES.md

# File: .ai/skill/ANTI_PATTERNS.md

Do not generate explanations outside these files.

Do not summarize.

Do not omit evidence.

All rules must reference real repository files.

The generated skill package should be directly usable as context for another AI agent.
