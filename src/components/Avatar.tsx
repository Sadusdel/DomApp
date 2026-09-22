import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  avatarColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  avatarColor = '#EA580C',
  size = 'md',
  className = ''
}) => {
  const getInitials = (str: string) => {
    if (!str) return '?';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm font-semibold',
    lg: 'w-16 h-16 text-lg font-bold',
    xl: 'w-24 h-24 text-2xl font-bold'
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover shadow-xs border border-stone-200 dark:border-stone-700 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: avatarColor }}
      className={`rounded-full flex items-center justify-center text-white shadow-xs select-none tracking-wider ${sizeClasses[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
