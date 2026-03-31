/**
 * Индекс для всех UI компонентов
 */

import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
};
