import { ProblemDetail } from '../middlewares/error.middleware.js';

export function assertStrongPassword(password: string): void {
  const strongEnough =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  if (!strongEnough) {
    throw new ProblemDetail({
      type: 'validation-error',
      title: 'Weak Password',
      status: 422,
      detail: 'Password must be at least 8 characters and include upper, lower, and numeric characters.',
    });
  }
}
