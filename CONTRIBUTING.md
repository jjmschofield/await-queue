# Contributing

## Setting Up Your Dev Environment
```
$ npm install
$ cp .hooks/pre-commit .hooks/pre-push .git/hooks
$ chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

## Releases
First make sure that you have updated the version number in `package.json` to an appropriate semver version based on the change set.

In nearly all scenarios you should then follow the "CI Publish to NPM" below.

## CI Publish to NPM
* Allow CI to run your final change set
* Add a git tag with a semver version matching version in `package.json`
* You can add a git tag via "Prepare a Release" in Github or by pushing a tag onto origin  

## Manual Publish to NPM
Disable CircleCI first or you will trigger a deployment from there by pushing a tag.
Then:
```
// Tag repo
$ git tag v<semver version>
$ git push push origin v<semver version>

// Make sure deps are up to date
$ yarn install

// Build
$ npm build

// Deploy
$ npm login
$ npm publish --access=public
```
