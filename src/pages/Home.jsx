import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    // Thymeleaf ana sayfasına yönlendir
    window.location.href = 'http://localhost:8080/api';
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
