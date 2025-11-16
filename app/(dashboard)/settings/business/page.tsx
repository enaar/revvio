'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X, AlertTriangle } from 'lucide-react';
import {
  onboardingSchema,
  type OnboardingFormData,
} from '@/lib/validations/business';
import { ReviewLinkHelpModal } from '@/components/onboarding/review-link-help-modal';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// TypeScript types for API response
interface BusinessProfile {
  id: number;
  userId: number;
  businessName: string;
  phone: string;
  email: string;
  googleReviewUrl: string | null;
  facebookReviewUrl: string | null;
  yelpReviewUrl: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiSuccessResponse {
  success: true;
  data: BusinessProfile;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[];
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

type FormData = OnboardingFormData;

export default function BusinessSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
  });

  const formValues = watch();

  // Fetch business profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/business/profile');
        const result: ApiResponse = await response.json();

        if (result.success === false) {
          if (response.status === 404) {
            toast.error('No Business Profile', {
              description: 'Please complete onboarding first.',
            });
            router.push('/onboarding');
            return;
          }
          toast.error('Error', {
            description: result.error,
          });
          return;
        }

        // Success
        setProfile(result.data);

        // Pre-populate form fields
        setValue('businessName', result.data.businessName);
        setValue('phone', result.data.phone);
        setValue('email', result.data.email);
        setValue('googleReviewUrl', result.data.googleReviewUrl || '');
        setValue('facebookReviewUrl', result.data.facebookReviewUrl || '');
        setValue('yelpReviewUrl', result.data.yelpReviewUrl || '');

        // Reset dirty state after setting initial values
        setTimeout(() => {
          reset(formValues);
        }, 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Network Error', {
          description: 'Failed to load your business profile. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setValue, reset, router]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/business/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (result.success === false) {
        if (result.details) {
          toast.error('Validation Error', {
            description: result.details.join(', '),
          });
        } else {
          toast.error('Error', {
            description: result.error,
          });
        }
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        toast.error('Error', {
          description: 'Failed to save business profile',
        });
        setIsSubmitting(false);
        return;
      }

      // Success!
      setProfile(result.data);
      toast.success('Success!', {
        description: 'Your business profile has been updated successfully.',
      });

      // Reset form with new values to clear dirty state
      reset(data);
      setHasUnsavedChanges(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Network Error', {
        description: 'Failed to connect to the server. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    // Reset form to original values
    setValue('businessName', profile.businessName);
    setValue('phone', profile.phone);
    setValue('email', profile.email);
    setValue('googleReviewUrl', profile.googleReviewUrl || '');
    setValue('facebookReviewUrl', profile.facebookReviewUrl || '');
    setValue('yelpReviewUrl', profile.yelpReviewUrl || '');

    // Clear dirty state
    reset({
      businessName: profile.businessName,
      phone: profile.phone,
      email: profile.email,
      googleReviewUrl: profile.googleReviewUrl || '',
      facebookReviewUrl: profile.facebookReviewUrl || '',
      yelpReviewUrl: profile.yelpReviewUrl || '',
    });

    setHasUnsavedChanges(false);
    toast.info('Changes Discarded', {
      description: 'Form has been reset to original values.',
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Profile
        </h1>
        <p className="text-gray-600">
          Update your business information and review links
        </p>
        {profile && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated{' '}
            {formatDistanceToNow(new Date(profile.updatedAt), {
              addSuffix: true,
            })}
          </p>
        )}
      </div>

      {hasUnsavedChanges && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Unsaved Changes</p>
            <p className="text-sm text-amber-700">
              You have unsaved changes. Don't forget to save before leaving this
              page.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update your business details and review platform links. Fields
            marked with <span className="text-red-500">*</span> are required.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Business Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  {...register('businessName')}
                  className={errors.businessName ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.businessName && (
                  <p className="text-sm text-red-500">
                    {errors.businessName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Business Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Business Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Review Platform Links Section */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Review Platform Links
              </h3>

              {/* Google Review Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <Label htmlFor="googleReviewUrl">
                    Google Review Link <span className="text-red-500">*</span>
                  </Label>
                  <ReviewLinkHelpModal platform="google" />
                </div>
                <Input
                  id="googleReviewUrl"
                  type="url"
                  placeholder="https://g.page/your-business/review"
                  {...register('googleReviewUrl')}
                  className={errors.googleReviewUrl ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.googleReviewUrl && (
                  <p className="text-sm text-red-500">
                    {errors.googleReviewUrl.message}
                  </p>
                )}
              </div>

              {/* Facebook Review Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  <Label htmlFor="facebookReviewUrl">
                    Facebook Review Link{' '}
                    <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <ReviewLinkHelpModal platform="facebook" />
                </div>
                <Input
                  id="facebookReviewUrl"
                  type="url"
                  placeholder="https://facebook.com/yourbusiness/reviews"
                  {...register('facebookReviewUrl')}
                  className={errors.facebookReviewUrl ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.facebookReviewUrl && (
                  <p className="text-sm text-red-500">
                    {errors.facebookReviewUrl.message}
                  </p>
                )}
              </div>

              {/* Yelp Review Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#D32323"
                      d="M12.271 17.221c.07.361.171.589.292.822.07.121.171.211.281.292.111.07.232.121.363.141.131.03.262.03.393 0 .131-.02.262-.07.383-.141l4.747-2.663c.323-.181.525-.424.595-.747.07-.323-.02-.686-.252-.999-.232-.313-.565-.535-.938-.666l-4.818-1.575c-.131-.04-.262-.06-.393-.05-.131 0-.262.03-.383.09-.121.06-.232.141-.323.252-.09.111-.161.242-.201.383-.04.141-.05.292-.03.433.02.141.07.282.151.413l.934 4.015zm-7.95-3.545c.363.07.595.171.828.292.121.07.211.171.292.281.07.111.121.232.141.363.03.131.03.262 0 .393-.02.131-.07.262-.141.383l-2.663 4.747c-.181.323-.424.525-.747.595-.323.07-.686-.02-.999-.252-.313-.232-.535-.565-.666-.938L.791 14.722c-.04-.131-.06-.262-.05-.393 0-.131.03-.262.09-.383.06-.121.141-.232.252-.323.111-.09.242-.161.383-.201.141-.04.292-.05.433-.03.141.02.282.07.413.151l3.009.933zm16.364-2.958c-.363-.07-.595-.171-.828-.292-.121-.07-.211-.171-.292-.281-.07-.111-.121-.232-.141-.363-.03-.131-.03-.262 0-.393.02-.131.07-.262.141-.383l2.663-4.747c.181-.323.424-.525.747-.595.323-.07.686.02.999.252.313.232.535.565.666.938l1.575 4.818c.04.131.06.262.05.393 0 .131-.03.262-.09.383-.06.121-.141.232-.252.323-.111.09-.242.161-.383.201-.141.04-.292.05-.433.03-.141-.02-.282-.07-.413-.151l-4.009-.933zm-8.414-9.446c-.07-.363-.171-.595-.292-.828-.07-.121-.171-.211-.281-.292-.111-.07-.232-.121-.363-.141-.131-.03-.262-.03-.393 0-.131.02-.262.07-.383.141l-4.747 2.663c-.323.181-.525.424-.595.747-.07.323.02.686.252.999.232.313.565.535.938.666l4.818 1.575c.131.04.262.06.393.05.131 0 .262-.03.383-.09.121-.06.232-.141.323-.252.09-.111.161-.242.201-.383.04-.141.05-.292.03-.433-.02-.141-.07-.282-.151-.413l-.932-4.009zm1.717 4.545c-.424-.141-.848-.101-1.232.08-.383.181-.686.504-.858.938-.171.433-.171.908-.01 1.332.161.424.464.757.878.958.414.201.878.242 1.322.141.444-.101.828-.353 1.09-.717.262-.363.383-.797.343-1.231-.04-.433-.242-.827-.565-1.13-.323-.303-.717-.474-1.13-.494-.141-.01-.282 0-.424.03.151-.03.303-.04.464-.04.424 0 .848.181 1.151.494.303.313.485.717.525 1.151.04.433-.08.868-.343 1.231-.262.363-.646.616-1.09.717-.444.101-.908.06-1.322-.141-.414-.201-.717-.535-.878-.958-.161-.424-.161-.898.01-1.332.171-.433.475-.757.858-.938.383-.181.808-.221 1.232-.08z"
                    />
                  </svg>
                  <Label htmlFor="yelpReviewUrl">
                    Yelp Review Link{' '}
                    <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <ReviewLinkHelpModal platform="yelp" />
                </div>
                <Input
                  id="yelpReviewUrl"
                  type="url"
                  placeholder="https://yelp.com/biz/your-business"
                  {...register('yelpReviewUrl')}
                  className={errors.yelpReviewUrl ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.yelpReviewUrl && (
                  <p className="text-sm text-red-500">
                    {errors.yelpReviewUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || !hasUnsavedChanges}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || !hasUnsavedChanges}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
