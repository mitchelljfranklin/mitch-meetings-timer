# Security Policy

## Supported versions

This project is distributed as a Microsoft Teams app. Only the latest release on
the `main` branch receives security updates.

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately using GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
(the **Security** tab → **Report a vulnerability**), or email
`PLACEHOLDER@example.com`.

Please include:

- A description of the issue and its impact.
- Steps to reproduce.
- Affected version or commit.

We aim to acknowledge reports within 5 business days.

## Notes for this app

- The app does not implement SSO and stores no user credentials.
- All timer state is held in the browser; nothing is persisted server-side.
- Dependencies are monitored via `npm audit` in CI and Dependabot updates.
