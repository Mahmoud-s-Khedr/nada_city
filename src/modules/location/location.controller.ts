import type { Request, Response, NextFunction } from 'express';
import { LocationService } from './location.service.js';
import { LocationResponseSchema, LocationWithIncludesResponseSchema } from './location.dto.js';
import { buildQueryOptions } from '../../utils/query-builder.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';

const service = new LocationService();

/** Allowed fields for filtering and sorting — prevents querying on hidden/writeOnly fields. */
const ALLOWED_FILTER_FIELDS = ['id', 'address', 'latitude', 'longitude', 'deletedAt', 'createdAt', 'updatedAt'];
const SEARCHABLE_FIELDS: string[] = ['address'];
const ALLOWED_INCLUDE_RELATIONS: string[] = ['units'];
const FILTER_FIELD_TYPES = {
  id: 'string',
  address: 'string',
  latitude: 'number',
  longitude: 'number',
  deletedAt: 'datetime',
  createdAt: 'datetime',
  updatedAt: 'datetime',
} as const;
const DEFAULT_SORT_FIELD: string | undefined = 'id';

type ControllerRequest = Request;
type ControllerResponse = Response;
type ControllerNext = NextFunction;

/**
 * Location Controller
 * Handles HTTP request/response for the Location resource.
 */
export class LocationController {
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
   * GET /api/locations
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
          ? LocationWithIncludesResponseSchema.parse(item)
          : LocationResponseSchema.parse(item)
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
   * GET /api/locations/:id
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
          detail: `Location with key "${this.keyDescription(req)}" not found.`,
        });
      }
      const hasInclude = !!options.include && Object.keys(options.include).length > 0;
      sendSuccess(
        res,
        hasInclude
          ? LocationWithIncludesResponseSchema.parse(result)
          : LocationResponseSchema.parse(result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/locations
   */
  async create(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const body = req.body as any;
      const result = await service.create(body);
      sendCreated(res, LocationResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/locations/:id
   */
  async update(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const result = await service.update(this.readKeyFromParams(req), req.body as any);
      sendSuccess(res, LocationResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/locations/:id
   */
  async patch(req: ControllerRequest, res: ControllerResponse, next: ControllerNext): Promise<void> {
    try {
      const result = await service.update(this.readKeyFromParams(req), req.body as any);
      sendSuccess(res, LocationResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/locations/:id
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
