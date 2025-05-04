'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ClientStatus } from '@/types/client';

export default function AddClientPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name || !company || !email || !phone || !country) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const teamId = await getCurrentUserTeamId();
      
      if (!teamId || !currentUser) {
        throw new Error('User or team not found');
      }
      
      // Add client to Firestore
      await addDoc(collection(db, `teams/${teamId}/clients`), {
        name,
        company,
        email,
        phone,
        country,
        status,
        notes,
        tags,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        updatedAt: serverTimestamp()
      });
      
      // Increment client count in team info
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        clientCount: increment(1)
      });
      
      router.push('/clients');
    } catch (err: any) {
      console.error(err);
      setError('Failed to add client. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  }
  
  function removeTag(tagToRemove: string) {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  return (
    <><div className="space-y-6"></div><div className="space-y-6">
          <h1 className="text-2xl font-bold">Add New Client</h1>

          <Card>
              {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {error}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                          label="Client Name *"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe or Company Name"
                          required />

                      <Input
                          label="Company *"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Company LLC"
                          required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                          label="Email *"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@example.com"
                          required />

                      <Input
                          label="Phone *"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 202-555-0123"
                          required />
                  </div>

                  <Input
                      label="Country *"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      required />

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                      </label>
                      <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ClientStatus)}
                          className="input"
                          required
                      >
                          <option value="lead">Lead</option>
                          <option value="prospect">Prospect</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                      </select>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                      </label>
                      <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="input"
                          placeholder="Add any notes about this client..." />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map(tag => (
                              <span
                                  key={tag}
                                  className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center"
                              >
                                  {tag}
                                  <button
                                      type="button"
                                      onClick={() => removeTag(tag)}
                                      className="ml-1 text-gray-500 hover:text-gray-700"
                                  >
                                      &times;
                                  </button>
                              </span>
                          ))}
                      </div>
                      <div className="flex">
                          <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a tag..."
                              className="flex-grow" />
                          <Button
                              type="button"
                              variant="secondary"
                              onClick={addTag}
                              className="ml-2"
                          >
                              Add
                          </Button>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                      <Button
                          type="button"
                          variant="secondary"
                          onClick={() => router.push('/clients')}
                      >
                          Cancel
                      </Button>
                      <Button
                          type="submit"
                          isLoading={loading}
                      >
                          Add Client
                      </Button>
                  </div>
              </form>
          </Card>
      </div></>
  );
}