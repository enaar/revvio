'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

type Platform = 'google' | 'facebook' | 'yelp';

interface ReviewLinkHelpModalProps {
  platform: Platform;
  trigger?: React.ReactNode;
}

interface PlatformContent {
  title: string;
  description: string;
  steps: string[];
  exampleUrl: string;
  videoUrl?: string;
  tips?: string[];
}

const platformContent: Record<Platform, PlatformContent> = {
  google: {
    title: 'How to Find Your Google Review Link',
    description: 'Follow these steps to get your Google Business review link',
    steps: [
      'Open Google Maps or Google Search',
      'Search for your business name and location',
      'Click on your business listing when it appears',
      'Scroll down and look for the "Share" button',
      'Click "Share" and you\'ll see the review link option',
      'Alternatively, click "Write a review" and copy the URL from your browser',
      'Copy the link and paste it in the form',
    ],
    exampleUrl: 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID',
    videoUrl: 'https://www.youtube.com/embed/kKEHvwbPHio',
    tips: [
      'The link usually starts with "https://g.page/" or "https://search.google.com/local/writereview"',
      'Make sure you\'re using your verified Google Business Profile',
      'Test the link in an incognito window to ensure it works',
    ],
  },
  facebook: {
    title: 'How to Find Your Facebook Review Link',
    description: 'Get your Facebook page reviews link in just a few steps',
    steps: [
      'Go to facebook.com and log into your account',
      'Navigate to your business page',
      'Look at your page URL in the browser address bar',
      'Your page URL looks like: facebook.com/YourPageName',
      'Add "/reviews" to the end of your page URL',
      'Your final review link: facebook.com/YourPageName/reviews',
      'Copy this link and paste it in the form',
    ],
    exampleUrl: 'https://www.facebook.com/YourBusinessName/reviews',
    tips: [
      'Replace "YourBusinessName" with your actual Facebook page name',
      'You can find your page name in the URL when viewing your page',
      'The reviews tab must be enabled on your page settings',
    ],
  },
  yelp: {
    title: 'How to Find Your Yelp Review Link',
    description: 'Get your Yelp business review link quickly',
    steps: [
      'Go to Yelp.com',
      'Search for your business name and location',
      'Click on your business listing from the search results',
      'Once on your business page, look for the "Write a Review" button',
      'Click the "Write a Review" button',
      'Copy the URL from your browser\'s address bar',
      'This is your Yelp review link - paste it in the form',
    ],
    exampleUrl: 'https://www.yelp.com/writeareview/biz/your-business-name',
    tips: [
      'The link usually contains "/writeareview/biz/" in the URL',
      'Make sure you\'re logged into your Yelp Business account',
      'Claim your business on Yelp if you haven\'t already',
    ],
  },
};

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case 'google':
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'yelp':
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#D32323" d="M12.271 17.221c.07.361.171.589.292.822.07.121.171.211.281.292.111.07.232.121.363.141.131.03.262.03.393 0 .131-.02.262-.07.383-.141l4.747-2.663c.323-.181.525-.424.595-.747.07-.323-.02-.686-.252-.999-.232-.313-.565-.535-.938-.666l-4.818-1.575c-.131-.04-.262-.06-.393-.05-.131 0-.262.03-.383.09-.121.06-.232.141-.323.252-.09.111-.161.242-.201.383-.04.141-.05.292-.03.433.02.141.07.282.151.413l.934 4.015zm-7.95-3.545c.363.07.595.171.828.292.121.07.211.171.292.281.07.111.121.232.141.363.03.131.03.262 0 .393-.02.131-.07.262-.141.383l-2.663 4.747c-.181.323-.424.525-.747.595-.323.07-.686-.02-.999-.252-.313-.232-.535-.565-.666-.938L.791 14.722c-.04-.131-.06-.262-.05-.393 0-.131.03-.262.09-.383.06-.121.141-.232.252-.323.111-.09.242-.161.383-.201.141-.04.292-.05.433-.03.141.02.282.07.413.151l3.009.933zm16.364-2.958c-.363-.07-.595-.171-.828-.292-.121-.07-.211-.171-.292-.281-.07-.111-.121-.232-.141-.363-.03-.131-.03-.262 0-.393.02-.131.07-.262.141-.383l2.663-4.747c.181-.323.424-.525.747-.595.323-.07.686.02.999.252.313.232.535.565.666.938l1.575 4.818c.04.131.06.262.05.393 0 .131-.03.262-.09.383-.06.121-.141.232-.252.323-.111.09-.242.161-.383.201-.141.04-.292.05-.433.03-.141-.02-.282-.07-.413-.151l-4.009-.933zm-8.414-9.446c-.07-.363-.171-.595-.292-.828-.07-.121-.171-.211-.281-.292-.111-.07-.232-.121-.363-.141-.131-.03-.262-.03-.393 0-.131.02-.262.07-.383.141l-4.747 2.663c-.323.181-.525.424-.595.747-.07.323.02.686.252.999.232.313.565.535.938.666l4.818 1.575c.131.04.262.06.393.05.131 0 .262-.03.383-.09.121-.06.232-.141.323-.252.09-.111.161-.242.201-.383.04-.141.05-.292.03-.433-.02-.141-.07-.282-.151-.413l-.932-4.009zm1.717 4.545c-.424-.141-.848-.101-1.232.08-.383.181-.686.504-.858.938-.171.433-.171.908-.01 1.332.161.424.464.757.878.958.414.201.878.242 1.322.141.444-.101.828-.353 1.09-.717.262-.363.383-.797.343-1.231-.04-.433-.242-.827-.565-1.13-.323-.303-.717-.474-1.13-.494-.141-.01-.282 0-.424.03.151-.03.303-.04.464-.04.424 0 .848.181 1.151.494.303.313.485.717.525 1.151.04.433-.08.868-.343 1.231-.262.363-.646.616-1.09.717-.444.101-.908.06-1.322-.141-.414-.201-.717-.535-.878-.958-.161-.424-.161-.898.01-1.332.171-.433.475-.757.858-.938.383-.181.808-.221 1.232-.08z"/>
        </svg>
      );
  }
};

export function ReviewLinkHelpModal({ platform, trigger }: ReviewLinkHelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const content = platformContent[platform];

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(content.exampleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            How do I find this?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <PlatformIcon platform={platform} />
            <DialogTitle className="text-2xl">{content.title}</DialogTitle>
          </div>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step-by-step instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step-by-Step Instructions:</h3>
            <ol className="space-y-3">
              {content.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Example URL */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">Example URL Format:</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyExample}
                className="h-8"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Example
                  </>
                )}
              </Button>
            </div>
            <code className="text-sm text-gray-600 break-all block">
              {content.exampleUrl}
            </code>
          </div>

          {/* Video Tutorial (if available) */}
          {content.videoUrl && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Video Tutorial:</h4>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  src={content.videoUrl}
                  title={`${content.title} Video Tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Tips */}
          {content.tips && content.tips.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Helpful Tips:
              </h4>
              <ul className="space-y-2">
                {content.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-blue-800 flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
