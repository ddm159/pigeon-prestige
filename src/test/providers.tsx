import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext, type AuthContextType } from '../contexts/AuthContext';

interface AllTheProvidersProps {
  children: React.ReactNode;
  authContextValue?: AuthContextType;
}

export const AllTheProviders = ({ children, authContextValue }: AllTheProvidersProps) => (
  <BrowserRouter>
    {authContextValue ? (
      <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
    ) : (
      <AuthProvider>{children}</AuthProvider>
    )}
  </BrowserRouter>
); 