'use client';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { Provider } from 'react-redux';
import { rootStore } from './core/store';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <title>MOS — Medical Outreach System</title>
        <meta
          name="description"
          content="A comprehensive system to manage medical outreaches, volunteers, and resources efficiently."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="og:title" content="MOS — Medical Outreach System" />
      </head>
      <body className="min-h-full flex flex-col">
        <Provider store={rootStore}>{children}</Provider>
      </body>
    </html>
  );
}
