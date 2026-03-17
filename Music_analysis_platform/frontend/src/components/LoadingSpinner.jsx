import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse">Chargement des données musicales...</p>
    </div>
  );
};

export default LoadingSpinner;
