'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [country, setCountry] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  function validateStep1() {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  }
  
  function validateStep2() {
    if (!firstName || !lastName || !phone || !country) {
      setError('Please fill in all fields');
      return false;
    }
    
    return true;
  }
  
  function validateStep3() {
    if (!teamName) {
      setError('Please enter a team name');
      return false;
    }
    
    return true;
  }
  
  function nextStep() {
    setError(null);
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  }
  
  function prevStep() {
    setError(null);
    setStep(step - 1);
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      // Create user with email and password
      const userCredential = await signUp(email, password);
      const user = userCredential.user;
      
      // Create a new team
      const teamRef = doc(db, 'teams', user.uid);
      await setDoc(teamRef, {
        name: teamName,
        createdAt: serverTimestamp(),
        planType: 'free',
        clientCount: 0
      });
      
      // Add user to team with admin role
      const userRef = doc(db, `teams/${user.uid}/users`, user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        phone,
        countryCode,
        country,
        role: 'admin',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      // Add user to global users collection for easier lookup
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        phone,
        countryCode,
        country,
        role: 'admin',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        teamId: user.uid
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={step === 3 ? handleSubmit : nextStep} className="space-y-6">
            {step === 1 && (
              <>
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </>
            )}
            
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                  
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Country Code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+1"
                    required
                  />
                  
                  <div className="col-span-2">
                    <Input
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="2025550123"
                      required
                    />
                  </div>
                </div>
                
                <Input
                  label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  required
                />
              </>
            )}
            
            {step === 3 && (
              <>
                <Input
                  label="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="My Company"
                  required
                />
                
                <p className="text-sm text-gray-600">
                  You'll be registered as the team admin. You can invite team members after registration.
                </p>
              </>
            )}
            
            <div className="flex justify-between">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                >
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                className={step === 1 ? 'w-full' : ''}
                isLoading={loading}
              >
                {step < 3 ? 'Next' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Step {step} of 3
          </p>
        </div>
      </div>
    </div>
  );
}