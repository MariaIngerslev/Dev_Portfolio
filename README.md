# Danish Blog with Security-Focused Comment URL Validation

A full-stack Danish-language blog application built with Node.js, Express 5, MongoDB, and a vanilla JavaScript SPA. The project's centrepiece is a multi-layer comment URL validation system that demonstrates security awareness and clean architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js (CommonJS), Express 5 |
| Frontend | Vanilla JavaScript (ES6+, no framework) |
| Database | MongoDB Atlas via Mongoose ODM |
| Testing | Jest 30, Supertest |
| Linting | ESLint 10 (JS, CSS, JSON, Markdown) |

---

## Features

### Multi-Layer URL Validation

Comment submissions are validated across three independent layers:

```
User types comment
     │
     ▼
[Layer 1] Client-side extraction
  extractUrls() regex — identical to server-side regex
  Provides immediate UX feedback before submission

     │
     ▼
[Layer 2] Server-side URL safety check (src/routes/comments.js)
  extractUrls() → validateUrls() → 400 Bad Request if any URL unsafe
  The server is the trust boundary; the client check is UX only

     │
     ▼
[Layer 3] Persistence
  Comment stored in MongoDB only if all URLs pass validation
```

The URL validator (`src/urlvalidator.js`) uses:
- **Set-based blacklist** — O(1) lookup vs O(n) array scan
- **Full-URL string matching** — catches path-based threats (`example.com/virus.exe`)
- **Keyword detection** — flags "unsafe" and "risky" patterns
- **Case-insensitive matching** — `VIRUS.EXE` === `virus.exe`
- **Deterministic, testable design** — no randomness, fully predictable output

### Vanilla JS Single-Page Application

- Client-side router using the History API (`pushState` / `popstate`) — deep-link and refresh support
- Pre-compiled route regex patterns (compiled once at startup, not per navigation)
- `DocumentFragment` for batched DOM updates — avoids layout thrashing
- Zero runtime client-side dependencies

**Five views:**
| Route | View |
|---|---|
| `/` | Landing page with hero section and latest post |
| `/blogposts` | Full blog post list |
| `/posts/:id` | Full post with comments and comment form |
| `/contact` | Contact form |
| `/cv` | CV / "Om mig" page |

### XSS Prevention

- `sanitizeHtml()` uses `DOMParser` + an allowlist of 12 HTML tags for safe rendering of trusted blog content
- `el()` DOM factory helper avoids `innerHTML` for user-generated content
- Href and `src` attribute validation in the sanitizer

---

## Architecture

```
src/
├── main.js                  # Composition Root — wiring only, no business logic
├── urlvalidator.js          # Set-based blacklist validator, exports validateUrls()
├── models/
│   ├── Post.js
│   ├── Comment.js
│   └── Message.js
├── routes/
│   ├── api.js               # POST /api/validate-urls
│   ├── posts.js             # GET/POST /api/posts
│   ├── comments.js          # GET/POST /api/comments
│   └── messages.js          # POST /api/messages
├── utils/
│   └── extractUrls.js       # Shared URL extraction regex (server + client)
├── middleware/
│   └── validateObjectId.js  # Reusable ObjectId param validation
└── data/
    ├── seed.js              # Initial blog post seed
    └── ralph-loop-post.js   # Second blog post seed
public/
└── client.js                # SPA router, DOM helpers, comment form logic
```

**Composition Root pattern:** `src/main.js` is wiring only — static file serving, JSON body parsing, MongoDB connection, seed data, and route mounting. No business logic lives there.

**Shared URL regex:** `src/utils/extractUrls.js` is the single source of truth for URL extraction on both the server and the client, preventing validation mismatches.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/validate-urls` | Validate an array of URLs — returns `{ allSafe, results }` |
| `GET` | `/api/posts` | List all blog posts |
| `GET` | `/api/posts/latest` | Get the most recent post |
| `GET` | `/api/posts/:id` | Get a single post by ID |
| `POST` | `/api/posts` | Create a new post |
| `GET` | `/api/comments/:postId` | Get comments for a post |
| `POST` | `/api/comments` | Submit a comment (URL validation applied) |
| `POST` | `/api/messages` | Submit a contact form message |

### URL Validation Response

```json
{
  "allSafe": false,
  "results": [
    { "url": "https://safe.example.com", "safe": true, "reason": "safe" },
    { "url": "https://badsite.test/virus.exe", "safe": false, "reason": "blacklisted" }
  ]
}
```

Possible `reason` values: `safe`, `blacklisted`, `malicious`, `malformed`.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)

### Setup

```bash
# Install dependencies
npm install

# Create a .env file with your MongoDB connection string
echo "MONGODB_URI=your_connection_string_here" > .env

# Start the development server
npm start
```

The server runs on [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test
```

40 Jest unit tests cover:
- Safe, blacklisted, and malicious URL classification
- Case-insensitive matching (`VIRUS.EXE`, `Malware.Example.Com`)
- Malformed URL handling
- URL extraction edge cases — trailing punctuation (`.`, `,`, `)`, `"`), embedded URLs in prose
- Type-safety — `null`, `undefined`, numbers, and objects passed as input must not throw
- Internationalized Domain Names (IDNs)

---

## Security

- **Defence-in-depth URL validation** — client extracts for UX, server validates as trust boundary
- **Strict `typeof` checks** on all `req.body` fields before use — guards against NoSQL injection via unexpected object types
- **XSS prevention** via `el()` factory and `sanitizeHtml()` allowlist
- **Helmet, rate limiting, and CSRF guard** applied at the Express middleware level
- **Environment variables** for all secrets — `.env` is git-ignored

---

## Express 5 Notes

This project targets Express 5, not Express 4. Key differences applied:

- Native async error propagation — rejected promises from `async` route handlers are forwarded to error-handling middleware automatically. No boilerplate `try/catch` in route handlers.
- `req.query` returns a getter (not a plain object)
- path-to-regexp v8 syntax for route patterns

---

## Project Structure Conventions

- **Language:** UI-facing text is in Danish. All code, variable names, and comments are in English.
- **CommonJS modules** throughout (`require` / `module.exports`)
- **SRP:** each module has one well-defined responsibility
- **Naming:** intention-revealing names — `classifyUrl`, `extractUrls`, `validateObjectId`, `sanitizeHtml`
