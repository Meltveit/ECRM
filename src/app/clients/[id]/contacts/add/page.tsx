'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function AddContactPage({ params }: { params: { id: string } }) {
  const { id: clientId } = params;
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const teamId = await getCurrentUserTeamId();
      
      if (!teamId) {
        throw new Error('Team not found');
      }
      
      // Add contact to Firestore
      await addDoc(collection(db, `teams/${teamId}/contacts`), {
        clientId,
        name,
        position,
        email,
        phone,
        notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      router.push(`/clients/${clientId}`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to add contact. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Contact</h1>
      
      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Contact Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
          
          <Input
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="CEO"
          />
          
          <Input
            label="Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
            required
          />
          
          <Input
            label="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 202-555-0123"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="input"
              placeholder="Add any notes about this contact..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Link href={`/clients/${clientId}`}>
              <Button
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={loading}
            >
              Add Contact
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}