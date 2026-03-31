import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'stone' | 'green';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'white', children, ...props }, ref) => {
    const variants = {
      white: 'bg-white shadow-lg border border-stone-200',
      stone: 'bg-stone-100 shadow-md border border-stone-300',
      green: 'bg-[#2E4F2F] text-white shadow-xl',
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          'p-5 rounded-2xl transition-all duration-300',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
