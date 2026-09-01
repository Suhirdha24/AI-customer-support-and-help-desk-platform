# Security Architecture & Best Practices

OmniSupport AI incorporates comprehensive security controls across transport, authentication, authorization, storage, and logging.

---

## 1. Authentication & Session Management

- **Password Storage**: Encrypted with `bcryptjs` using 10 salt rounds. Plaintext passwords are never logged, stored, or cached.
- **JWT Issuance**: Signed using HMAC-SHA256 with an environment-specified secret (`JWT_SECRET`). Tokens contain `{ id, email, role, teamIds }` with an expiration window.
- **Stateless Verification**: Every authenticated request passes through `auth.middleware.ts`, which extracts and verifies the `Authorization: Bearer <token>` header. If the account is deactivated (`isActive: false`), requests are immediately rejected with `401 Unauthorized`.

---

## 2. Transport Security & Network Protection

- **HTTP Security Headers**: Powered by `helmet`, enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict referrers.
- **Cross-Origin Resource Sharing (CORS)**: Explicitly configured to allow authorized client origins (`CLIENT_URL`) with preflight cache support.
- **Rate Limiting**: Protects authentication endpoints against credential stuffing and brute-force attacks via `express-rate-limit`:
  - `/api/auth/*`: Capped at 15 requests per 15 minutes per IP. Exceeding limits returns `429 Too Many Requests`.

---

## 3. Input Validation & Injection Prevention

- **Zod Schema Invariant Checking**: Every mutating endpoint validates request bodies and query parameters with typed Zod schemas. Any extraneous or malformed fields are rejected before reaching controller logic.
- **NoSQL Injection Defense**: All MongoDB operations use Mongoose schemas with typed casting. Raw user inputs are never passed into `$where` or JavaScript evaluation functions.

---

## 4. Log Sanitization & Redaction

Production logs (Winston) format all incoming HTTP requests and internal error traces. To prevent data leakage into log aggregators:
- `logger.ts` intercepts all log entries and recursively scrubs fields matching:
  - `password`
  - `token`
  - `authorization`
  - `secret`
  - `creditCard` / `apiKey`
- Bearer tokens are truncated to `Bearer [REDACTED]`.

---

## 5. File Attachment Security

Support tickets frequently require logs and screenshots. The attachment pipeline enforces strict safety:
- **Whitelisted File Extensions**: Only `.png`, `.jpg`, `.jpeg`, `.pdf`, `.log`, `.txt`, `.json`, `.csv` are permitted. Executables (`.exe`, `.bat`, `.sh`, `.php`, `.js`) are blocked at the Multer filter with `400 Bad Request`.
- **Size Bounds**: Files are limited to 10MB each.
- **Unique Storage Keys**: Filenames are renamed on disk to `${Date.now()}-${randomHex}.${ext}`, preventing filename collision and path traversal attacks (`../../etc/passwd`).
- **Authorized Downloads**: Files cannot be accessed through static asset directories. They are served exclusively via `GET /api/tickets/:id/attachments/:storageKey`, which verifies that the requesting user has explicit permission to view the parent ticket.
