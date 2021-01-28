# fastify-nuxtjs

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/) ![CI workflow](https://github.com/gomah/fastify-nuxtjs/workflows/CI%20workflow/badge.svg)

Vue server side rendering support for Fastify with [Nuxt.js](https://nuxtjs.org/docs/2.x/internals-glossary/nuxt) Framework.

## Install

```
npm i fastify-nuxtjs nuxt --save
```

## Usage

Since Nuxt needs some time to be ready on the first launch, you must declare your routes inside the `after` callback, after you registered the plugin.
The plugin will expose the api `nuxt` in Fastify that will handle the rendering for you.

```js
const fastify = require('fastify')();

fastify.register(require('fastify-nuxtjs')).after(() => {
  fastify.nuxt('/hello');
});

fastify.listen(3000, err => {
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

## Acknowledgements

Heavily inspired by [fastify-nextjs](https://github.com/fastify/fastify-nextjs)

## License

Licensed under [MIT](./LICENSE).
