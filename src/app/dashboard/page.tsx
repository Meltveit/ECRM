'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { Client } from '@/types/client';
import { Activity } from '@/types/activity';

export default function Dashboard() {
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      
      try {
        const teamId = await getCurrentUserTeamId();
        setTeamId(teamId);
        
        if (teamId) {
          // Fetch clients
          const clientsQuery = query(
            collection(db, `teams/${teamId}/clients`),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          
          const clientsSnapshot = await getDocs(clientsQuery);
          const clientsData: Client[] = clientsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Client));
          
          setClients(clientsData);
          
          // Fetch recent activities
          const activitiesQuery = query(
            collection(db, `teams/${teamId}/activities`),
            orderBy('date', 'desc'),
            limit(10)
          );
          
          const activitiesSnapshot = await getDocs(activitiesQuery);
          const activitiesData: Activity[] = activitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Activity));
          
          setRecentActivities(activitiesData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [currentUser, getCurrentUserTeamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-light text-white">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Total Clients</span>
            <span className="text-3xl font-bold">{clients.length}</span>
          </div>
        </Card>
        
        <Card className="bg-success text-white">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Active Clients</span>
            <span className="text-3xl font-bold">
              {clients.filter(client => client.status === 'active').length}
            </span>
          </div>
        </Card>
        
        <Card className="bg-warning text-white">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Leads</span>
            <span className="text-3xl font-bold">
              {clients.filter(client => client.status === 'lead').length}
            </span>
          </div>
        </Card>
        
        <Card className="bg-info text-white">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Prospects</span>
            <span className="text-3xl font-bold">
              {clients.filter(client => client.status === 'prospect').length}
            </span>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Clients</h2>
          
          {clients.length > 0 ? (
            <div className="space-y-4">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.company}</p>
                  </div>
                  <div>
                    <span className={`status-${client.status}`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No clients yet. Add your first client to get started.</p>
          )}
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-md">
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
                  <div>
                    <p className="font-medium">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.date instanceof Date 
                        ? activity.date.toLocaleDateString() 
                        : new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No activities logged yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}