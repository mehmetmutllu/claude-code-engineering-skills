# Verify the live site against the repo — `git diff` won't tell you

> **Problem:** Without git-based deploys files are uploaded selectively; the live site silently diverges from the repo, and uploading "just one file" can undo other work.
>
> **Practice:** Hash-compare repo and live before uploading; split new and changed files for panels that don't overwrite; after the user says "uploaded", produce a per-file CURRENT/OLD table.
>
> **Evidence:** Of 196 tracked files, 88 were identical, 31 different and 77 missing on live; a 164-file panel upload silently skipped 72 changed images.

## Case 1 — hash comparison revealed a split-brain site

A nonprofit site deployed by uploading changed files over SSH. A comparison of all tracked PHP/JS/CSS files by md5: **88 identical, 31 different, 77 missing on live** out of 196. A whole module was missing (intentional — not yet released), but 31 files were *older* on live, and a feature finished a week earlier had never been deployed.

The concrete danger: uploading one changed form page alone would have **removed** a working digits-only input filter on live, because the repo version replaced the inline JS with a shared helper script that didn't exist on live yet.

Procedure (generic):
```bash
# repo side, ignore CRLF differences
git ls-tree -r --name-only HEAD | grep -E '\.(php|js|css)$' \
  | grep -v '^docs/\|^db/\|^tools/\|^tests/\|^\.claude/' | sort > list.txt
while read f; do
  echo "$(git show HEAD:"$f" | tr -d '\r' | md5sum | cut -d' ' -f1)  $f"
done < list.txt > repo.txt
# live side: same loop over SSH, printing "MISSING  <file>" for absent files → live.txt
join -j 2 <(sort -k2 repo.txt) <(sort -k2 live.txt) | awk '$2 != $3 {print $1}'
```
Rule: if a file you changed is *older* on live, read its diff — when you upload it, you're shipping more than your change. Upload its dependencies with it.

## Case 2 — the hosting panel does not overwrite

An education site's host offered only a web file manager (no SSH, no FTP in use). **The panel silently skips files that already exist**, and zip "extract" doesn't overwrite either. A 164-file package: 18 PHP files and 72 *new* images went up, **72 *changed* images were skipped**. The user said "uploaded", the site was half-updated. A month earlier the same class of failure had made the user consider rewriting the code from scratch — the problem was always the transfer, never the code.

Procedure:
1. Split the package: **new files** (upload directly) and **changed files** (user selects and deletes them on the panel, *then* uploads).
2. Account for the user's selection pattern: they select with wildcards (`gallery-*-380`), which may cover more than the "changed" list — include every covered file in the delete-and-upload folder, or they'll be deleted and never come back (list 73 → selection 87 → folder completed to 87).
3. Never "delete the whole uploads folder": live may hold panel-uploaded files that don't exist locally.
4. **When the user says "uploaded", never assume.** Produce a per-file CURRENT/OLD table: grep a signature string in live HTML; for files without a visible signature compare byte size; for images compare `curl -w '%{size_download}'` with local size. Space requests (the host's bot protection triggered after ~3 fast requests → `sleep 6`). This table turned out to be the most useful artifact for the user.

## General rules

- Deploy = staging first, user approval, then production (where a pipeline exists — see [ci-quality-gates](ci-quality-gates.md)).
- Schema changes travel as migration files, never as dumps — two machines and a server must not end up with new code on an old DB.
- What goes to production is decided by measurement (`git diff --name-only` against the last deployed state *and* a live hash check), not by memory.
