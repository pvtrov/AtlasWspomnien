# Git Workflow

## Purpose

This document defines the Git branching strategy for the project so implementation work can proceed in a consistent and predictable way.

## Main Branches

The repository uses two primary long-lived branches:

- `main`
- `develop`

### `main`

`main` is the official stable branch.

It should contain only code that:

- is working,
- has been reviewed or accepted,
- represents a stable project state.

### `develop`

`develop` is the main integration branch for ongoing implementation work.

Completed feature work should be prepared to merge into `develop` first, not directly into `main`.

## Working Branches

All implementation branches should be created from `develop`.

Working branches should use the following naming convention:

- `feature/<task-name>`

Examples:

- `feature/backend-scaffolding`
- `feature/frontend-scaffolding`
- `feature/database-foundation`
- `feature/frontend-backend-connectivity`

## Rules for Implementation Threads and Agents

- Start your work from `develop`.
- Create a dedicated branch for the assigned scope.
- Keep the branch focused only on the assigned task or work package.
- Prepare changes to merge back into `develop`.
- Do not target `main` directly unless explicitly instructed.

## Recommended Usage

The recommended workflow is:

1. keep `main` stable,
2. integrate ongoing work in `develop`,
3. create focused `feature/...` branches for implementation tasks,
4. merge validated work into `develop`,
5. promote stable milestones from `develop` to `main`.
