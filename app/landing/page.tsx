'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function LandingPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const features = [
    { image: '/podium.gif', title: 'BET Awards', desc: 'Vote for best dressed, class clown, most likely to succeed, and more!', isGif: true }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleGoToBETAwards = () => {
    router.push('/bet-awards');
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Party Space",
    "description": "Create unforgettable moments with Party Space. Host BET Awards ceremonies, play interactive party games with friends, family, or coworkers.",
    "url": "https://partyspace.tamashani.com",
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "BET Awards Ceremonies",
      "Interactive Voting",
      "Custom Award Categories",
      "Real-time Results",
      "Mobile-Friendly",
      "No Downloads Required"
    ]
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div
        className="min-h-screen p-4 overflow-x-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
      {/* Header with Install and Profile Buttons */}
      <div className="max-w-6xl mx-auto pt-8 mb-4 flex justify-end gap-3">
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white backdrop-blur-sm rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Install App
          </button>
        )}
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg font-semibold text-gray-700 hover:bg-white transition-all shadow-md"
        >
          <Image src="/receptionist.png" alt="Profile" width={24} height={24} />
          My Profile
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto pb-20">
        <div className="text-center mb-16">
          <h1
            className="text-8xl font-bold mb-6 animate-float"
            style={{
              fontFamily: "'Flavors', cursive",
              background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #FFE66D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Party Space
          </h1>

          <p className="text-2xl text-gray-700 mb-8 font-medium">
            Where every gathering becomes unforgettable
          </p>

          {/* Feature Carousel */}
          <div className="mb-12 h-24 flex items-center justify-center">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-500 ${
                  activeFeature === index
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg">
                  <Image src={feature.image} alt={feature.title} width={48} height={48} className="object-contain" />
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">6+</div>
              <div className="text-sm text-gray-600">Award Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">500</div>
              <div className="text-sm text-gray-600">Max Players</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-600">Fun Moments</div>
            </div>
          </div>
        </div>

        {/* BET Awards Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <button
            onClick={handleGoToBETAwards}
            className="w-full bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-3xl shadow-2xl p-12 border-4 border-yellow-300 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image src="/podium.gif" alt="BET Awards" width={120} height={120} unoptimized className="object-contain" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                🏆 BET Awards
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Host your own awards ceremony for any group or event
              </p>

              <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg">
                <span className="text-lg font-bold text-gray-900">Enter BET Awards</span>
                <span className="text-2xl">→</span>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                Perfect for schools, offices, parties, and celebrations
              </div>
            </div>
          </button>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="font-bold text-gray-900">1</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Create or Join</h3>
              <p className="text-gray-600 text-sm">
                Host creates a room and shares the code, or join with a code from your host
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="font-bold text-gray-900">2</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Play Together</h3>
              <p className="text-gray-600 text-sm">
                Vote, answer questions, or compete in real-time with everyone in the room
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="font-bold text-gray-900">3</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">See Results</h3>
              <p className="text-gray-600 text-sm">
                Reveal winners, share laughs, and create memories that last
              </p>
            </div>
          </div>
        </div>


        {/* Use Cases Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perfect For Any Occasion
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { image: '/trophy.png', title: 'School Events', desc: 'Yearbook superlatives, senior class awards, graduation celebrations' },
              { image: '/office.png', title: 'Office Parties', desc: 'Team awards, holiday parties, virtual team building' },
              { image: '/fireworks.png', title: 'Celebrations', desc: 'Birthday parties, family reunions, friend group gatherings' },
              { image: '/podium.gif', title: 'Award Shows', desc: 'Host your own awards ceremony for any group or event' }
            ].map((useCase, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Image src={useCase.image} alt={useCase.title} width={64} height={64} className="object-contain" unoptimized={useCase.image.endsWith('.gif')} />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{useCase.title}</h3>
                    <p className="text-gray-600 text-sm">{useCase.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Party Space?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { image: '/fireworks.png', title: 'Easy Setup', desc: 'Create your BET Awards in under a minute.' },
              { image: '/receptionist.png', title: 'Works Everywhere', desc: 'Any device, any browser. Mobile-friendly.' },
              { image: '/magic-wand.png', title: 'Fully Customizable', desc: 'Add your own award categories with emoji picker.' },
              { image: '/trophy.png', title: 'Unlimited Players', desc: 'From 3 to 500 players. Scale as needed.' },
              { image: '/podium.gif', title: 'Beautiful Results', desc: 'See results with pie charts and bar graphs.' },
              { image: '/dice.png', title: 'No Downloads', desc: 'No apps, no installs. Just share the PIN and play.' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-3">
                  <Image src={feature.image} alt={feature.title} width={64} height={64} className="object-contain" unoptimized={feature.image.endsWith('.gif')} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto text-center bg-white p-12 rounded-3xl shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Host Your Own BET Awards?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your awards ceremony in under a minute
          </p>
          <button
            onClick={handleGoToBETAwards}
            className="px-8 py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Go to BET Awards →
          </button>
        </div>
      </div>


      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
      </div>
    </>
  );
}
