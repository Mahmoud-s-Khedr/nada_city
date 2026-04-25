import { Request, Response, NextFunction } from 'express';
import { ZodSchema, type ZodTypeAny } from 'zod';

export const VALIDATION_METADATA = Symbol('validationMetadata');

export type ValidationSource = 'body' | 'query';

export interface ValidationMetadata {
  schema: ZodTypeAny;
  source: ValidationSource;
}

/**
 * Validation middleware factory.
 * Validates request body or query params against a Zod schema.
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  const middleware = (req: Request, _res: Response, next: NextFunction): void => {
    const data = source === 'body' ? req.body : req.query;
    const result = schema.safeParse(data);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (source === 'body') {
      req.body = result.data;
    }
    next();
  };

  (middleware as ((req: Request, _res: Response, next: NextFunction) => void) & {
    [VALIDATION_METADATA]?: ValidationMetadata;
  })[VALIDATION_METADATA] = { schema, source };

  return middleware;
}
