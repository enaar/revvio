import { z } from 'zod';

/**
 * Environment variable validation schema
 *
 * This ensures all required environment variables are present and properly formatted
 * at runtime. The application will fail fast if any required variables are missing.
 */
const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),

  // Authentication
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  // Application URLs
  BASE_URL: z.string().url('BASE_URL must be a valid URL'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Twilio (SMS)
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_PHONE_NUMBER: z.string().min(1, 'TWILIO_PHONE_NUMBER is required'),

  // SendGrid (Email)
  SENDGRID_API_KEY: z.string().min(1, 'SENDGRID_API_KEY is required'),
  SENDGRID_FROM_EMAIL: z.string().email('SENDGRID_FROM_EMAIL must be a valid email'),
});

/**
 * Validates and parses environment variables
 * Throws an error if any required variables are missing or invalid
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `  - ${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Missing or invalid environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * Safe to use throughout the application
 */
export const config = validateEnv();

/**
 * Type-safe environment variables
 */
export type Config = z.infer<typeof envSchema>;
