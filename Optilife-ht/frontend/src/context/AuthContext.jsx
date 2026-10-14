import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

const AuthContext = createContext(null);

// Keeps track of the logged-in user and the login token
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app opens, check whether a saved token is still valid
  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem('habitToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiRequest('/api/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('habitToken');
      } finally {
        setLoading(false);
      }
    }
    loadCurrentUser();
  }, []);

  // Called after a successful login or registration
  function saveSession(data) {
    localStorage.setItem('habitToken', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('habitToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
