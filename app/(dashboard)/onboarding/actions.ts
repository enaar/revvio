'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { businessProfiles, type NewBusinessProfile } from '@/lib/db/schema';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { onboardingSchema } from '@/lib/validations/business';
import { redirect } from 'next/navigation';

export const createBusinessProfile = validatedActionWithUser(
  onboardingSchema,
  async (data, formData, user) => {
    try {
      const newBusinessProfile: NewBusinessProfile = {
        userId: user.id,
        businessName: data.businessName,
        phone: data.phone,
        email: data.email,
        googleReviewUrl: data.googleReviewUrl,
        facebookReviewUrl: data.facebookReviewUrl || null,
        yelpReviewUrl: data.yelpReviewUrl || null,
      };

      const [createdProfile] = await db
        .insert(businessProfiles)
        .values(newBusinessProfile)
        .returning();

      if (!createdProfile) {
        return {
          error: 'Failed to create business profile. Please try again.',
        };
      }

      return {
        success: 'Business profile created successfully!',
        profileId: createdProfile.id,
      };
    } catch (error) {
      console.error('Error creating business profile:', error);
      return {
        error: 'An error occurred while creating your business profile.',
      };
    }
  }
);
