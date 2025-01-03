"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body className={`${
        darkMode 
          ? 'dark bg-gray-900 text-white'
          : 'bg-gray-50 text-gray-900'
      } transition-colors duration-200`}>
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
          <div className="min-h-screen">
            {children}
          </div>
        </ThemeContext.Provider>
      </body>
    </html>
  );
}