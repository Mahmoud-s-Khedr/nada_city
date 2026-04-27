import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { corsOptions } from './config/cors.js';
import { logger } from './config/logger.js';
import { rateLimiter } from './middlewares/rate-limit.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { setupSwagger } from './config/swagger.js';
import { userRoutes } from './modules/user/user.routes.js';
import { galleryItemRoutes } from './modules/galleryItem/galleryItem.routes.js';
import { commentRoutes } from './modules/comment/comment.routes.js';
import { reactionRoutes } from './modules/reaction/reaction.routes.js';
import { locationRoutes } from './modules/location/location.routes.js';
import { unitRoutes } from './modules/unit/unit.routes.js';
import { bookingRequestRoutes } from './modules/bookingRequest/bookingRequest.routes.js';
import { sellUnitRequestRoutes } from './modules/sellUnitRequest/sellUnitRequest.routes.js';
import { unitOrderRequestRoutes } from './modules/unitOrderRequest/unitOrderRequest.routes.js';
import { finishRoutes } from './modules/finish/finish.routes.js';
import { finishRequestRoutes } from './modules/finishRequest/finishRequest.routes.js';
import { furnitureItemRoutes } from './modules/furnitureItem/furnitureItem.routes.js';
import { furnitureBookingRoutes } from './modules/furnitureBooking/furnitureBooking.routes.js';
import { specialFurnitureRequestRoutes } from './modules/specialFurnitureRequest/specialFurnitureRequest.routes.js';
import { favoriteRoutes } from './modules/favorite/favorite.routes.js';
import { whatsappOpenEventRoutes } from './modules/whatsappOpenEvent/whatsappOpenEvent.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { storageRoutes } from './modules/storage/storage.routes.js';

const app = express();

// -- Security & Parsing
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true }));

// -- Compression
app.use(compression());

// -- Request ID (forward or generate X-Request-ID for tracing)
app.use((req, res, next) => {
  const id = (req.headers['x-request-id'] as string) ?? crypto.randomUUID();
  res.setHeader('X-Request-ID', id);
  next();
});

// -- Logging
app.use(pinoHttp({ logger }));

// -- Rate Limiting
app.use(rateLimiter);

// -- Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// -- API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/galleryItems', galleryItemRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/reactions', reactionRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/bookingRequests', bookingRequestRoutes);
app.use('/api/v1/sellUnitRequests', sellUnitRequestRoutes);
app.use('/api/v1/unitOrderRequests', unitOrderRequestRoutes);
app.use('/api/v1/finishes', finishRoutes);
app.use('/api/v1/finishRequests', finishRequestRoutes);
app.use('/api/v1/furnitureItems', furnitureItemRoutes);
app.use('/api/v1/furnitureBookings', furnitureBookingRoutes);
app.use('/api/v1/specialFurnitureRequests', specialFurnitureRequestRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/whatsappOpenEvents', whatsappOpenEventRoutes);

// -- Swagger Documentation
setupSwagger(app);

// -- Error Handling (must be last)
app.use(errorMiddleware);

export { app };
