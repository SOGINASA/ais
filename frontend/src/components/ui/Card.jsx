import React from 'react';

export const Card = ({ title, flat = false, className = '', children, ...props }) => {
  const cardClass = flat 
    ? 'bg-white border border-gray-200 rounded-lg overflow-hidden' 
    : 'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden';

  return (
    <div className={`${cardClass} ${className}`} {...props}>
      {title && (
        <div className="px-5 py-5 border-b border-gray-200 font-semibold text-lg">
          {title}
        </div>
      )}
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  );
};

export default Card;
