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
import { ActivityType } from '@/types/activity';

export default function AddActivityPage({ params }: { params: { id: string } }) {
  const { id: clientId } = params;
  const [type, setType] = useState<ActivityType>('meeting');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!type || !date || !description) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const teamId = await getCurrentUserTeamId();
      
      if (!teamId || !currentUser) {
        throw new Error('User or team not found');
      }
      
      // Add activity to Firestore
      await addDoc(collection(db, `teams/${teamId}/activities`), {
        clientId,
        type,
        date: new Date(date),
        description,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      router.push(`/clients/${clientId}`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to add activity. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Activity</h1>
      
      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="input"
              required
            >
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="note">Note</option>
            </select>
          </div>
          
          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input"
              placeholder="Describe the activity..."
              required
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
              Add Activity
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}