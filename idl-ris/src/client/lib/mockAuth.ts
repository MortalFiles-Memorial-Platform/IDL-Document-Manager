import type { UserProfile } from '../types';

const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@idl.ng',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  },
  {
    id: 2,
    email: 'finance@idl.ng',
    password: 'password123',
    firstName: 'Finance',
    lastName: 'Officer',
    role: 'FINANCE'
  },
  {
    id: 3,
    email: 'sales@idl.ng',
    password: 'password123',
    firstName: 'Sales',
    lastName: 'Manager',
    role: 'SALES'
  },
  {
    id: 4,
    email: 'auditor@idl.ng',
    password: 'password123',
    firstName: 'Audit',
    lastName: 'Officer',
    role: 'AUDITOR'
  },
  {
    id: 5,
    email: 'inventory@idl.ng',
    password: 'password123',
    firstName: 'Inventory',
    lastName: 'Manager',
    role: 'PROCUREMENT'
  }
];

const isGitHubPages = (): boolean => {
  return window.location.hostname === 'mortalfiles-memorial-platform.github.io';
};

const findUserByEmail = (email: string) => {
  return DEMO_USERS.find(u => u.email === email);
};

export const mockAuthService = {
  _findUser: findUserByEmail,

  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    if (!isGitHubPages()) {
      throw new Error('Mock auth only available on GitHub Pages');
    }

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = btoa(`${email}:${Date.now()}`);
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    return { token, user: userProfile };
  },

  async verifyEmail(email: string): Promise<boolean> {
    if (!isGitHubPages()) {
      throw new Error('Mock auth only available on GitHub Pages');
    }
    return !!findUserByEmail(email);
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (!isGitHubPages()) {
      throw new Error('Mock auth only available on GitHub Pages');
    }

    const user = findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
  }
};
