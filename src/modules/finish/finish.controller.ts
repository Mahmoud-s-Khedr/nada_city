import type { Request, Response, NextFunction } from 'express';
import { FinishService } from './finish.service.js';
import { FinishResponseSchema, FinishWithIncludesResponseSchema } from './finish.dto.js';
import { buildQueryOptions } from '../../utils/query-builder.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';

const service = new FinishService();

/** Allowed fields for filtering and sorting — prevents querying on hidden/writeOnly fields. */
const ALLOWED_FILTER_FIELDS = ['id', 'title', 'description', 'price', 'type', 'subType', 'imageUrls', 'videoUrls', 'deletedAt', 'createdAt', 'updatedAt'];
const SEARCHABLE_FIELDS: string[] = ['title', 'description', 'subType'];
const ALLOWED_INCLUDE_RELATIONS: string[] = ['requests', 'favorites'];
const FILTER_FIELD_TYPES = {
  id: 'string',
  title: 'string',
  description: 'string',
  price: 'number',
  type: 'enum',
  subType: 'string',
  imageUrls: 'string',
  videoUrls: 'string',
  deletedAt: 'datetime',
  createdAt: 'datetime',
  updatedAt: 'datetime',
} as const;
const DEFAULT_SORT_FIELD: string | undefined = 'createdAt';

type ControllerRequest = Request;
type ControllerResponse = Response;
type ControllerNext = NextFunction;

/**
 * Finish Controller
 * Handles HTTP request/response for the Finish resource.
 */
export class FinishController {
  private invalidSelectorParam(fieldName: string, expected: string): ProblemDetail {
    return new ProblemDetail({
      type: 'validation-error',
      title: 'Validation Error',
      status: 422,
      detail: `Invalid selector parameter "${fieldName}". Expected ${expected}.`,
    });
  }

  private parseSelectorParam(
    rawValue: string | undefined,
    fieldName: string,
    fieldType: 'string' | 'enum' | 'number' | 'bigint' | 'boolean' | 'datetime' | 'other',
  ): string | number | bigint | boolean | Date {
    if (rawValue === undefined) {
      throw this.invalidSelectorParam(fieldName, 'a value');
    }
    if (fieldType === 'number') {
      const num = Number(rawValue);
      if (!Number.isFinite(num)) {
        throw this.invalidSelectorParam(fieldName, 'a numeric value');
      }
      return num;
    }
    if (fieldType === 'bigint') {
      try {
        return BigInt(rawValue);
      } catch {
        throw this.invalidSelectorParam(fieldName, 'an integer value');
      }
    }
    if (fieldType === 'boolean') {
      if (rawValue === 'true') return true;
      if (rawValue === 'false') return false;
      throw this.invalidSelectorParam(fieldName, 'true or false');
    }
    if (fieldType === 'datetime') {
      const date = new Date(rawValue);
      if (Number.isNaN(date.getTime())) {
        throw this.invalidSelectorParam(fieldName, 'an ISO datetime value');
      }
      return date;
    }
    return rawValue;
  }

  private readKeyFromParams(req: ControllerRequest): {
    id: string;
  } {
    return {
      id: this.parseSelectorParam(
        ((req.params as Record<string, string | undefined>)['id']),
        'id',
        'string'
      ) as string,
    };
  }

  private keyDescription(req: ControllerRequest): string {
    const params = req.params as Record<string, string | undefined>;
    return `id=\"${params.id}\"`;
  }

  /**
   * GET /api/finishes/cursor
   * Cursor-based pagination using the id field.
   */
  async listCursor(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const query = req.query as Record<string, string | undefined>;
      const cursor = query.cursor === undefined
        ? null
        : this.parseSelectorParam(
            query.cursor,
            'cursor',
            'string'
          ) as string;
      const pageSize = Math.min(Math.max(parseInt(query.pageSize ?? '20', 10) || 20, 1), 100);
      const direction = query.direction === 'backward' ? 'backward' as const : 'forward' as const;

      const { data, hasMore, nextCursor } = await service.findManyCursor(cursor, pageSize, direction);
      const safeData = data.map((item: unknown) => FinishResponseSchema.parse(item));
      sendSuccess(res, safeData, { hasMore, nextCursor, pageSize });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/finishes
   */
  async list(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const options = buildQueryOptions(req.query as Record<string, any>, {
        allowedFilterFields: ALLOWED_FILTER_FIELDS,
        searchableFields: SEARCHABLE_FIELDS,
        allowedIncludeRelations: ALLOWED_INCLUDE_RELATIONS,
        filterFieldTypes: FILTER_FIELD_TYPES,
        defaultSortField: DEFAULT_SORT_FIELD,
      });
      const { data, total } = await service.findMany(options);
      const hasInclude = !!options.include && Object.keys(options.include).length > 0;
      const safeData = data.map((item: unknown) =>
        hasInclude
          ? FinishWithIncludesResponseSchema.parse(item)
          : FinishResponseSchema.parse(item)
      );
      sendSuccess(res, safeData, {
        page: options.page,
        limit: options.take,
        total,
        totalPages: Math.ceil(total / (options.take || 20)),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/finishes/:id
   */
  async getOne(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const options = buildQueryOptions(req.query as Record<string, any>, {
        allowedFilterFields: ALLOWED_FILTER_FIELDS,
        searchableFields: SEARCHABLE_FIELDS,
        allowedIncludeRelations: ALLOWED_INCLUDE_RELATIONS,
        filterFieldTypes: FILTER_FIELD_TYPES,
        defaultSortField: DEFAULT_SORT_FIELD,
      });
      const result = await service.findOne(this.readKeyFromParams(req), options.include);
      if (!result) {
        throw new ProblemDetail({
          type: 'not-found',
          title: 'Not Found',
          status: 404,
          detail: `Finish with key "${this.keyDescription(req)}" not found.`,
        });
      }
      const hasInclude = !!options.include && Object.keys(options.include).length > 0;
      sendSuccess(
        res,
        hasInclude
          ? FinishWithIncludesResponseSchema.parse(result)
          : FinishResponseSchema.parse(result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/finishes
   */
  async create(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const body = req.body as any;
      const result = await service.create(body);
      sendCreated(res, FinishResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/finishes/:id
   */
  async update(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const result = await service.update(this.readKeyFromParams(req), req.body as any);
      sendSuccess(res, FinishResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/finishes/:id
   */
  async patch(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const result = await service.update(this.readKeyFromParams(req), req.body as any);
      sendSuccess(res, FinishResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/finishes/:id
   */
  async remove(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      await service.delete(this.readKeyFromParams(req));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}
