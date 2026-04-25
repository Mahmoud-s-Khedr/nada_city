import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { redis } from '../../config/redis.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { sendSuccess, sendNoContent } from '../../utils/response.js';
import { assertStrongPassword } from '../../utils/password.js';
import { tokenDeliveryProvider } from './token-delivery.js';

const router = Router();

const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL || String(7 * 24 * 60 * 60), 10);

function normalizeAccessTokenTtl(value: string): SignOptions['expiresIn'] {
  return /^\d+$/.test(value) ? Number(value) : (value as SignOptions['expiresIn']);
}

const ACCESS_TOKEN_TTL = normalizeAccessTokenTtl(env.ACCESS_TOKEN_TTL ?? '15m');
const SHOULD_EXPOSE_TEST_TOKENS = env.NODE_ENV !== 'production' && env.EXPOSE_TEST_TOKENS;

const LoginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1),
}).strict();

const RefreshSchema = z.object({
  refreshToken: z.string().uuid(),
}).strict();

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8),
  phone: z.string().optional(),
  address: z.string().optional(),
}).strict();

const VerifyOtpSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  code: z.string().length(6),
}).strict();

const ForgotPasswordSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
}).strict();

const ResetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).strict();

function createOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function withOptionalDevToken<T extends Record<string, unknown>>(
  payload: T,
  key: 'devOtpCode' | 'devResetToken',
  value: string,
): T & Partial<Record<'devOtpCode' | 'devResetToken', string>> {
  if (!SHOULD_EXPOSE_TEST_TOKENS) {
    return payload;
  }

  return {
    ...payload,
    [key]: value,
  };
}

async function issueAccessAndRefreshTokens(user: { id: string; role: string; email: string }) {
  const accessToken = jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
  const refreshToken = crypto.randomUUID();
  await redis.set(`refresh_token:${refreshToken}`, String(user.id), { EX: REFRESH_TOKEN_TTL });
  return { accessToken, refreshToken };
}

router.post('/register', validate(RegisterSchema), async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body as z.infer<typeof RegisterSchema>;
    assertStrongPassword(password);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser?.isVerified) {
      throw new ProblemDetail({
        type: 'conflict',
        title: 'User Exists',
        status: 409,
        detail: 'A verified user with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: { name, password: passwordHash, phone, address, isVerified: false },
        })
      : await prisma.user.create({
          data: { name, email, password: passwordHash, phone, address, isVerified: false },
        });

    const code = createOtpCode();
    await prisma.otpToken.create({
      data: {
        email,
        code,
        consumed: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await tokenDeliveryProvider.send({ email, token: code, kind: 'otp' });
    sendSuccess(res, withOptionalDevToken({ userId: user.id, email, verificationRequired: true }, 'devOtpCode', code));
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', validate(VerifyOtpSchema), async (req, res, next) => {
  try {
    const { email, code } = req.body as z.infer<typeof VerifyOtpSchema>;
    const token = await prisma.otpToken.findFirst({
      where: {
        email,
        code,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      throw new ProblemDetail({
        type: 'unauthorized',
        title: 'Invalid OTP',
        status: 401,
        detail: 'The OTP is invalid or has expired.',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'User Not Found',
        status: 404,
        detail: 'No pending user exists for this OTP.',
      });
    }

    await prisma.$transaction([
      prisma.otpToken.update({ where: { id: token.id }, data: { consumed: true } }),
      prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
    ]);

    sendSuccess(res, { verified: true });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    const isValid = user ? await bcrypt.compare(password, user.password) : false;
    if (!isValid || !user) {
      throw new ProblemDetail({
        type: 'unauthorized',
        title: 'Invalid credentials',
        status: 401,
        detail: 'Invalid email or password.',
      });
    }
    if (!user.isVerified) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Account Not Verified',
        status: 403,
        detail: 'Verify your account before logging in.',
      });
    }
    sendSuccess(res, await issueAccessAndRefreshTokens(user));
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', validate(RefreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;
    const userId = await redis.get(`refresh_token:${refreshToken}`);
    if (!userId) {
      throw new ProblemDetail({
        type: 'unauthorized',
        title: 'Invalid refresh token',
        status: 401,
        detail: 'The refresh token is invalid or has expired.',
      });
    }
    await redis.del(`refresh_token:${refreshToken}`);
    const user = await prisma.user.findUnique({ where: { id: userId as any } });
    if (!user) {
      throw new ProblemDetail({
        type: 'unauthorized',
        title: 'User not found',
        status: 401,
        detail: 'The user associated with this refresh token no longer exists.',
      });
    }
    sendSuccess(res, await issueAccessAndRefreshTokens({ id: String(userId), role: user.role, email: user.email }));
  } catch (error) {
    next(error);
  }
});

router.post('/logout', validate(RefreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;
    await redis.del(`refresh_token:${refreshToken}`);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validate(ForgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body as z.infer<typeof ForgotPasswordSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    let resetTokenForResponse: string | undefined;

    if (user?.isVerified) {
      const token = crypto.randomUUID();
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          consumed: false,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      await tokenDeliveryProvider.send({ email, token, kind: 'password-reset' });
      resetTokenForResponse = token;
    }
    sendSuccess(
      res,
      SHOULD_EXPOSE_TEST_TOKENS && resetTokenForResponse
        ? withOptionalDevToken({ requested: true }, 'devResetToken', resetTokenForResponse)
        : { requested: true }
    );
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validate(ResetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body as z.infer<typeof ResetPasswordSchema>;
    assertStrongPassword(password);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.consumed || resetToken.expiresAt <= new Date()) {
      throw new ProblemDetail({
        type: 'unauthorized',
        title: 'Invalid Reset Token',
        status: 401,
        detail: 'The reset token is invalid or has expired.',
      });
    }

    const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
    if (!user) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'User Not Found',
        status: 404,
        detail: 'No user exists for this reset token.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { consumed: true } }),
      prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } }),
    ]);
    sendSuccess(res, { reset: true });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
