import { z } from 'zod';

function isDecimalLike(value: unknown): value is { toString(): string } {
  return typeof value === 'object' && value !== null && typeof (value as { toString?: unknown }).toString === 'function';
}

export const decimalNumberSchema = z
  .union([
    z.number(),
    z.string(),
    z.custom<{ toString(): string }>(isDecimalLike, {
      message: 'Expected a decimal-compatible value',
    }),
  ])
  .transform((value) => {
    const numericValue = typeof value === 'number' ? value : Number(value.toString());
    if (!Number.isFinite(numericValue)) {
      throw new Error('Expected a finite numeric value');
    }
    return numericValue;
  });
