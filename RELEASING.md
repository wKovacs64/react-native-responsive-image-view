# Releasing

1. Update the version in `package.json` to a non-dev version in the `develop`
   branch.

        # Patch
        semver -i patch 1.0.1-dev.0 # 1.0.1

        # Minor
        semver -i minor 1.0.1-dev.0 # 1.1.0

        # Major
        semver -i major 1.0.1-dev.0 # 2.0.0

1. Update the `CHANGELOG.md` for the impending release.
1. `git commit -am "X.Y.Z"` (where X.Y.Z is the new version)
1. `npm publish` (ensure this succeeds before proceeding)
1. `git checkout master && git merge develop`
1. `git tag vX.Y.Z` (where X.Y.Z is the new version)
1. `git push origin master --tags`
1. `git checkout develop`
1. Update the version in `package.json` to the next dev version in the `develop`
   branch.

        semver -i prerelease --preid dev 1.0.1 # 1.0.2-dev.0

1. `git commit -am "Prepare next development version"`
1. `git push`
1. Update `gh-pages` branch if necessary.
