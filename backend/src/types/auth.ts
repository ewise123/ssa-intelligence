export interface AuthContext {
  userId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  isAdmin: boolean;
  groupIds: string[];
  groupSlugs: string[];
}
