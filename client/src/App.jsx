import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import LogOut from './pages/Logout.jsx';
import Prompt from './pages/Prompt.jsx';
import Explore from './pages/Explore.jsx';
import Upload from './pages/Upload.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import checkAuthStatus from './utils/checkAuthStatus.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSetIsLoggedIn = (status) => {
    setIsLoggedIn(status);
  };

  useEffect(() => {
    let isMounted = true;
    const verifyUserSession = async () => {
      try {
        await checkAuthStatus(handleSetIsLoggedIn);
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyUserSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#4F7FFF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm tracking-wide">Connecting to PromptForge...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
      <Route path="/home" element={<Home isLoggedIn={isLoggedIn} />} />
      <Route path="/login" element={<Login setIsLoggedIn={handleSetIsLoggedIn} />} />
      <Route path="/signup" element={<Signup setIsLoggedIn={handleSetIsLoggedIn} />} />
      <Route path="/logout" element={<LogOut setIsLoggedIn={handleSetIsLoggedIn} />} />
      <Route path="/prompt/:id" element={<Prompt isLoggedIn={isLoggedIn} />} />
      <Route path="/explore" element={<Explore isLoggedIn={isLoggedIn} />} />
      <Route path="/upload" element={<Upload isLoggedIn={isLoggedIn} />} />
      <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} />} />
      <Route path="/orders" element={<Orders isLoggedIn={isLoggedIn} />} />
      <Route path="/creator/dashboard" element={<CreatorDashboard isLoggedIn={isLoggedIn} />} />
      <Route path="/dashboard" element={<CreatorDashboard isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
}

export default App;