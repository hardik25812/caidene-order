import './globals.css';

export const metadata = {
  title: 'DeliverOn - Order Management',
  description: 'Order and manage your DeliverOn email infrastructure subscriptions',
  icons: {
    icon: 'https://framerusercontent.com/images/EY67cx4GjFOdVpO8adYkTVf3Mto.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Public+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-screen bg-[#020202] font-body text-[#f2f2f2] antialiased">
        {children}
      </body>
    </html>
  );
}
