import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'DeliverOn - Enterprise Email Infrastructure',
  description: 'Enterprise-grade cold email infrastructure. Dedicated Microsoft inboxes built for volume.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[hsl(222,47%,6%)] antialiased`}>
        <div className="min-h-screen bg-radial-gradient">
          {children}
        </div>
      </body>
    </html>
  );
}
