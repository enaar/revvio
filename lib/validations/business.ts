import { z } from 'zod';

// Phone number validation regex (supports common formats)
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// Step 1: Basic Business Information
export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name must be less than 255 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
});

// Step 2: Review Platform Links
export const reviewLinksSchema = z.object({
  googleReviewUrl: z
    .string()
    .min(1, 'Google Review link is required')
    .url('Please enter a valid URL'),
  facebookReviewUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  yelpReviewUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

// Combined schema for complete onboarding
export const onboardingSchema = businessInfoSchema.merge(reviewLinksSchema);

// TypeScript types inferred from schemas
export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type ReviewLinksFormData = z.infer<typeof reviewLinksSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
