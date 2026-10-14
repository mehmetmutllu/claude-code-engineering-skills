# Working from two machines with Claude Code

> **Problem:** One developer, a laptop and a desktop, several projects with secrets and local databases: a session must know which machine it is on and whether it is safe to continue.
>
> **Practice:** Code and migrations travel via git, secrets via a separate private repo that is never named in project files; `hostname` is the identity; restore scripts are never run automatically.
>
> **Evidence:** A machine 15 commits behind produced a 10.4 MB dump that would have overwritten the current 12.8 MB one; only a rejected push stopped it.

One developer, a laptop and a desktop, several projects, each with secrets and local databases. The goal:
open a session on either machine and have Claude know exactly which machine it is on and whether it is
safe to continue.

## What travels where

| Content | Travels via | Rule |
|---|---|---|
| Code | the project's own git repo | `git pull` / `git push` |
| Schema changes | migration files in the project repo (`db/migrations/<NNN>_<name>.sql`) | **never** via a DB dump |
| Content/seed data (not personal) | the project repo (`db/seed/*.sql`) | own repo, not a shared dump |
| Secrets (`.env`, signing keys, API key files) | a **separate private repo** with collect/install scripts | never in a project repo |
| Store signing keystore | same private secrets repo | losing it = the app can never be updated again |
| Personal/local data (users, progress) | DB dump in the secrets repo | for fresh setup only |
| Backups | do not travel | local, git-ignored |

The secrets repo's name and path are **never written into project files** (CLAUDE.md, README, docs):
projects may become public later. Project docs say only "secrets are synced outside git".

## Which machine am I on?

Use `hostname`. Nothing else. Folder heuristics ("is the old web-server folder there?") were wrong because
both machines had the same folders. Fallback signal if hostname is unavailable: the git `user.email`,
which differs per machine while `user.name` is identical. Keep the hostname -> machine table in a private,
non-published note.

## Session start (first step of `/devam`, silent if fine)

```bash
hostname; cd <project> && git fetch --quiet; git status --short --branch | head -5
```
- Up to date + clean -> say nothing, continue.
- Behind + clean -> `git pull --ff-only`, one line ("3 commits came in"). Read the state files **after** the pull.
- Dirty / ahead / diverged -> **stop**, show the state, ask. No automatic rebase, reset or stash.
- Missing untracked parts (dependencies, SDK tarballs, editor install) get a table in the command file:
  symptom -> fix. Heavy installs are suggested, not run.

## Rules that came from incidents

- **Pull the secrets repo before collecting.** The shared dump contains all projects' databases. A machine
  that was 15 commits behind produced a 10.4 MB dump that would have overwritten the other machine's
  current 12.8 MB dump; only the rejected push saved it. If you already collected while behind, commit the
  `.env`/script changes but **not** the dump.
- **Never run the install script automatically.** It pipes the dump into the database server and overwrites
  local databases of every project, including migrations and test data not yet in the dump. Claude reports
  "secrets repo is behind, a secret may have changed" and the human decides.
- Because of the shared-dump conflict risk, project content data was moved into the project's own repo.
- When a secret changes in a session, the session end reminds: collect -> commit -> push on this machine,
  `pull` + install on the other.
- Both machines run the same local stack on the same non-default ports, so config never differs by machine.
- If a local service fails to start as a service on one machine, the working manual start command is
  written into the machine notes rather than rediscovered each time.

The agent's machine-local auto-memory is kept in sync by a SessionStart/SessionEnd hook: [session-sync-two-machines](../../hooks/session-sync-two-machines.md).
