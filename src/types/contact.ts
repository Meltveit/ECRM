export interface Contact {
    id: string;
    clientId: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    notes?: string;
  }