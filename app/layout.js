import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Deliveron - Order Management',
  description: 'Order and manage your Deliveron email infrastructure subscriptions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black`}>
        {children}
      </body>
    </html>
  );
}
