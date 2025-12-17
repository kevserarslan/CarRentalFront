import React, { useEffect } from 'react';
const BACKEND_WEB = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

const Home = () => {
  useEffect(() => {
    // Thymeleaf ana sayfasına yönlendir
    window.location.href = `${BACKEND_WEB}/api`;
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="spinner"></div>
      <p>Ana sayfaya yönlendiriliyorsunuz...</p>
    </div>
  );
};

export default Home;
