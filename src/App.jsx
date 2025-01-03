import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import LandingPage from './pages/LandingPage';
import ChatInterface from './components/chat/ChatInterface';
import JournalPage from './pages/JournalPage';  // Make sure this import is correct

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/journal" element={<JournalPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;