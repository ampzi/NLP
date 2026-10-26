
export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
    website?: string;
    
  emailVerified: boolean;
  roles: Role[];
}
