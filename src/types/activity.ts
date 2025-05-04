export type ActivityType = 'meeting' | 'call' | 'email' | 'note';

export interface Activity {
  id: string;
  clientId: string;
  type: ActivityType;
  date: Date;
  description: string;
  createdBy: string; // user_id
  createdAt: Date;
}