'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Client, ClientStatus } from '@/types/client';

export default function ClientsPage() {
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ClientStatus | 'all'>('all');

  useEffect(() => {
    async function fetchClients() {
      if (!currentUser) return;
      
      try {
        const teamId = await getCurrentUserTeamId();
        
        if (teamId) {
          const clientsQuery = query(
            collection(db, `teams/${teamId}/clients`),
            orderBy('createdAt', 'desc')
          );
          
          const clientsSnapshot = await getDocs(clientsQuery);
          const clientsData: Client[] = clientsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Client));
          
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchClients();
  }, [currentUser, getCurrentUserTeamId]);

  const filteredClients = activeFilter === 'all'
    ? clients
    : clients.filter(client => client.status === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        
        <Link href="/clients/add">
          <Button>
            Add Client
          </Button>
        </Link>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={activeFilter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setActiveFilter('all')}
          className="whitespace-nowrap"
        >
          All Clients
        </Button>
        <Button
          variant={activeFilter === 'lead' ? 'primary' : 'secondary'}
          onClick={() => setActiveFilter('lead')}
          className="whitespace-nowrap"
        >
          Leads
        </Button>
        <Button
          variant={activeFilter === 'prospect' ? 'primary' : 'secondary'}
          onClick={() => setActiveFilter('prospect')}
          className="whitespace-nowrap"
        >
          Prospects
        </Button>
        <Button
          variant={activeFilter === 'active' ? 'primary' : 'secondary'}
          onClick={() => setActiveFilter('active')}
          className="whitespace-nowrap"
        >
          Active Clients
        </Button>
        <Button
          variant={activeFilter === 'inactive' ? 'primary' : 'secondary'}
          onClick={() => setActiveFilter('inactive')}
          className="whitespace-nowrap"
        >
          Inactive Clients
        </Button>
      </div>
      
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <Link href={`/clients/${client.id}`} key={client.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-semibold text-lg">{client.name}</h2>
                    <span className={`status-${client.status}`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{client.company}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 text-sm">
                    <div className="flex items-center text-gray-500 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {client.email}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {client.phone}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {activeFilter === 'all'
                ? "You haven't added any clients yet."
                : `You don't have any clients with ${activeFilter} status.`}
            </p>
            <Link href="/clients/add">
              <Button>
                Add Your First Client
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}