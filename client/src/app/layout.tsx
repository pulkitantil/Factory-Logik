import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIAssistantWidget from '../components/AIAssistantWidget';

export const metadata: Metadata = {
  title: 'Factorylogik and Controls — Premium Electronics, Automation & Tech Gear',
  description:
    'Modern Electronics & Automation Marketplace from Factorylogik and Controls, Jaipur, Rajasthan. Premium laptops, smartphones, sound, control gear, and AI shopping assistance.',
  keywords: [
    'Factorylogik and Controls',
    'Factorylogik',
    'electronics',
    'automation',
    'controls',
    'laptops',
    'smartphones',
    'Jaipur',
    'Rajasthan',
    'India',
  ],
  authors: [{ name: 'Factorylogik and Controls Team' }],
  openGraph: {
    title: 'Factorylogik and Controls — Premium Electronics & Tech Gear',
    description: 'Modern Electronics & Automation Marketplace from Factorylogik and Controls, Jaipur, Rajasthan.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-voltrix-bg text-voltrix-dark min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <AIAssistantWidget />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
