/**
 * Authentication Context Provider.
 * Manages the current user's auth state across the entire app.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getIdToken, signOut } from '../firebase/authService';
import authApi from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Get token and verify using the auth service wrapper
          const token = await firebaseUser.getIdToken();
          const response = await authApi.login(token);

          setUser((currentUser) => {
            if (currentUser && currentUser.uid === firebaseUser.uid) {
              if (response.data.success) {
                setUserProfile(response.data.data);
                setIsAdmin(response.data.data.isAdmin || false);
              }
              return currentUser;
            }
            return null;
          });
        } catch (error) {
          console.error('Error verifying user:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await authApi.login(token);
      if (response.data.success) {
        setUserProfile(response.data.data);
        setIsAdmin(response.data.data.isAdmin || false);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
