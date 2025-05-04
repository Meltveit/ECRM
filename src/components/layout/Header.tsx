import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

export default function Header() {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-primary">
          CRM System
        </Link>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <span className="text-sm text-gray-700">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <Button 
                variant="secondary" 
                onClick={() => signOut()}
                className="text-sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Link href="/login">
                <Button variant="secondary" className="text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}