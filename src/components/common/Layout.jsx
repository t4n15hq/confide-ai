import React, { createContext, useState, useEffect } from 'react';
import NavigationBar from './NavigationBar';
import { useLocation } from 'react-router-dom';

export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

const Layout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    // Update both the HTML class and data-theme attribute
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={`min-h-screen bg-background text-foreground ${darkMode ? 'dark' : ''}`}>
        {!isLandingPage && <NavigationBar />}
        <main className="h-full">
          {children}
        </main>
      </div>
    </ThemeContext.Provider>
  );
};

export default Layout;