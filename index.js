'use strict';

const assert = require('assert');
const fp = require('fastify-plugin');
const { loadNuxt, build } = require('nuxt');
const nuxtConfig = require('./nuxt.config');

function fastifyNuxt(fastify, options, done) {
  const isDev = process.env.NODE_ENV !== 'production';
  const publicPath = nuxtConfig.publicPath ? `${nuxtConfig.publicPath}*` : '/_nuxt/*';

  const app = loadNuxt(isDev ? 'dev' : 'start');

  app
    .then((nuxt) => {
      // Build only in dev mode with hot-reloading
      if (isDev) {
        build(nuxt);
      }

      fastify
        .decorate('nuxt', route.bind(fastify))
        .addHook('onClose', function () {
          nuxt.close();
        })
        .after(() => {
          fastify.nuxt(publicPath);
          if (isDev) {
            fastify.nuxt('/__webpack_hmr/*');
          }
        });
      done();
    })
    .catch((err) => done(err));

  function route(path, opts, callback) {
    opts = opts || {
      logLevel: options.logLevel,
    };

    if (typeof opts === 'function') {
      callback = opts;
      opts = {
        logLevel: options.logLevel,
      };
    }

    assert(typeof path === 'string', 'path must be a string');

    if (opts.method) {
      assert(typeof opts.method === 'string', 'options.method must be a string');
    }

    if (opts.schema) {
      assert(typeof opts.schema === 'object', 'options.schema must be an object');
    }

    if (callback) {
      assert(typeof callback === 'function', 'callback must be a function');
    }

    const method = opts.method || 'get';

    this[method.toLowerCase()](path, opts, handler);

    function handler(req, reply) {
      for (const [headerName, headerValue] of Object.entries(reply.getHeaders())) {
        reply.raw.setHeader(headerName, headerValue);
      }

      app.then((nuxt) => {
        if (callback) {
          return callback(nuxt, req, reply);
        }

        nuxt.render(req.raw, reply.raw);
        reply.sent = true;
      });
    }
  }
}

module.exports = fp(fastifyNuxt, {
  fastify: '>=1.0.0',
  name: 'fastify-nuxtjs',
});
