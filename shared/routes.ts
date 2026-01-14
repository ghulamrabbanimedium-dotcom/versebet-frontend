import { z } from 'zod';
import { insertGreetingSchema, greetings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
};

export const api = {
  greetings: {
    list: {
      method: 'GET' as const,
      path: '/api/greetings',
      responses: {
        200: z.array(z.custom<typeof greetings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/greetings',
      input: insertGreetingSchema,
      responses: {
        201: z.custom<typeof greetings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
