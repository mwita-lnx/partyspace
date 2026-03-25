import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BET Awards - Create Your Own Awards Ceremony',
  description: 'Host your own BET-style awards ceremony. Vote for best dressed, class clown, most likely to succeed, and more. Perfect for schools, offices, and celebrations.',
  keywords: [
    'BET awards',
    'awards ceremony',
    'superlatives',
    'yearbook awards',
    'office awards',
    'graduation awards',
    'voting game',
    'class awards',
    'senior superlatives',
    'party awards'
  ],
  openGraph: {
    title: 'BET Awards - Create Your Own Awards Ceremony',
    description: 'Host your own BET-style awards ceremony. Vote for best dressed, class clown, most likely to succeed, and more.',
    url: 'https://partyspace.tamashani.com/bet-awards',
    images: [
      {
        url: '/og-bet-awards.png',
        width: 1200,
        height: 630,
        alt: 'BET Awards - Create Your Own Awards Ceremony',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BET Awards - Create Your Own Awards Ceremony',
    description: 'Host your own BET-style awards ceremony. Vote for best dressed, class clown, most likely to succeed, and more.',
    images: ['/og-bet-awards.png'],
  },
};

export default function BETAwardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
