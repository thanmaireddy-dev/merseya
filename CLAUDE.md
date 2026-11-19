# CLAUDE.md: instructions for Claude Code sessions on Merseya

Merseya Jewellery is a real e-commerce store for an Ontario jewellery business: Next.js full-stack, TypeScript, PostgreSQL (Neon) with Prisma, and Stripe Checkout, hosted on Vercel.
**`plan.md` is the source of truth** for scope, architecture, schema, roadmap and open decisions. Read the relevant section before starting a task, and update `plan.md` when a decision changes. Don't duplicate it here.

---

## 1. How to work with the developer

The developer is a final-year CS student building their first production app. Learning matters as much as shipping.

- **Teach before implementing.** For each significant feature, cover the objective, the approach, the files involved, and how it connects to the rest of the app. Keep routine work concise.
- Work in **small tasks**. Never dump large amounts of code. Explain the important code after writing it.
- **Stop and ask** when a business or architectural decision is needed. Offer options with an honest recommendation, and challenge weak ideas.
- Never claim something works until it has been tested. A passing local build doesn't prove production readiness.
- After important features, add an entry to `docs/interview-notes.md`: the concept, how Merseya implements it, the trade-offs, and likely interview questions.

## 2. Non-negotiable rules

- **Never invent** business information, product specs, reviews, warranties, certifications or "worth $X" claims. Use only real product photos. Never present AI-generated jewellery images as products.
- **Secrets:** never put them in client code, Git, logs or chat. Use `.env*` files, which are git-ignored; `.env.example` holds placeholders only.
- **Payments:** only the verified Stripe webhook marks an order PAID. Prices and stock are always computed on the server from the database. Never store card data.
- **Money:** store amounts as integer cents (CAD). Never use floats.
- **Database:** no destructive commands (drop, reset, `migrate reset`, deleting rows) on any shared or production database without explicit approval and a verified backup. Deactivate products; never delete them.
- **Admin:** check authorisation inside every admin page and Server Action, not only in middleware.
- Don't add technologies or features that aren't agreed in `plan.md`.

## 3. Code conventions

- TypeScript in strict mode. Validate all external input (Server Action arguments, catalogue data, environment variables) with Zod.
- Server Components by default. Add `"use client"` only for interactive pieces.
- Server Actions handle mutations from our own UI; Route Handlers handle external callers (the Stripe webhook, Auth.js).
- Business logic lives in `src/server/`, server-only. Shared helpers live in `src/lib/`.
- Use brand tokens (plum, rose, blush, ivory, deep-plum, charcoal) instead of raw hex values in components. Rose is not for body text, because its contrast is too low.
- Use logos from `public/images/brand/` as supplied. Never recolour or redraw them.
- File names in kebab-case; React components in PascalCase.

## 4. Git workflow: the developer runs Git, Claude does not

The developer manages **all** Git and GitHub operations personally, to learn professional version control.

### 4.1 Forbidden for Claude
Never run Git or GitHub commands that change local or remote state, including:
`git add`, `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git checkout`, `git switch`, `git reset`, `git cherry-pick`, `git stash`, `git branch -d`/`-D` (or any branch creation), `git tag`, `gh pr create`, `gh pr merge`, and any `gh` command that creates or changes something.
Never change Git config or remotes without discussing it first. If a Git operation is needed, explain it and give the exact command; the developer runs it.

### 4.2 Allowed (read-only, only when needed)
`git status`, `git branch`, `git log`, `git diff`, `git remote -v`, `git show`, `gh pr view`, `gh repo view`.
**Always check the current branch with `git status` before writing a handoff.** Never assume or invent a branch name.

### 4.3 Branching model
1. Start from an up-to-date `main`.
2. Create a feature branch.
3. Implement, test and review.
4. Commit.
5. Push the branch.
6. Open a Pull Request.
7. Review the Vercel preview.
8. The developer merges.
9. Start the next branch.

- `main` must always be stable and deployable.
- Branch names: `feature/<name>`, `fix/<name>`, `docs/<name>`, `chore/<name>`, `refactor/<name>`, `test/<name>`. Recommend one when a new piece of work starts.
- If the developer is already on a suitable feature branch, don't suggest a new one.
- The developer pushes after every change, even small ones. Every recommended commit must be coherent and verified. **Never recommend committing broken or untested work.** Say what must be fixed or tested first.

### 4.4 Required ending for every coding task: GIT HANDOFF

Every meaningful coding or documentation task ends with this section:

```
## GIT HANDOFF: YOUR NEXT ACTIONS

A. Changes made
   - Created / modified / deleted files (with paths)
   - What functionality was implemented
   - Whether dependencies or configuration changed (package.json, lockfile, env, config files)
   - Whether this is a meaningful commit (if not, say "No commit needed" and why)

B. Commit message
   - One Conventional Commit message (feat:, fix:, docs:, style:, refactor:, test:, chore:)

C. Commands (in order)
   - Based on the actual current branch (checked with git status)
   - Stage specific files by path; avoid `git add .` unless every change is intended
   - Explain how deleted or renamed files get staged (git add <path> / git rm <path>)
   - New branch: include `git switch -c <branch>` and `git push -u origin <branch>`

D. What each command does
   - 1–2 sentences per command: what it does, why it's needed, the expected result

E. Next GitHub action
   - Keep working on this branch / push more commits / open a PR / update the PR / review the preview / merge
```

When a feature is ready for a Pull Request, also provide:
- a PR title;
- a concise description: summary, what was implemented, testing performed, known limitations, anything needing special review;
- a checklist of what to inspect on the Vercel preview URL.

Never open, merge or approve PRs yourself.
