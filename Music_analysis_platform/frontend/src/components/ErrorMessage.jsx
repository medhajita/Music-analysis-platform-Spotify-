import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex items-center p-4 my-4 text-red-800 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 dark:text-red-400">
      <AlertCircle className="w-5 h-5 mr-3" />
      <span className="font-medium text-sm">
        {message || "Une erreur est survenue lors de la récupération des données."}
      </span>
    </div>
  );
};

export default ErrorMessage;
