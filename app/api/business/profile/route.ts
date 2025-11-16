import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { businessProfiles } from '@/lib/db/schema';
import { onboardingSchema } from '@/lib/validations/business';
import { eq } from 'drizzle-orm';

/**
 * GET /api/business/profile
 * Fetch the current user's business profile
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Fetch business profile
    const profiles = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, user.id))
      .limit(1);

    // Check if profile exists
    if (profiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Business profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: profiles[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/business/profile
 * Create or update the current user's business profile
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body with Zod schema
    const validation = onboardingSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errorMessages,
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Check if profile already exists
    const existingProfiles = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, user.id))
      .limit(1);

    const isUpdate = existingProfiles.length > 0;

    // Prepare data for upsert
    const profileData = {
      userId: user.id,
      businessName: validatedData.businessName,
      phone: validatedData.phone,
      email: validatedData.email,
      googleReviewUrl: validatedData.googleReviewUrl,
      facebookReviewUrl: validatedData.facebookReviewUrl || null,
      yelpReviewUrl: validatedData.yelpReviewUrl || null,
      onboardingCompleted: true,
      updatedAt: new Date(),
    };

    let result;

    if (isUpdate) {
      // Update existing profile
      const updated = await db
        .update(businessProfiles)
        .set(profileData)
        .where(eq(businessProfiles.userId, user.id))
        .returning();

      result = updated[0];

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Business profile updated successfully',
        },
        { status: 200 }
      );
    } else {
      // Create new profile
      const created = await db
        .insert(businessProfiles)
        .values(profileData)
        .returning();

      result = created[0];

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Business profile created successfully',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating/updating business profile:', error);

    // Handle unique constraint violations or other database errors
    if (error instanceof Error) {
      // Check for common database errors
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          {
            success: false,
            error: 'A business profile already exists for this user',
          },
          { status: 409 }
        );
      }

      // Check for foreign key violations
      if (error.message.includes('foreign key')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid user reference',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing your request',
      },
      { status: 500 }
    );
  }
}
