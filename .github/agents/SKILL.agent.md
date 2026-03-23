---
name: code-review
classification: workflow
classification-reason: Process automation persists regardless of model advancement
deprecation-risk: none
description: |
  Code review skill for analyzing code quality, detecting bugs, and ensuring best practices.
  Provides comprehensive code review with actionable feedback.

  Use proactively when user requests code review, quality check, or bug detection.

  Triggers: code review, review code, check code, analyze code, bug detection,
  코드 리뷰, 코드 검토, 버그 검사, コードレビュー, バグ検出, 代码审查, 代码检查,
  revisión de código, revisar código, detección de errores,
  revue de code, réviser le code, détection de bugs,
  Code-Review, Code überprüfen, Fehlererkennung,
  revisione del codice, rivedere codice, rilevamento bug

  Do NOT use for: design document creation, deployment tasks, or gap analysis (use phase-8-review).
argument-hint: "[file|directory|pr]"
user-invocable: true
agent: bkit:code-analyzer
allowed-tools:
  - Read
  - Glob
  - Grep
  - LSP
  - Task
  - Bash
imports:
  - ${PLUGIN_ROOT}/templates/pipeline/phase-8-review.template.md
  - .github/agents/copilot-instructions.md
next-skill: null
pdca-phase: check
task-template: "[Code-Review] {feature}"
hooks:
  Stop:
    - type: command
      command: "node ${CLAUDE_PLUGIN_ROOT}/scripts/code-review-stop.js"
      timeout: 10000
---

# Code Review Skill

> Skill for code quality analysis and review.
> The categories below cover only what no specialized agent handles.
> See Agent Integration for delegation boundaries.

Be critical. Every issue must be reported regardless of perceived severity.
Do not soften findings. Do not skip minor issues.

## Arguments

| Argument      | Description             | Example                        |
| ------------- | ----------------------- | ------------------------------ |
| `[file]`      | Review specific file    | `/code-review src/lib/auth.ts` |
| `[directory]` | Review entire directory | `/code-review src/features/`   |
| `[pr]`        | PR review (PR number)   | `/code-review pr 123`          |

## Review Categories

> Already covered by specialized agents — do NOT duplicate here:
>
> - Duplicate code, complexity, naming → `code-reviewer`
> - XSS/CSRF, re-renders, Next.js patterns → `nextjs-architect`
> - N+1, blocking ops, optimization → `performance-engineer`
> - Schema, indexes, queries → `database-architect`
> - NestJS modules, controllers, DTOs → `nestjs-architect`

### 1. Type Safety

- Type safety verification
- Missing or incorrect TypeScript types
- Unsafe type assertions (`as`, `!`)

### 2. Bug Detection

- Potential bug pattern detection
- Null/undefined handling check
- Error handling inspection
- Boundary condition verification

### 3. Security

- SQL Injection pattern detection
- Sensitive information exposure check (tokens, secrets, env vars in code)
- Authentication/authorization logic review
- Memory leak pattern detection

## Review Output Format

```
## Code Review Report

### Summary
- Files reviewed: N
- Issues found: N (Critical: N, Major: N, Minor: N)
- Score: N/100

### Critical Issues
1. [FILE:LINE] Issue description
   Suggestion: ...

### Major Issues
...

### Minor Issues
...

### Recommendations
- ...
```

## Agent Integration

This Skill calls the `code-analyzer` Agent for in-depth code analysis.

| Agent                | Role                                                   |
| -------------------- | ------------------------------------------------------ |
| code-analyzer        | Code quality, security, performance analysis           |
| code-reviewer        | SOLID, naming, complexity — language-agnostic          |
| nextjs-architect     | App Router, SSR/SSG/ISR, React hooks, Next.js security |
| performance-engineer | API latency, blocking ops, N+1, LCP/FID/CLS            |
| database-architect   | Schema, indexes, joins, query optimization             |
| nestjs-architect     | NestJS modules, controllers, services, DTOs            |

## Usage Examples

```bash
# Review specific file
/code-review src/lib/auth.ts

# Review entire directory
/code-review src/features/user/

# PR review
/code-review pr 42

# Review current changes
/code-review staged
```

## Confidence-Based Filtering

code-analyzer Agent uses confidence-based filtering:

| Confidence      | Display           | Description           |
| --------------- | ----------------- | --------------------- |
| High (90%+)     | Always shown      | Definite issues       |
| Medium (70-89%) | Selectively shown | Possible issues       |
| Low (<70%)      | Hidden            | Uncertain suggestions |

## PDCA Integration

- **Phase**: Check (Quality verification)
- **Trigger**: Auto-suggested after implementation
- **Output**: docs/03-analysis/code-review-{date}.md
