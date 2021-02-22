---
title: Usage
description: ''
position: 2
category: 'Guide'
---

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
