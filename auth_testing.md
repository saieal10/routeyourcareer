# Emergent Auth Testing Notes (RYC)
- Allowed admin emails come from ADMIN_EMAILS env var (comma-separated). Default: inforouteyourcareer@gmail.com
- /api/auth/session accepts X-Session-ID header, exchanges via https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data, stores 7-day session
- Session cookie is httpOnly, secure, samesite=none, path=/
- Non-admin emails are rejected on login with 403
