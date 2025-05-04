'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Client, ClientStatus } from '@/types/client';

// Define our columns/status types
const columns: { id: ClientStatus; title: string }[] = [
  { id: 'lead', title: 'Leads' },
  { id: 'prospect', title: 'Prospects' },
  { id: 'active', title: 'Active Clients' },
  { id: 'inactive', title: 'Inactive' }
];

export default function ClientsBoard() {
  const { currentUser, getCurrentUserTeamId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      if (!currentUser) return;
      
      try {
        const teamId = await getCurrentUserTeamId();
        setTeamId(teamId);
        
        if (teamId) {
          const clientsQuery = query(collection(db, `teams/${teamId}/clients`));
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

  const getClientsForColumn = (columnId: ClientStatus) => {
    return clients.filter(client => client.status === columnId);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back in its original place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // If we don't have a team ID, we can't update the client
    if (!teamId) return;

    // Find the client that was dragged
    const clientId = draggableId;
    const clientToUpdate = clients.find(client => client.id === clientId);

    if (!clientToUpdate) return;

    // Update the client's status
    const newStatus = destination.droppableId as ClientStatus;
    
    // Optimistically update the UI
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus } 
          : client
      )
    );

    // Update in Firestore
    try {
      const clientRef = doc(db, `teams/${teamId}/clients`, clientId);
      await updateDoc(clientRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating client status:', error);
      // Revert the UI change if the update fails
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === clientId 
            ? { ...client, status: clientToUpdate.status } 
            : client
        )
      );
    }
  };

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
        <h1 className="text-2xl font-bold">Client Pipeline</h1>
        
        <div className="flex space-x-2">
          <Link href="/clients">
            <Button variant="secondary">
              List View
            </Button>
          </Link>
          <Link href="/clients/add">
            <Button>
              Add Client
            </Button>
          </Link>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="bg-gray-100 p-3 rounded-t-md font-medium flex justify-between items-center">
                <h3>{column.title}</h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {getClientsForColumn(column.id).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-grow bg-gray-50 p-2 rounded-b-md min-h-[70vh] overflow-y-auto"
                  >
                    {getClientsForColumn(column.id).map((client, index) => (
                      <Draggable key={client.id} draggableId={client.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2"
                          >
                            <Link href={`/clients/${client.id}`}>
                              <Card className={`
                                p-3 hover:shadow-md transition-shadow cursor-pointer
                                ${column.id === 'lead' ? 'border-l-4 border-l-warning' : ''}
                                ${column.id === 'prospect' ? 'border-l-4 border-l-info' : ''}
                                ${column.id === 'active' ? 'border-l-4 border-l-success' : ''}
                                ${column.id === 'inactive' ? 'border-l-4 border-l-danger' : ''}
                              `}>
                                <div className="flex flex-col">
                                  <h3 className="font-medium truncate">{client.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">{client.company}</p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="truncate">{client.email}</span>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {getClientsForColumn(column.id).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No clients in this category
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}