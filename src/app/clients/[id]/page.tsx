'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Client, ClientStatus } from '@/types/client';
import { Contact } from '@/types/contact';
import { Activity } from '@/types/activity';

export default function ClientDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchClientData() {
      if (!currentUser) return;
      
      try {
        const teamId = await getCurrentUserTeamId();
        
        if (teamId) {
          // Fetch client
          const clientDoc = await getDoc(doc(db, `teams/${teamId}/clients`, id));
          
          if (clientDoc.exists()) {
            setClient({
              id: clientDoc.id,
              ...clientDoc.data()
            } as Client);
            
            // Fetch contacts
            const contactsQuery = query(
              collection(db, `teams/${teamId}/contacts`),
              where('clientId', '==', id)
            );
            
            const contactsSnapshot = await getDocs(contactsQuery);
            const contactsData: Contact[] = contactsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Contact));
            
            setContacts(contactsData);
            
            // Fetch activities
            const activitiesQuery = query(
              collection(db, `teams/${teamId}/activities`),
              where('clientId', '==', id)
            );
            
            const activitiesSnapshot = await getDocs(activitiesQuery);
            const activitiesData: Activity[] = activitiesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Activity));
            
            setActivities(activitiesData);
          } else {
            // Client not found
            router.push('/clients');
          }
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchClientData();
  }, [currentUser, getCurrentUserTeamId, id, router]);

  async function updateClientStatus(newStatus: ClientStatus) {
    if (!client) return;
    
    try {
      const teamId = await getCurrentUserTeamId();
      
      if (teamId) {
        const clientRef = doc(db, `teams/${teamId}/clients`, id);
        
        await updateDoc(clientRef, {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
        
        setClient({
          ...client,
          status: newStatus
        });
        
        setStatusDropdown(false);
      }
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  }

  async function handleDeleteClient() {
    if (!client) return;
    
    try {
      const teamId = await getCurrentUserTeamId();
      
      if (teamId) {
        // Delete client
        await deleteDoc(doc(db, `teams/${teamId}/clients`, id));
        
        // Delete associated contacts
        for (const contact of contacts) {
          await deleteDoc(doc(db, `teams/${teamId}/contacts`, contact.id));
        }
        
        // Delete associated activities
        for (const activity of activities) {
          await deleteDoc(doc(db, `teams/${teamId}/activities`, activity.id));
        }
        
        router.push('/clients');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
        <p className="mt-2 text-gray-600">The client you're looking for doesn't exist.</p>
        <Link href="/clients" className="mt-4 inline-block">
          <Button>Back to Clients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        
        <div className="flex space-x-2">
          <div className="relative">
            <Button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className={`status-${client.status} border-none`}
            >
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            
            {statusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => updateClientStatus('lead')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Lead
                  </button>
                  <button
                    onClick={() => updateClientStatus('prospect')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Prospect
                  </button>
                  <button
                    onClick={() => updateClientStatus('active')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => updateClientStatus('inactive')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Inactive
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="danger"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{client.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{client.country}</p>
                </div>
              </div>
              
              {client.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="whitespace-pre-line">{client.notes}</p>
                </div>
              )}
              
              {client.tags && client.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <div className="mt-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Activities</h2>
                
                <Link href={`/clients/${id}/activities/add`}>
                  <Button>
                    Add Activity
                  </Button>
                </Link>
              </div>
              
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="p-4 bg-gray-50 rounded-md">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {activity.type === 'meeting' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {activity.type === 'call' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          )}
                          {activity.type === 'email' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {activity.type === 'note' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">
                              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.date instanceof Date 
                                ? activity.date.toLocaleDateString() 
                                : new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="mt-1 whitespace-pre-line">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No activities recorded yet.</p>
              )}
            </Card>
          </div>
        </div>
        
        <div>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Contacts</h2>
              
              <Link href={`/clients/${id}/contacts/add`}>
                <Button>
                  Add Contact
                </Button>
              </Link>
            </div>
            
            {contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map(contact => (
                  <div key={contact.id} className="p-4 bg-gray-50 rounded-md">
                    <p className="font-medium">{contact.name}</p>
                    {contact.position && (
                      <p className="text-sm text-gray-600">{contact.position}</p>
                    )}
                    <div className="mt-2 text-sm">
                      <p className="flex items-center text-gray-500 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contact.email}
                      </p>
                      <p className="flex items-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No contacts added yet.</p>
            )}
          </Card>
        </div>
      </div>
      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Client</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this client? This will also delete all associated contacts and activities. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteClient}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}