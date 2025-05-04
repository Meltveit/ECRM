import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM System',
  description: 'Modern CRM System built with Next.js, Firebase and Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}