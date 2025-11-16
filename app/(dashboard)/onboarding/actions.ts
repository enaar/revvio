'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { businessProfiles, type NewBusinessProfile } from '@/lib/db/schema';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { onboardingSchema } from '@/lib/validations/business';
import { getBusinessProfile } from '@/lib/db/queries';

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
        onboardingCompleted: true,
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

export const updateBusinessProfile = validatedActionWithUser(
  onboardingSchema,
  async (data, formData, user) => {
    try {
      const existingProfile = await getBusinessProfile();

      if (!existingProfile) {
        return {
          error: 'Business profile not found.',
        };
      }

      const [updatedProfile] = await db
        .update(businessProfiles)
        .set({
          businessName: data.businessName,
          phone: data.phone,
          email: data.email,
          googleReviewUrl: data.googleReviewUrl,
          facebookReviewUrl: data.facebookReviewUrl || null,
          yelpReviewUrl: data.yelpReviewUrl || null,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.userId, user.id))
        .returning();

      if (!updatedProfile) {
        return {
          error: 'Failed to update business profile. Please try again.',
        };
      }

      return {
        success: 'Business profile updated successfully!',
        profileId: updatedProfile.id,
      };
    } catch (error) {
      console.error('Error updating business profile:', error);
      return {
        error: 'An error occurred while updating your business profile.',
      };
    }
  }
);
