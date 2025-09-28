import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { User, Role } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: number) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { users } = useSupabaseData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (users.length > 0) {
      setCurrentUser(users[0]);
    }
  }, [users]);

  const switchUser = (userId: number) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) setCurrentUser(foundUser);
  };

  const logout = () => {
    // In a real app, you'd clear tokens and navigate to a login page
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === Role.Admin;

  return (
    <AuthContext.Provider value={{ currentUser, users, switchUser, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};