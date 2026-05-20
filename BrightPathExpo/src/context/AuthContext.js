import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  getStoredUser, 
  loginUser, 
  registerUser as fbRegisterUser, 
  logoutUser 
} from '../firebase/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  // Track if we are in the middle of a manual auth operation
  // to prevent the Firebase listener from overwriting state
  const isManualAuthOp = useRef(false);

  useEffect(() => {
    let unsubscribe = null;

    const initializeAuth = async () => {
      // 1. Load cached user for immediate UI
      try {
        const stored = await getStoredUser();
        if (stored) {
          setUser(stored);
        }
      } catch (err) {
        console.log('Error loading stored user:', err);
      }

      // 2. Subscribe to Firebase auth state changes
      unsubscribe = onAuthStateChanged(async (firebaseUser) => {
        // Skip if we are handling login/register/logout manually
        if (isManualAuthOp.current) return;

        if (firebaseUser) {
          // Restore from cache on auto sign-in (e.g. app restart)
          try {
            const stored = await getStoredUser();
            if (stored && stored.uid === firebaseUser.uid) {
              setUser(stored);
            }
          } catch (e) {
            console.log('Auth restore error:', e);
          }
        } else {
          // Signed out externally (e.g. token expired)
          setUser(null);
          setIsGuest(false);
        }
        setIsLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    isManualAuthOp.current = true;
    try {
      const result = await loginUser({ email, password });
      if (result.success) {
        setUser(result.user);
        setIsGuest(false);
        setIsLoading(false);
      } else {
        throw new Error(result.error || 'Login failed. Please try again.');
      }
    } finally {
      isManualAuthOp.current = false;
    }
  }, []);

  const register = useCallback(async (email, password, profileData) => {
    isManualAuthOp.current = true;
    try {
      const result = await fbRegisterUser({ email, password, role: profileData?.role || 'parent', profileData });
      if (result.success) {
        setUser(result.user);
        setIsGuest(false);
        setIsLoading(false);
        return result;
      } else {
        throw new Error(result.error || 'Registration failed. Please try again.');
      }
    } finally {
      isManualAuthOp.current = false;
    }
  }, []);

  const logout = useCallback(async () => {
    isManualAuthOp.current = true;
    try {
      await logoutUser();
      setUser(null);
      setIsGuest(false);
    } finally {
      isManualAuthOp.current = false;
    }
  }, []);

  const setGuestMode = useCallback(() => {
    setIsGuest(true);
    setUser({ role: 'guest', uid: 'guest', fullName: 'Guest User' });
    setIsLoading(false);
  }, []);

  const value = {
    user,
    isLoading,
    isGuest,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setGuestMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;





