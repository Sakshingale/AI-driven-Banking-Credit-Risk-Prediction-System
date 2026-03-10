import { z } from 'zod';
import { insertLoanApplicationSchema, loanApplications } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  loans: {
    list: {
      method: 'GET' as const,
      path: '/api/loans' as const,
      responses: {
        200: z.array(z.custom<typeof loanApplications.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/loans/:id' as const,
      responses: {
        200: z.custom<typeof loanApplications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/loans' as const,
      input: insertLoanApplicationSchema,
      responses: {
        201: z.custom<typeof loanApplications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/loans/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof loanApplications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/loans/:id/analyze' as const,
      responses: {
        200: z.custom<typeof loanApplications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
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

export type LoanApplicationInput = z.infer<typeof api.loans.create.input>;
export type LoanApplicationResponse = z.infer<typeof api.loans.create.responses[201]>;
export type LoanListResponse = z.infer<typeof api.loans.list.responses[200]>;
