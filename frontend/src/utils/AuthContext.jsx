// utils/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuthStore } from '../store/auth';
import { setUser } from './auth'; // Ensure correct import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { allUserData, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await setUser();
      setLoading(false);
    };
    initializeAuth();
  }, [setUser, setLoading]);

  return (
    <AuthContext.Provider value={{ user: allUserData, isAuthenticated: !!allUserData }}>
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
