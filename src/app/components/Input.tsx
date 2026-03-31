import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-[#2E4F2F] font-montserrat"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={twMerge(
              'w-full px-4 py-3 rounded-lg border-2 border-[#2E4F2F]/20 bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors font-opensans',
              isPassword && 'pr-12', // Add padding on the right to prevent text overlap with the icon
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#2E4F2F] focus:outline-none transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
