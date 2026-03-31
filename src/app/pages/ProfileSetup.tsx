import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { supabase } from '../client';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loader2, User, Phone, Shield, Camera } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
  privacy: z.enum(['public', 'private', 'friends']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSetup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/login');
      setUser(user);
    });
  }, [navigate]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      privacy: 'public',
    }
  });

  // Pre-fill name if available
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setValue('fullName', user.user_metadata.full_name);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          emergency_contact: data.emergencyContact,
          privacy_settings: data.privacy,
          profile_setup_complete: true,
        },
      });

      if (error) throw error;

      toast.success('Profile updated!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-montserrat text-[#2E4F2F]">Complete Your Profile</h1>
          <p className="mt-2 text-stone-600 font-opensans">Tell us a bit more about you</p>
        </div>

        <Card variant="white" className="p-8 shadow-xl border-stone-100">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <User className="w-10 h-10 text-stone-400" />
              <button className="absolute bottom-0 right-0 bg-[#FF4500] p-2 rounded-full text-white shadow-sm hover:bg-[#E03E00]">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

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
                <Phone className="absolute left-3 top-10 transform -translate-y-1/2 text-stone-400 w-5 h-5 pointer-events-none" />
                <Input
                  label="Emergency Contact"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  error={errors.emergencyContact?.message}
                  {...register('emergencyContact')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2E4F2F] font-montserrat mb-2">
                  Privacy Settings
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['public', 'friends', 'private'].map((type) => (
                    <label
                      key={type}
                      className="cursor-pointer relative"
                    >
                      <input
                        type="radio"
                        value={type}
                        className="peer sr-only"
                        {...register('privacy')}
                      />
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-stone-200 bg-stone-50 peer-checked:border-[#2E4F2F] peer-checked:bg-[#2E4F2F]/10 transition-all text-sm capitalize font-medium text-stone-600 peer-checked:text-[#2E4F2F]">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
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
                  Saving...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
