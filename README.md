# 😍 make-pretty
CLI command to setup prettier and its precommit hook for your project.

Supported projects:
- Node JS
- Node TS

It will install required dependencies:
- [Prettier](https://github.com/prettier/prettier)
- [Husky](https://github.com/typicode/husky)
- [Pretty Quick](https://github.com/azz/pretty-quick)

For `Node TS` project:
- Setup [tslint-config-prettier](https://github.com/alexjoverm/tslint-config-prettier) if `tslint.json` exist

## Install
With `npm`:

```shellsession
npm install -g make-pretty
```

With `yarn`:

```shellsession
yarn global add make-pretty
```

## Usage
```shellsession
make-pretty
```

## License
MIT © [Budi Irawan](https://budiirawan.com)
