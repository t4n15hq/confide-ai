import React from 'react';
import NavigationBar from './NavigationBar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLandingPage && <NavigationBar />}
      {children}
    </div>
  );
};

export default Layout;