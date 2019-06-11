# Contributing

## Setting Up Your Dev Environment
```
$ npm install
$ cp .hooks/pre-commit .hooks/pre-push .git/hooks
$ chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

## Manual Publish to NPM
```
$ yarn install
$ npm build
$ npm login
$ npm publish --access=public
```
