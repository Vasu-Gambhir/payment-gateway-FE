import React from 'react';

/**
 * Avatar component that displays user initials in a styled circle
 * @param {Object} props
 * @param {string} props.name - Full name or first name to extract initials from
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.gradient - Gradient variant: 'blue', 'green', 'purple', 'orange'
 */
const Avatar = ({ 
  name, 
  size = 'md', 
  className = '', 
  gradient = 'blue' 
}) => {
  // Extract initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    // Get first letter of first name and last name
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Size configurations
  const sizeConfig = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base sm:w-12 sm:h-12 sm:text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  };

  // Gradient configurations
  const gradientConfig = {
    blue: 'bg-gradient-to-br from-blue-500 to-purple-600',
    green: 'bg-gradient-to-br from-green-400 to-blue-500',
    purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
    orange: 'bg-gradient-to-br from-orange-400 to-red-500',
    indigo: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  };

  return (
    <div 
      className={`
        ${sizeConfig[size]} 
        ${gradientConfig[gradient]} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-bold 
        flex-shrink-0
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;