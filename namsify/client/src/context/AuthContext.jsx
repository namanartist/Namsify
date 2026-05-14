import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('namsify_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('namsify_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (name) => {
    const newUser = {
      id: Date.now().toString(),
      name,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${name}&backgroundColor=1A1A1A`
    };
    setUser(newUser);
    localStorage.setItem('namsify_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('namsify_user');
  };

  if (loading) return null; // or a cool loading spinner

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
