# Professional Portfolio Summary
## Danish Blog Application with Security-Focused Comment Validation

---

## Context

This analysis is based on a full review of the project's git history (117 commits), source code, test suites, and architectural documentation. The goal is to produce employer-facing talking points for the Aarhus, Denmark IT market (Systematic, Netcompany, Bankdata, modern tech agencies).

---

## 1. Tech Stack & Tooling

### Languages
| Layer | Technology |
|---|---|
| Backend | Node.js (CommonJS) |
| Frontend | Vanilla JavaScript (ES6+, no framework) |
| Markup / Styling | HTML5, CSS3 |
| Query Language | MongoDB Query Language (via Mongoose ODM) |

### Frameworks & Libraries
| Purpose | Technology | Version |
|---|---|---|
| Web framework | **Express 5** | ^5.2.1 |
| ODM / Database | **Mongoose** | 9.2.0 |
| Unit Testing | **Jest** | ^30.2.0 |
| Integration Testing | **Supertest** | ^7.2.2 |
| Linting | ESLint 10 (JS, CSS, JSON, Markdown) | ^10.0.0 |
| Env management | dotenv | ^17.2.4 |

### Database & Infrastructure
- **MongoDB Atlas** — document database, cloud-hosted
- **Mongoose ODM** — schema definition, validation, indexing (`postId` indexed on Comment model)
- **Environment variables** — `MONGODB_URI` / `MONGO_URI` (git-ignored `.env`)

### Frontend Architecture
- **Single-Page Application (SPA)** built with vanilla JS and the **History API** (`pushState` / `popstate`)
- **Pre-compiled route patterns** (regex compiled once at startup, not per navigation)
- **DocumentFragment** for batched DOM updates
- Zero runtime dependencies on the client

---

## 2. Key Learnings & Professional Growth

### Core Concepts Implemented

**Full-Stack REST API Design**
- Built four route modules (`api`, `posts`, `comments`, `messages`) with clear resource separation
- Implemented standard HTTP semantics: `GET`, `POST`, correct status codes (`200`, `201`, `400`, `404`, `500`)
- Composition Root pattern in `src/main.js` — wiring only, no business logic in the entry point

**Database & Persistence**
- Mongoose schema definitions with types, defaults, and required constraints
- ObjectId-indexed foreign key (`postId` on Comment) for query performance
- Upsert-based seeding strategy (`findOneAndUpdate` with `upsert: true`) — idempotent restarts

**Input Validation & Security Awareness (URL Validator Feature)**

This is the project's strongest portfolio differentiator. The comment submission flow implements **defence in depth** across three layers:

```
User types comment
     │
     ▼
[Layer 1] Client-side extraction
  extractUrls() regex → identical to server-side regex
  Provides immediate UX feedback before submission

     │
     ▼
[Layer 2] Server-side URL safety check (src/routes/comments.js)
  extractUrls() → validateUrls() → 400 Bad Request if any URL unsafe
  Critical: server is the trust boundary; client check is UX only

     │
     ▼
[Layer 3] Persistence
  Comment stored in MongoDB only if all URLs pass validation
```

The validator (`src/urlvalidator.js`) demonstrates:
- **Set-based blacklist** for O(1) lookup (vs O(n) Array.includes)
- **Full-URL string matching** — catches path-based threats (`example.com/virus.exe`)
- **Keyword detection** — flags "unsafe" and "risky" patterns
- **Case-insensitive matching** — `VIRUS.EXE` === `virus.exe`
- **Deterministic, testable design** — no randomness, fully predictable output

**XSS Prevention**
- `sanitizeHtml()` uses `DOMParser` + allowlist of 12 HTML tags — safe rendering of trusted blog content
- `el()` DOM factory helper — avoids `innerHTML` for user-generated content
- Href and `src` attribute validation in the sanitizer

**Single-Page Application Patterns**
- Client-side router with History API — deep-link support, no page reloads
- Catch-all server route (`/{*path}`) serves `index.html` for all non-API paths
- Pre-compiled route regex patterns, paramName extraction
- `DocumentFragment` for batch DOM updates — avoids layout thrashing

**Clean Code & Modular Architecture**
- Strict Data Access / DOM Manipulation separation in `client.js`
- Reusable `validateObjectId` middleware (used by two route modules)
- Shared `extractUrls` utility — single source of truth for URL regex on server and client
- Each module ≤ 62 lines; each function has a single, well-defined responsibility

---

## 3. Enterprise-Ready Skills (Aarhus Market Focus)

### Clean Code & SOLID Principles

| Principle | Evidence in Codebase |
|---|---|
| **SRP** (Single Responsibility) | Each route module handles exactly one resource; `urlvalidator.js` does validation only; `extractUrls.js` does extraction only |
| **DRY** | `extractUrls` shared between `comments.js` route and `client.js` (documented sync requirement in CLAUDE.md); `validateObjectId` middleware reused across two routes |
| **Open/Closed** | `validateUrls()` accepts any URL array; blacklist expandable without changing function signature |
| **Separation of Concerns** | Composition Root pattern (`main.js` = wiring only); Data Access vs DOM Manipulation separation in `client.js` |
| **Naming** | Intention-revealing names throughout: `classifyUrl`, `extractUrls`, `validateObjectId`, `sanitizeHtml`, `checkUrlSafety` |

### Version Control Discipline

The 117-commit history shows **logical, atomic commits** with clear conventional-commit-style messages:

- `feat(ui): establish blog-first visual hierarchy...`
- `fix(seed): stop creating duplicate posts on restart`
- `fix(content): remove duplicate flow label and reposition terminal image`
- `feat(security): add url validation to comment submission`

**Progression visible in history:**
1. Foundation → basic Express + MongoDB wiring
2. Security layer → URL validator, XSS mitigation
3. Modularisation → extract utilities, middleware, route modules
4. Frontend SPA → History API router, pre-compiled patterns
5. UX polish → responsive layouts, animations, Danish localisation
6. Documentation → CLAUDE.md as "project constitution"

This demonstrates **iterative delivery** — each commit addresses one concern, making the history auditable and the diff reviewable.

### Transitioning to Enterprise-Level Engineering

| Self-taught pattern | Enterprise pattern demonstrated in this project |
|---|---|
| Monolithic scripts | Composition Root + route modules + middleware |
| No validation | Strict `typeof` checks on all `req.body` fields |
| No tests | 40 Jest unit tests across two utility modules |
| Ad-hoc security | Defence-in-depth URL validation (client + server + DB layer) |
| Hardcoded state | Environment variables for connection strings |
| Mutable globals | Immutable Set-based blacklist |
| innerHTML everywhere | `el()` DOM factory + `sanitizeHtml()` + allowlist |
| Comments as afterthought | CLAUDE.md documents architecture, conventions, and rationale |

### Express 5 Knowledge (Modern & Sought-After)
- Understands Express 5 vs 4 API differences (path-to-regexp v8, `req.query` getter)
- Uses native async error propagation — no boilerplate `try/catch` in route handlers
- Applies this knowledge explicitly in CLAUDE.md as an architectural decision

---

## Portfolio Summary: Elevator Pitch (Cover Letter Cheat Sheet)

> "I built a full-stack Danish blog application using Node.js, Express 5, MongoDB, and a vanilla JavaScript SPA. The project's centrepiece is a multi-layer comment URL validation system that demonstrates security awareness: URLs are extracted client-side for UX feedback, then independently validated server-side before persistence — the server is the trust boundary. The validator uses a Set-based blacklist with O(1) lookup and keyword detection, is fully deterministic, and is covered by 24 Jest unit tests including edge cases, type-safety checks, and IDN handling. The codebase follows Clean Code principles — SRP, DRY, separation of concerns — with 117 atomic commits showing a progression from initial wiring through security, modularisation, and UX polish. I documented the architecture and conventions in a CLAUDE.md 'project constitution', which reflects the kind of knowledge transfer and team-readiness expected in professional engineering teams."

---

## Key Talking Points by Company Type

**Enterprise / Finance (Bankdata, Jyske Bank IT)**
- MongoDB schema validation + strict type checking = data integrity
- Defence-in-depth security model
- 40 unit tests, predictable/deterministic validator
- Documented conventions (CLAUDE.md) for team onboarding

**Consulting / Nearshore (Netcompany, Devoteam)**
- Clean, modular Express 5 architecture
- Atomic git history — readable, reviewable, auditable
- Full-stack: REST API + SPA + database + testing + linting

**Product / Scale-up (Systematic, Mjølner, Trifork)**
- Modern stack: Express 5, Mongoose 9, Jest 30, ESLint 10
- Performance-aware decisions: O(1) Set lookup, pre-compiled route regex, DocumentFragment batching
- Security-first mindset: XSS prevention, NoSQL injection prevention, input sanitisation

---

## Verification
Run `git log --oneline | wc -l` (commit count: 117) and `npm test` (40 tests passing) to verify claims.
