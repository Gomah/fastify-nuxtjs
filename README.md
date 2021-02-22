[![fastify-nuxtjs](https://fastify-nuxt.vercel.app/preview.png)](https://fastify-nuxt.vercel.app)

# fastify-nuxtjs

[![npm version][npm-version-src]][npm-version-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-0A0A0A.svg?style=flat-square)](https://prettier.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![CI workflow](https://github.com/gomah/fastify-nuxtjs/workflows/CI%20workflow/badge.svg)

Vue server side rendering support for Fastify with [Nuxt.js](https://nuxtjs.org/docs/2.x/internals-glossary/nuxt) Framework.

## Install

Install with yarn:

```bash
yarn add fastify-nuxtjs nuxt
```

Install with npm:

```bash
npm install fastify-nuxtjs nuxt
```

## Usage

Since Nuxt needs some time to be ready on the first launch, you must declare your routes inside the `after` callback, after you registered the plugin.
The plugin will expose the api `nuxt` in Fastify that will handle the rendering for you.

```js
const fastify = require('fastify')();

fastify.register(require('fastify-nuxtjs')).after(() => {
  fastify.nuxt('/hello');
});

fastify.listen(3000, (err) => {
  if (err) throw err;
  console.log('Server listening on http://localhost:3000');
});
```

All you server rendered pages must be saved in the folder `pages`, as you can see in the [nuxt documentation](https://nuxtjs.org/docs/2.x/internals-glossary/nuxt).

```vue
<template>
  <HelloWorld />
</template>
```

If you need to handle the render part yourself, just pass a callback to `nuxt`:

```js
fastify.nuxt('/hello', (app, req, reply) => {
  // your code
  // `app` is the Nuxt instance
  app.render(req.raw, reply.raw, '/hello', req.query, {});
});
```

### Serve all routes from your `pages/` folder

Using `*`:

```ts
const fastify = require('fastify')();

fastify.register(require('fastify-nuxtjs')).after(() => {
  fastify.nuxt('*');
});
```

Or import your generated `routes.json` from your `.nuxt` folder:

```ts
const nuxtRoutes = require('./.nuxt/routes.json');
const fastify = require('fastify')();

fastify.register(require('fastify-nuxtjs')).after(() => {
  nuxtRoutes.forEach((nuxtRoute) => {
    fastify.nuxt(nuxtRoute.path);
  });
});
```

## Acknowledgements

Heavily inspired by [fastify-nextjs](https://github.com/fastify/fastify-nextjs)

## License

Licensed under [MIT](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/dt/fastify-nuxtjs.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/fastify-nuxtjs
[npm-downloads-src]: https://img.shields.io/npm/v/fastify-nuxtjs/latest.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/fastify-nuxtjs
[david-dm-src]: https://david-dm.org/gomah/fastify-nuxtjs/status.svg?style=flat-square
[david-dm-href]: https://david-dm.org/gomah/fastify-nuxtjs
