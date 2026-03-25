import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Party Space - Interactive Party Games & Awards Ceremonies',
  description: 'Create unforgettable moments with Party Space. Host BET Awards ceremonies, play interactive party games with friends, family, or coworkers. No downloads required - works on any device!',
  openGraph: {
    title: 'Party Space - Interactive Party Games & Awards Ceremonies',
    description: 'Host BET Awards ceremonies and interactive party games. Perfect for schools, offices, and celebrations. No downloads required!',
    url: 'https://partyspace.tamashani.com/landing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Party Space - Where every gathering becomes unforgettable',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Party Space - Interactive Party Games & Awards Ceremonies',
    description: 'Host BET Awards ceremonies and interactive party games. Perfect for schools, offices, and celebrations. No downloads required!',
    images: ['/og-image.png'],
  },
};
