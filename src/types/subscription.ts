export interface Subscription {
    id: string;
    planType: 'free' | 'premium';
    status: 'active' | 'canceled' | 'past_due';
    startDate: Date;
    endDate?: Date;
    stripeSubscriptionId?: string;
  }