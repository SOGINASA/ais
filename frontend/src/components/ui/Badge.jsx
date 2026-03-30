import React from 'react';

export const Badge = ({ variant = 'primary', children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  const badgeClass = `inline-block px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${variants[variant]} ${className}`;

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
};

export default Badge;
