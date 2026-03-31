# Security Checklist

Immediate (done):
- Rotate any leaked secrets and revoke compromised tokens.
- Remove temporary files containing secrets from repository history.

Repository & CI:
- Enable secret scanning in GitHub settings.
- Add `secret-scan.yml` Action (trufflehog) to scan PRs and pushes.
- Run `npm audit` on PRs and fail PRs for high severity.

Runtime & App:
- Use secure cookies (`httpOnly`, `SameSite=Strict`, `secure`).
- Ensure `NEXTAUTH_SECRET` is strong and rotated periodically.
- Use CSP in report-only mode in staging; review reports and then enforce.
- Use Redis/Upstash for rate-limiting in production.

Monitoring & Response:
- Configure Sentry (set `SENTRY_DSN`) for error capturing.
- Add alerts for spikes in failed sign-ins or registrations.

Operational:
- Store secrets in provider env (Netlify) and do not commit them.
- Schedule weekly dependency audits and apply Dependabot PRs.

If you want, I can automate any of the checklist items above.
