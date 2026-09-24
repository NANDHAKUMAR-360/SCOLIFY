import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoTransparent from '../../assets/branding/scolify-logo-transparent.png';
import logoWithBg from '../../assets/branding/scolify-logo-with-bg.png';
import { useAuthStore } from '../../store/authStore';

export interface ScolifyLogoProps {
  variant?: 'transparent' | 'with-bg' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  width?: number | string;
  height?: number | string;
  showTagline?: boolean;
  className?: string;
  imgClassName?: string;
  alt?: string;
  priority?: 'high' | 'low' | 'auto';
  contextBg?: 'dark' | 'light' | 'gradient' | 'card' | 'sidebar' | 'header';
  onClick?: () => void;
  disableLink?: boolean;
}

export const ScolifyLogo: React.FC<ScolifyLogoProps> = ({
  variant = 'auto',
  size = 'md',
  width,
  height,
  showTagline,
  className = '',
  imgClassName = '',
  alt = 'Scolify — Find Your Next Opportunity',
  priority = 'high',
  contextBg = 'dark',
  onClick,
  disableLink = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (!disableLink) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  let resolvedSrc = logoTransparent;
  if (variant === 'with-bg') {
    resolvedSrc = logoWithBg;
  } else if (variant === 'transparent') {
    resolvedSrc = logoTransparent;
  } else {
    if (contextBg === 'light' || contextBg === 'card') {
      resolvedSrc = logoWithBg;
    } else {
      resolvedSrc = logoTransparent;
    }
  }

  let sizeClasses = 'h-12 w-auto';
  switch (size) {
    case 'xs':
      sizeClasses = 'h-8 w-auto';
      break;
    case 'sm':
      sizeClasses = 'h-10 w-auto';
      break;
    case 'md':
      sizeClasses = 'h-14 w-auto';
      break;
    case 'lg':
      sizeClasses = 'h-20 max-w-[280px] w-auto';
      break;
    case 'xl':
      sizeClasses = 'h-28 sm:h-36 max-w-[360px] w-auto';
      break;
    case 'custom':
      sizeClasses = '';
      break;
  }

  const styleOverrides: React.CSSProperties = {};
  if (width) styleOverrides.width = width;
  if (height) styleOverrides.height = height;

  if (hasError) {
    return (
      <div
        onClick={handleClick}
        className={`inline-flex flex-col items-center justify-center font-bold tracking-tight cursor-pointer ${className}`}
      >
        <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 via-amber-400 to-amber-500 bg-clip-text text-transparent">
          SCOLIFY
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
            Find Your Next Opportunity
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`inline-flex flex-col items-center justify-center relative transition-transform duration-200 hover:scale-[1.01] cursor-pointer ${className}`}
    >
      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        onError={() => setHasError(true)}
        className={`object-contain transition-all duration-200 select-none ${sizeClasses} ${imgClassName}`}
        style={styleOverrides}
      />
    </div>
  );
};
