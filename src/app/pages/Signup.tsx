import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Simulate network delay for the demo
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success('Account created! Proceeding to your dashboard.');
      // Bypassing email verification for the demo and going straight to the dashboard or login
      navigate('/login');
    } catch (error: any) {
      toast.error('Failed to create account');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-montserrat text-[#2E4F2F]">Join the Adventure</h1>
          <p className="mt-2 text-stone-600 font-opensans">Create your eMotion account</p>
        </div>

        <Card variant="white" className="p-8 shadow-xl border-stone-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-10 transform -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  className="pl-10"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-10 transform -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
                <Input
                  label="Email"
                  type="email"
                  placeholder="hiker@example.com"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-10 transform -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-10 transform -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              className="mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#FF4500] hover:text-[#E03E00]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}