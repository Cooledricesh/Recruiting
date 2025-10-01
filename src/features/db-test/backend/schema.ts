import { z } from 'zod';

export const DbTestResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  timestamp: z.string(),
  tables: z.array(z.string()).optional(),
  sampleData: z
    .object({
      tableName: z.string(),
      count: z.number(),
      sample: z.array(z.record(z.unknown())).optional(),
    })
    .optional(),
});

export type DbTestResponse = z.infer<typeof DbTestResponseSchema>;
