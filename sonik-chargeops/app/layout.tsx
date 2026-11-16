import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChargeOps — Sonik EV Platform Operations Dashboard',
  description: 'Enterprise EV charging network management dashboard for station operators and administrators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans">{children}</body>
    </html>
  );
}
