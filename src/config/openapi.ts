import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z, type ZodTypeAny, type ZodObject } from 'zod';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  VALIDATION_METADATA,
  type ValidationMetadata,
} from '../middlewares/validation.middleware.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { storageRoutes } from '../modules/storage/storage.routes.js';
import { bookingRequestRoutes } from '../modules/bookingRequest/bookingRequest.routes.js';
import { commentRoutes } from '../modules/comment/comment.routes.js';
import { favoriteRoutes } from '../modules/favorite/favorite.routes.js';
import { finishRoutes } from '../modules/finish/finish.routes.js';
import { finishRequestRoutes } from '../modules/finishRequest/finishRequest.routes.js';
import { furnitureBookingRoutes } from '../modules/furnitureBooking/furnitureBooking.routes.js';
import { furnitureItemRoutes } from '../modules/furnitureItem/furnitureItem.routes.js';
import { galleryItemRoutes } from '../modules/galleryItem/galleryItem.routes.js';
import { locationRoutes } from '../modules/location/location.routes.js';
import { reactionRoutes } from '../modules/reaction/reaction.routes.js';
import { sellUnitRequestRoutes } from '../modules/sellUnitRequest/sellUnitRequest.routes.js';
import { specialFurnitureRequestRoutes } from '../modules/specialFurnitureRequest/specialFurnitureRequest.routes.js';
import { unitRoutes } from '../modules/unit/unit.routes.js';
import { unitOrderRequestRoutes } from '../modules/unitOrderRequest/unitOrderRequest.routes.js';
import { userRoutes } from '../modules/user/user.routes.js';

extendZodWithOpenApi(z);

type ExpressRouter = {
  stack?: Array<{
    route?: {
      path?: string;
      methods?: Record<string, boolean>;
      stack?: Array<{ handle: unknown }>;
    };
  }>;
};

type MountedRouter = {
  basePath: string;
  tag: string;
  router: ExpressRouter;
};

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const mountedRouters: MountedRouter[] = [
  { basePath: '/api/v1/auth', tag: 'Auth', router: authRoutes as ExpressRouter },
  { basePath: '/api/v1/storage', tag: 'Storage', router: storageRoutes as ExpressRouter },
  { basePath: '/api/v1/users', tag: 'Users', router: userRoutes as ExpressRouter },
  { basePath: '/api/v1/galleryItems', tag: 'Gallery Items', router: galleryItemRoutes as ExpressRouter },
  { basePath: '/api/v1/comments', tag: 'Comments', router: commentRoutes as ExpressRouter },
  { basePath: '/api/v1/reactions', tag: 'Reactions', router: reactionRoutes as ExpressRouter },
  { basePath: '/api/v1/locations', tag: 'Locations', router: locationRoutes as ExpressRouter },
  { basePath: '/api/v1/units', tag: 'Units', router: unitRoutes as ExpressRouter },
  { basePath: '/api/v1/bookingRequests', tag: 'Booking Requests', router: bookingRequestRoutes as ExpressRouter },
  { basePath: '/api/v1/sellUnitRequests', tag: 'Sell Unit Requests', router: sellUnitRequestRoutes as ExpressRouter },
  { basePath: '/api/v1/unitOrderRequests', tag: 'Unit Order Requests', router: unitOrderRequestRoutes as ExpressRouter },
  { basePath: '/api/v1/finishes', tag: 'Finishes', router: finishRoutes as ExpressRouter },
  { basePath: '/api/v1/finishRequests', tag: 'Finish Requests', router: finishRequestRoutes as ExpressRouter },
  { basePath: '/api/v1/furnitureItems', tag: 'Furniture Items', router: furnitureItemRoutes as ExpressRouter },
  { basePath: '/api/v1/furnitureBookings', tag: 'Furniture Bookings', router: furnitureBookingRoutes as ExpressRouter },
  { basePath: '/api/v1/specialFurnitureRequests', tag: 'Special Furniture Requests', router: specialFurnitureRequestRoutes as ExpressRouter },
  { basePath: '/api/v1/favorites', tag: 'Favorites', router: favoriteRoutes as ExpressRouter },
];

const ApiSuccessEnvelopeSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
}).openapi('ApiSuccessEnvelope');

const ProblemDetailSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
}).openapi('ProblemDetail');

const HealthSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  timestamp: z.string().datetime(),
  uptime: z.number(),
}).openapi('HealthResponse');

function toOpenApiPath(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function joinPaths(basePath: string, routePath: string): string {
  const normalizedRoute = routePath === '/' ? '' : routePath;
  const joined = `${basePath}${normalizedRoute}`;
  return joined.startsWith('/') ? joined : `/${joined}`;
}

function extractPathParamNames(path: string): string[] {
  const names = new Set<string>();
  const regex = /{([A-Za-z0-9_]+)}/g;
  let match = regex.exec(path);
  while (match) {
    names.add(match[1]);
    match = regex.exec(path);
  }
  return [...names];
}

function buildPathParamsSchema(path: string): ZodObject<any> | undefined {
  const names = extractPathParamNames(path);
  if (names.length === 0) {
    return undefined;
  }

  const shape = names.reduce<Record<string, z.ZodString>>((acc, name) => {
    acc[name] = z.string();
    return acc;
  }, {});

  return z.object(shape);
}

function buildValidationRequest(
  middlewares: unknown[],
  pathParamsSchema?: ZodObject<any>
) {
  const request: {
    params?: ZodObject<any>;
    query?: ZodObject<any>;
    body?: {
      required: boolean;
      content: {
        'application/json': {
          schema: ZodTypeAny;
        };
      };
    };
  } = {};

  if (pathParamsSchema) {
    request.params = pathParamsSchema;
  }

  for (const middleware of middlewares) {
    const metadata = (middleware as Record<symbol, ValidationMetadata | undefined>)[VALIDATION_METADATA];
    if (!metadata) {
      continue;
    }

    if (metadata.source === 'query') {
      if (metadata.schema instanceof z.ZodObject) {
        request.query = metadata.schema;
      }
      continue;
    }

    request.body = {
      required: true,
      content: {
        'application/json': {
          schema: metadata.schema,
        },
      },
    };
  }

  return Object.keys(request).length > 0 ? request : undefined;
}

function buildResponsesForMethod(method: HttpMethod) {
  const responses: Record<string, { description: string; content?: Record<string, { schema: ZodTypeAny }> }> = {
    400: {
      description: 'Bad Request',
      content: {
        'application/json': { schema: ProblemDetailSchema },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': { schema: ProblemDetailSchema },
      },
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': { schema: ProblemDetailSchema },
      },
    },
    404: {
      description: 'Not Found',
      content: {
        'application/json': { schema: ProblemDetailSchema },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': { schema: ProblemDetailSchema },
      },
    },
  };

  if (method === 'delete') {
    responses[204] = { description: 'No Content' };
    return responses;
  }

  responses[200] = {
    description: 'OK',
    content: {
      'application/json': { schema: ApiSuccessEnvelopeSchema },
    },
  };

  if (method === 'post') {
    responses[201] = {
      description: 'Created',
      content: {
        'application/json': { schema: ApiSuccessEnvelopeSchema },
      },
    };
  }

  return responses;
}

function operationIdFrom(method: HttpMethod, fullPath: string): string {
  const normalized = fullPath
    .replace(/^\//, '')
    .replace(/[{}]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${method}_${normalized || 'root'}`;
}

function registerHealthRoute(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    summary: 'Service health check',
    operationId: 'get_health',
    responses: {
      200: {
        description: 'API is healthy',
        content: {
          'application/json': {
            schema: HealthSchema,
          },
        },
      },
    },
  });
}

function registerRouterPaths(registry: OpenAPIRegistry, mounted: MountedRouter): void {
  for (const layer of mounted.router.stack ?? []) {
    const route = layer.route;
    if (!route?.path) {
      continue;
    }

    const methods = Object.entries(route.methods ?? {})
      .filter(([, enabled]) => enabled)
      .map(([method]) => method.toLowerCase() as HttpMethod)
      .filter((method): method is HttpMethod =>
        method === 'get' || method === 'post' || method === 'put' || method === 'patch' || method === 'delete'
      );

    if (methods.length === 0) {
      continue;
    }

    const fullPath = toOpenApiPath(joinPaths(mounted.basePath, route.path));
    const pathParamsSchema = buildPathParamsSchema(fullPath);
    const middlewares = (route.stack ?? []).map((stackLayer) => stackLayer.handle);
    const request = buildValidationRequest(middlewares, pathParamsSchema);
    const usesAuth = middlewares.includes(authenticate as unknown);

    for (const method of methods) {
      registry.registerPath({
        method,
        path: fullPath,
        tags: [mounted.tag],
        summary: `${method.toUpperCase()} ${fullPath}`,
        operationId: operationIdFrom(method, fullPath),
        request,
        security: usesAuth ? [{ bearerAuth: [] }] : undefined,
        responses: buildResponsesForMethod(method),
      });
    }
  }
}

export function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();
  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  registerHealthRoute(registry);

  for (const mounted of mountedRouters) {
    registerRouterPaths(registry, mounted);
  }

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Nada City API',
      version: '1.0.0',
      description: 'REST API documentation generated from Express routes and Zod schemas.',
    },
    servers: [{ url: '/', description: 'Current host' }],
  });
}
