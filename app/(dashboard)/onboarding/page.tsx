'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  onboardingSchema,
  type OnboardingFormData
} from '@/lib/validations/business';
import { createBusinessProfile } from './actions';

type FormData = OnboardingFormData;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger(['businessName', 'phone', 'email']);
    } else if (currentStep === 2) {
      isValid = await trigger(['googleReviewUrl', 'facebookReviewUrl', 'yelpReviewUrl']);
    }

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSkipStep2 = () => {
    setCurrentStep(3);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const result = await createBusinessProfile({}, formData);

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        // Move to success step
        setCurrentStep(3);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  const handleAddCustomers = () => {
    router.push('/dashboard/customers');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[600px]">
        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep === 3 ? 'Welcome to Revvio!' : 'Business Onboarding'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Let\'s start with your basic business information'}
            {currentStep === 2 && 'Where should we send your customers for reviews?'}
            {currentStep === 3 && 'You\'re all set to start collecting reviews!'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {currentStep < 3 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {totalSteps - 1}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    {...register('businessName')}
                    className={errors.businessName ? 'border-red-500' : ''}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

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
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Review Destination Links */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Google Review Link */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <Label htmlFor="googleReviewUrl">
                      Google Review Link <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Find this by searching your business on Google Maps, click "Share" &gt; "Embed a map" or get the review link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="h-6 px-2">
                          <HelpCircle className="w-3 h-3 mr-1" />
                          Guide
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>How to Find Your Google Review Link</DialogTitle>
                          <DialogDescription>
                            Follow these steps to get your Google review link:
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <ol className="list-decimal list-inside space-y-3 text-sm">
                            <li>Search for your business on Google Maps</li>
                            <li>Click on your business listing</li>
                            <li>Scroll down and click on the reviews section</li>
                            <li>Click "Share" or look for the share icon</li>
                            <li>Copy the link that appears</li>
                            <li>Alternatively, click "Write a review" and copy that URL</li>
                          </ol>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>Example:</strong> https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    id="googleReviewUrl"
                    type="url"
                    placeholder="https://g.page/your-business/review"
                    {...register('googleReviewUrl')}
                    className={errors.googleReviewUrl ? 'border-red-500' : ''}
                  />
                  {errors.googleReviewUrl && (
                    <p className="text-sm text-red-500">
                      {errors.googleReviewUrl.message}
                    </p>
                  )}
                </div>

                {/* Facebook Review Link */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <Label htmlFor="facebookReviewUrl">
                      Facebook Review Link <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Your Facebook page URL + /reviews (e.g., facebook.com/yourbusiness/reviews)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="facebookReviewUrl"
                    type="url"
                    placeholder="https://facebook.com/yourbusiness/reviews"
                    {...register('facebookReviewUrl')}
                    className={errors.facebookReviewUrl ? 'border-red-500' : ''}
                  />
                  {errors.facebookReviewUrl && (
                    <p className="text-sm text-red-500">
                      {errors.facebookReviewUrl.message}
                    </p>
                  )}
                </div>

                {/* Yelp Review Link */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#D32323" d="M12.271 17.221c.07.361.171.589.292.822.07.121.171.211.281.292.111.07.232.121.363.141.131.03.262.03.393 0 .131-.02.262-.07.383-.141l4.747-2.663c.323-.181.525-.424.595-.747.07-.323-.02-.686-.252-.999-.232-.313-.565-.535-.938-.666l-4.818-1.575c-.131-.04-.262-.06-.393-.05-.131 0-.262.03-.383.09-.121.06-.232.141-.323.252-.09.111-.161.242-.201.383-.04.141-.05.292-.03.433.02.141.07.282.151.413l.934 4.015zm-7.95-3.545c.363.07.595.171.828.292.121.07.211.171.292.281.07.111.121.232.141.363.03.131.03.262 0 .393-.02.131-.07.262-.141.383l-2.663 4.747c-.181.323-.424.525-.747.595-.323.07-.686-.02-.999-.252-.313-.232-.535-.565-.666-.938L.791 14.722c-.04-.131-.06-.262-.05-.393 0-.131.03-.262.09-.383.06-.121.141-.232.252-.323.111-.09.242-.161.383-.201.141-.04.292-.05.433-.03.141.02.282.07.413.151l3.009.933zm16.364-2.958c-.363-.07-.595-.171-.828-.292-.121-.07-.211-.171-.292-.281-.07-.111-.121-.232-.141-.363-.03-.131-.03-.262 0-.393.02-.131.07-.262.141-.383l2.663-4.747c.181-.323.424-.525.747-.595.323-.07.686.02.999.252.313.232.535.565.666.938l1.575 4.818c.04.131.06.262.05.393 0 .131-.03.262-.09.383-.06.121-.141.232-.252.323-.111.09-.242.161-.383.201-.141.04-.292.05-.433.03-.141-.02-.282-.07-.413-.151l-4.009-.933zm-8.414-9.446c-.07-.363-.171-.595-.292-.828-.07-.121-.171-.211-.281-.292-.111-.07-.232-.121-.363-.141-.131-.03-.262-.03-.393 0-.131.02-.262.07-.383.141l-4.747 2.663c-.323.181-.525.424-.595.747-.07.323.02.686.252.999.232.313.565.535.938.666l4.818 1.575c.131.04.262.06.393.05.131 0 .262-.03.383-.09.121-.06.232-.141.323-.252.09-.111.161-.242.201-.383.04-.141.05-.292.03-.433-.02-.141-.07-.282-.151-.413l-.932-4.009zm1.717 4.545c-.424-.141-.848-.101-1.232.08-.383.181-.686.504-.858.938-.171.433-.171.908-.01 1.332.161.424.464.757.878.958.414.201.878.242 1.322.141.444-.101.828-.353 1.09-.717.262-.363.383-.797.343-1.231-.04-.433-.242-.827-.565-1.13-.323-.303-.717-.474-1.13-.494-.141-.01-.282 0-.424.03.151-.03.303-.04.464-.04.424 0 .848.181 1.151.494.303.313.485.717.525 1.151.04.433-.08.868-.343 1.231-.262.363-.646.616-1.09.717-.444.101-.908.06-1.322-.141-.414-.201-.717-.535-.878-.958-.161-.424-.161-.898.01-1.332.171-.433.475-.757.858-.938.383-.181.808-.221 1.232-.08z"/>
                    </svg>
                    <Label htmlFor="yelpReviewUrl">
                      Yelp Review Link <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Find your business on Yelp, click "Write a Review" and copy the URL</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="yelpReviewUrl"
                    type="url"
                    placeholder="https://yelp.com/biz/your-business"
                    {...register('yelpReviewUrl')}
                    className={errors.yelpReviewUrl ? 'border-red-500' : ''}
                  />
                  {errors.yelpReviewUrl && (
                    <p className="text-sm text-red-500">
                      {errors.yelpReviewUrl.message}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> You can skip this step for now, but you'll need to add at least one review platform link before sending review requests to customers.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Success Page */}
            {currentStep === 3 && (
              <div className="space-y-6 text-center py-8">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-20 h-20 text-green-500" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    You're all set!
                  </h2>
                  <p className="text-gray-600">
                    Your business profile has been created successfully.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    What you can do next:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Add your first customers</p>
                        <p className="text-sm text-gray-600">Import or manually add customer contact information</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Send your first review request</p>
                        <p className="text-sm text-gray-600">Start collecting reviews via SMS or email</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Check out the dashboard</p>
                        <p className="text-sm text-gray-600">View analytics and track your review requests</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button
                    type="button"
                    onClick={handleFinish}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomers}
                  >
                    Add Customers
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && currentStep < 3 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex gap-3">
                  {currentStep === 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkipStep2}
                      disabled={isSubmitting}
                    >
                      Skip for now
                    </Button>
                  )}

                  {currentStep === 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Finish
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
