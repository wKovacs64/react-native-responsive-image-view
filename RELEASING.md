# Releasing

## Overview

This package is versioned and released using
[changesets](https://github.com/changesets/changesets). A changesets pull
request with the title "chore: release" should be opened automatically and get
updated automatically with the current list of pending changes since the
previous release. Merging this PR will release those pending changes under the
next appropriate version.

## How

Each commit or pull request should include a changeset if it should (eventually)
have an impact on the package version. To create one: run `npx changeset`,
answer the questions, and commit the results. Changes that don't facilitate a
version bump (i.e., "chores") don't necessarily need a changeset.

### The flow:

1. Checkout a new branch
1. Make your changes
1. Run `npx changeset`, answer the questions, commit the results
1. Push your branch and open a pull request
1. Once these changes are in the `main` branch, the changesets pull request will
   be updated automatically.
1. When you're ready to release a new version, merge the changesets PR to `main`
   and the GitHub "Release" workflow will publish the package to npm and commit
   the updated `CHANGELOG.md` file back to the repository.
