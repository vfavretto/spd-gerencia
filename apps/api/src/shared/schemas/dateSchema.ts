import { z } from 'zod';
export const zLocalDate = z
  .string()
  .transform((val) => new Date(val.length === 10 ? val + 'T12:00:00' : val))
  .pipe(z.date());
