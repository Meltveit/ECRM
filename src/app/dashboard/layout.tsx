'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return null;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}