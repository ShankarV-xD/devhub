# Changelog

All notable changes to DevHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### ✨ Features

- Mobile UX optimization (touch targets, haptic feedback, swipe gestures, share sheet)
- Encrypted localStorage history via AES-256 (`secureStorage`)
- Web Share API integration for native OS share dialog
- Swipe left/right to switch JSON view modes (raw → tree → table)
- Pull-to-refresh prevention on editor scroll container

### 🔒 Security

- Content Security Policy (CSP) headers via `next.config.ts` and middleware
- HTTP → HTTPS redirect + HSTS in production
- Server-side IP-based rate limiting on `/api/proxy` (30 req/min) and `/api/shorten` (20 req/min)
- Per-request nonce-based CSP via `src/middleware.ts`

### ⚙️ DevOps

- GitHub Actions CI/CD pipeline (lint → type-check → test → build → deploy)
- Pre-commit hooks via Husky + lint-staged
- Commit message validation via commitlint (Conventional Commits)
- Changelog automation via standard-version
- Dependabot auto-update PRs (weekly)

### ♿ Accessibility

- WCAG 2.5.5 compliant touch targets (≥44px) on all interactive elements
- Virtual keyboard layout fix with `useKeyboardHeight` hook
- `scrollIntoView` on textarea focus for iOS/Android

---

## [1.0.0] - 2026-01-15

### ✨ Features

- Initial release
- Auto-detection engine for 20+ content types (JSON, JWT, Base64, SQL, YAML, CSV, XML, HTML, Markdown, Regex, URL, Color, GraphQL, CSS, Code, Cron, Timestamp, Image, Todo)
- JSON formatter with tree and table views
- JWT decoder with signature verification
- Base64 encode/decode (text + image)
- UUID, hash (MD5/SHA-1/SHA-256/SHA-512) generators
- SQL formatter
- Regex tester with real-time match highlighting
- Color picker and converter (HEX/RGB/HSL)
- URL encoder/decoder and shortener
- Markdown and HTML preview
- YAML ↔ JSON conversion
- CSV viewer
- Diff mode (compare before/after)
- Dark mode only — purpose-built for developers
- URL state persistence (share any content via URL)
- History panel (last 10 sessions, stored locally)
- Command palette (Ctrl+K)
- Keyboard shortcuts throughout
- PWA support (installable, offline-capable)
- PostHog analytics integration
- Monaco editor integration for code highlighting
