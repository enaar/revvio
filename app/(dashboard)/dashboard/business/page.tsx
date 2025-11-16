'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, HelpCircle } from 'lucide-react';
import { updateBusinessProfile } from '@/app/(dashboard)/onboarding/actions';
import { BusinessProfile } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  businessName?: string;
  phone?: string;
  email?: string;
  googleReviewUrl?: string;
  facebookReviewUrl?: string;
  yelpReviewUrl?: string;
  error?: string;
  success?: string;
};

type BusinessFormProps = {
  state: ActionState;
  profile?: BusinessProfile | null;
};

function BusinessForm({ state, profile }: BusinessFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="businessName">
          Business Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="businessName"
          name="businessName"
          placeholder="Enter your business name"
          defaultValue={state.businessName || profile?.businessName || ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Business Phone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
          defaultValue={state.phone || profile?.phone || ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Business Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="business@example.com"
          defaultValue={state.email || profile?.email || ''}
          required
        />
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Platform Links</h3>

        <div className="space-y-4">
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
            </div>
            <Input
              id="googleReviewUrl"
              name="googleReviewUrl"
              type="url"
              placeholder="https://g.page/your-business/review"
              defaultValue={state.googleReviewUrl || profile?.googleReviewUrl || ''}
              required
            />
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
              name="facebookReviewUrl"
              type="url"
              placeholder="https://facebook.com/yourbusiness/reviews"
              defaultValue={state.facebookReviewUrl || profile?.facebookReviewUrl || ''}
            />
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
              name="yelpReviewUrl"
              type="url"
              placeholder="https://yelp.com/biz/your-business"
              defaultValue={state.yelpReviewUrl || profile?.yelpReviewUrl || ''}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function BusinessFormWithData({ state }: { state: ActionState }) {
  const { data: profile } = useSWR<BusinessProfile | null>('/api/business-profile', fetcher);

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No business profile found. Please complete the onboarding first.</p>
        <Button asChild>
          <a href="/onboarding" className="bg-orange-500 hover:bg-orange-600 text-white">
            Complete Onboarding
          </a>
        </Button>
      </div>
    );
  }

  return <BusinessForm state={state} profile={profile} />;
}

export default function BusinessPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateBusinessProfile,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Business Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Manage your business information and review platform links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            }>
              <BusinessFormWithData state={state} />
            </Suspense>

            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm">{state.success}</p>
            )}

            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
