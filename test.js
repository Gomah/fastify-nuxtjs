'use strict';

const t = require('tap');
const test = t.test;
const Fastify = require('fastify');
const { loadNuxt } = require('nuxt');
const pino = require('pino');

test('should construct nuxt with proper environment', async t => {
  t.plan(2);

  var app;
  var options;
  var dev;

  process.env.NODE_ENV = 'production';
  dev = process.env.NODE_ENV !== 'production';
  t.equal(dev, false);

  app = await loadNuxt('start');

  t.equal(app.options.dev, false);
  app.close();
});

test('should return an html document', t => {
  t.plan(3);

  const fastify = Fastify();
  t.tearDown(() => fastify.close());

  fastify.register(require('./index')).after(() => {
    fastify.nuxt('/hello');
  });

  fastify.inject(
    {
      url: '/hello',
      method: 'GET',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html; charset=utf-8');
    }
  );
});

test('should support different methods', t => {
  t.plan(3);

  const fastify = Fastify();
  t.tearDown(() => fastify.close());

  fastify.register(require('./index')).after(() => {
    fastify.nuxt('/hello', { method: 'options' });
  });

  fastify.inject(
    {
      url: '/hello',
      method: 'OPTIONS',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html; charset=utf-8');
    }
  );
});

test('should support a custom handler', t => {
  t.plan(3);

  const fastify = Fastify();
  t.tearDown(() => fastify.close());

  fastify.register(require('./index')).after(() => {
    fastify.nuxt('/hello', (app, req, reply) => {
      app.render(req.raw, reply.raw, '/hello', req.query, {});
    });
  });

  fastify.inject(
    {
      url: '/hello',
      method: 'GET',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html; charset=utf-8');
    }
  );
});

test('should return 404 on undefined route', t => {
  t.plan(2);

  const fastify = Fastify();
  t.tearDown(() => fastify.close());

  fastify.register(require('./index')).after(() => {
    fastify.nuxt('/hello');
  });

  fastify.inject(
    {
      url: '/test',
      method: 'GET',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 404);
    }
  );
});

test('should throw if path is not a string', t => {
  t.plan(2);

  const fastify = Fastify();
  fastify.register(require('./index')).after(err => {
    t.error(err);
    try {
      fastify.nuxt(null);
      t.fail();
    } catch (e) {
      t.equal(e.message, 'path must be a string');
    }
  });

  fastify.close();
});

test('should throw if opts.method is not a string', t => {
  t.plan(2);

  const fastify = Fastify();
  fastify.register(require('./index')).after(err => {
    t.error(err);
    try {
      fastify.nuxt('/hello', { method: 1 });
      t.fail();
    } catch (e) {
      t.equal(e.message, 'options.method must be a string');
    }
  });

  fastify.close();
});

test('should throw if opts.schema is not an object', t => {
  t.plan(2);

  const fastify = Fastify();
  fastify.register(require('./index')).after(err => {
    t.error(err);
    try {
      fastify.nuxt('/hello', { schema: 1 });
      t.fail();
    } catch (e) {
      t.equal(e.message, 'options.schema must be an object');
    }
  });

  fastify.close();
});

test('should throw if callback is not a function', t => {
  t.plan(2);

  const fastify = Fastify();
  fastify.register(require('./index')).after(err => {
    t.error(err);
    try {
      fastify.nuxt('/hello', {}, 1);
      t.fail();
    } catch (e) {
      t.equal(e.message, 'callback must be a function');
    }
  });

  fastify.close();
});

test('should serve /_nuxt/* static assets', t => {
  t.plan(9);

  const manifest = require('./.nuxt/dist/server/client.manifest.json');

  const fastify = Fastify();

  fastify.register(require('./index')).after(() => {
    fastify.nuxt('/hello');
  });

  t.tearDown(() => fastify.close());

  const commonAssets = manifest.initial;

  commonAssets.map(suffix => testNuxtAsset(t, fastify, `/_nuxt/${suffix}`));
});

test('should not log any errors', t => {
  t.plan(5);

  let showedError = false;
  const logger = pino({
    level: 'error',
    formatters: {
      log: obj => {
        showedError = true;
        return obj;
      },
    },
  });

  const fastify = Fastify({
    logger,
  });

  fastify.register(require('./index')).after(() => {
    fastify.nuxt('/hello');
  });

  fastify.inject(
    {
      url: '/hello',
      method: 'GET',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html; charset=utf-8');
      t.includes(res.payload, '<h1 class="title">Hello World</h1>');
      t.equal(showedError, false, 'Should not show any error');
    }
  );
});

test('should respect plugin logLevel', t => {
  t.plan(5);

  let didLog = false;
  const logger = pino({
    formatters: {
      log: obj => {
        didLog = true;
        return obj;
      },
    },
  });

  const fastify = Fastify({
    logger,
  });

  fastify
    .register(require('./index'), {
      logLevel: 'error',
    })
    .after(() => {
      fastify.nuxt('/hello');
    });

  t.tearDown(() => fastify.close());

  fastify.inject(
    {
      url: '/hello',
      method: 'GET',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.headers['content-type'], 'text/html; charset=utf-8');
      t.includes(res.payload, '<h1 class="title">Hello World</h1>');
      t.equal(didLog, false);
    }
  );
});

test('should preserve Fastify response headers set by plugins and hooks', t => {
  t.plan(3);

  const fastify = Fastify();
  t.tearDown(() => fastify.close());

  fastify.register(require('./index')).after(() => {
    fastify.addHook('onRequest', (req, reply, done) => {
      reply.header('test-header', 'hello');
      done();
    });

    fastify.nuxt('/hello', (app, req, reply) => {
      app.render(req.raw, reply.raw, '/hello', req.query, {});
    });
  });

  fastify.inject(
    {
      url: '/hello',
      method: 'GET',
    },
    (err, res) => {
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.headers['test-header'], 'hello');
    }
  );
});

function testNuxtAsset(t, fastify, url) {
  fastify.inject({ url, method: 'GET' }, (err, res) => {
    t.error(err);
    t.equal(res.statusCode, 200);
    t.equal(res.headers['content-type'], 'application/javascript; charset=UTF-8');
  });
}
