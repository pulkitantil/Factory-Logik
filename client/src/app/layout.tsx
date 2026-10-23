import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIAssistantWidget from '../components/AIAssistantWidget';

export const metadata: Metadata = {
  title: 'Factorylogik and Controls — Industrial Automation Products & Engineering Services',
  description:
    'Industrial Automation, Controls & Engineering Marketplace from Factorylogik and Controls, Jaipur, Rajasthan. Premium PLCs, VFDs, HMIs, Motors, Sensors, Control Panels, and AI Assistance.',
  keywords: [
    'Factorylogik and Controls',
    'Factorylogik',
    'industrial automation',
    'PLC programming',
    'VFD inverters',
    'HMI panels',
    'servo drives',
    'control panels',
    'Jaipur',
    'Rajasthan',
    'India',
  ],
  authors: [{ name: 'Factorylogik and Controls Team' }],
  openGraph: {
    title: 'Factorylogik and Controls — Industrial Automation & Engineering Services',
    description: 'Industrial Automation & Control Gear Marketplace from Factorylogik and Controls, Jaipur, Rajasthan.',
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
