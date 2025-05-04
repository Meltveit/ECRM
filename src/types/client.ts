export type ClientStatus = 'lead' | 'prospect' | 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  status: ClientStatus;
  createdAt: Date;
  createdBy: string; // user_id
  updatedAt: Date;
  notes?: string;
  tags: string[];
}