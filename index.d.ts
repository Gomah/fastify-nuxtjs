import type { NuxtApp } from '@nuxt/types/app';

import type {
  FastifyReply,
  FastifyRequest,
  FastifyPlugin,
  FastifySchema,
  HTTPMethods
} from 'fastify';

declare module 'fastify' {
  type FastifyNuxtCallback = (
    app: NuxtApp,
    req: FastifyRequest,
    reply: FastifyReply
  ) => Promise<void>;

  interface FastifyInstance {
    nuxt(
      path: string,
      opts?:
        | {
            method: HTTPMethods;
            schema: FastifySchema;
          }
        | FastifyNuxtCallback,
      handle?: FastifyNuxtCallback
    ): void;
  }
}

declare const fastifyNuxt: FastifyPlugin<{ [key: string]: any }>;

export default fastifyNuxt;
