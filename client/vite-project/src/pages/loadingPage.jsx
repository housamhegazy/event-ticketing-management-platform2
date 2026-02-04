import React from 'react';

const LoadingPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light flex-column" 
         style={{
           background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
           position: "fixed",
           top: 0,
           left: 0,
           width: "100%",
           zIndex: 9999
         }}>
      
      {/* الـ Spinner الأساسي من بوتستراب مع تعديل اللون */}
      <div className="spinner-grow text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>

      {/* نص متحرك تحت اللودينج */}
      <h4 className="mt-4 fw-bold text-dark animate__animated animate__pulse animate__infinite">
        Please wait, preparing events...
      </h4>

      <p className="text-secondary small">Everything is coming to life</p>
    </div>
  );
};

export default LoadingPage;