import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Amana Lofts | Income-Qualified Rentals in Ala Moana Honolulu",
  description:
    "Amana Lofts is a new income-qualified rental community at 765 Amana Street in Ala Moana, Honolulu, featuring studio, one-bedroom, and two-bedroom homes. Check eligibility and join launch updates.",
  keywords: "Amana Lofts, Honolulu apartments, affordable rentals Ala Moana, income-qualified Honolulu, Ala Moana lofts, Honolulu affordable housing",
  authors: [{ name: "JL Capital" }],
  openGraph: {
    title: "Amana Lofts | Income-Qualified Rentals in Ala Moana Honolulu",
    description: "64 new studio, one-bedroom, and two-bedroom homes featuring high ceilings, large windows, and everyday convenience in Ala Moana.",
    url: "https://amanalofts.com",
    siteName: "Amana Lofts",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema markup definitions
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ApartmentComplex",
        "@id": "https://amanalofts.com/#project",
        "name": "Amana Lofts",
        "description": "Affordable rental housing project in Ala Moana, Honolulu.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "765 Amana Street",
          "addressLocality": "Honolulu",
          "addressRegion": "HI",
          "postalCode": "96814",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "21.2995",
          "longitude": "-157.8427"
        },
        "numberOfAccommodationUnits": 64,
        "propertySize": {
          "@type": "QuantitativeValue",
          "value": 64,
          "unitText": "Apartments"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "Amana Lofts Leasing Office",
        "image": "https://amanalofts.com/images/Exterior-of-planned-765-Amana-Street-project.webp",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "765 Amana Street",
          "addressLocality": "Honolulu",
          "addressRegion": "HI",
          "postalCode": "96814",
          "addressCountry": "US"
        },
        "url": "https://amanalofts.com",
        "telephone": "",
        "priceRange": "$$"
      }
    ]
  };

  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <head>
        {/* Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Google Analytics Hook (Placeholder - Replace GA_MEASUREMENT_ID with real ID) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GA_MEASUREMENT_ID', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* Meta Pixel Hook (Placeholder - Replace PIXEL_ID with real ID) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col font-sans text-charcoal-body bg-neutral-ivory select-none md:select-text">
        {/* Sky-style Absolute/Sticky Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
