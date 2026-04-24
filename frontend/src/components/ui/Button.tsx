'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium-orange focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'bg-premium-orange text-white hover:bg-premium-orange-dark shadow-glow hover:shadow-lg',
    outline: 'border-2 border-premium-orange text-premium-orange hover:bg-premium-orange hover:text-white',
    ghost: 'text-gray-300 hover:text-white hover:bg-dark-800',
    premium: 'gradient-primary text-white shadow-glow hover:shadow-xl hover:scale-105',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';
