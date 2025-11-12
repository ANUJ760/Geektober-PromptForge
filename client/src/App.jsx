import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import LogOut from './pages/Logout.jsx';
import Prompt from './pages/Prompt.jsx';
import Explore from './pages/Explore.jsx';
import checkAuthStatus  from './utils/checkAuthStatus.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  const handleSetIsLoggedIn = (status) => {
    setIsLoggedIn(status);
  };
  
  useEffect(() => {
    checkAuthStatus(handleSetIsLoggedIn);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  return (
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />

        <Route path="/login" element={<Login setIsLoggedIn={handleSetIsLoggedIn} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={handleSetIsLoggedIn}/>} />
        <Route path="/logout" element={<LogOut setIsLoggedIn={handleSetIsLoggedIn} />} />
        
        <Route path="/prompt/:id" element={<Prompt isLoggedIn={isLoggedIn}/>}/>
        <Route path="/explore" element={<Explore isLoggedIn={isLoggedIn}/>}/>

        <Route
          path="/home"
          element={
            <Home isLoggedIn={isLoggedIn} />
          }
        />
      </Routes>
  );
}

export default App;