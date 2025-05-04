export interface User {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    country: string;
    role: 'admin' | 'member';
    createdAt: Date;
    lastLogin?: Date;
  }