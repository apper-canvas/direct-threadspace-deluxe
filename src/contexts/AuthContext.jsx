import React, { createContext, useContext } from "react";
import Error from "@/components/ui/Error";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Authentication is now handled by ApperUI and Redux
  // This context is maintained for backward compatibility
  return <>{children}</>;
};