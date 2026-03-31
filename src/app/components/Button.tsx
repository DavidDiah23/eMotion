import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#FF4500] text-white hover:bg-[#E03E00] shadow-md active:scale-95',
      secondary: 'bg-[#2E4F2F] text-white hover:bg-[#254025] shadow-md active:scale-95',
      outline: 'border-2 border-[#2E4F2F] text-[#2E4F2F] hover:bg-[#2E4F2F] hover:text-white active:scale-95',
      ghost: 'text-[#2E4F2F] hover:bg-[#2E4F2F]/10 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg font-semibold',
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          'inline-flex items-center justify-center rounded-xl font-montserrat transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
