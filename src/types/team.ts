export interface Team {
    id: string;
    name: string;
    createdAt: Date;
    planType: 'free' | 'premium';
    stripeCustomerId?: string;
    clientCount: number;
  }