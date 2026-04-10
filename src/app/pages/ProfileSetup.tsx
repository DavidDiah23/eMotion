import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loader2, User, Phone, Camera, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../client';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
  privacy: z.enum(['public', 'private', 'friends']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSetup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const localName = localStorage.getItem('eMotion_fullName') || 'Lead Explorer';
  const localAvatar = localStorage.getItem('eMotion_avatarUrl') || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop';

  const [avatarUrl, setAvatarUrl] = useState(localAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: localName,
      privacy: 'public',
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: data.fullName,
            emergency_contact: data.emergencyContact,
            privacy: data.privacy,
            avatar_url: avatarUrl
          }
        });
      } else {
        // Fallback for visual demo if not logged in tightly
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Persist to local storage for the demo ecosystem
      localStorage.setItem('eMotion_fullName', data.fullName);
      localStorage.setItem('eMotion_avatarUrl', avatarUrl);

      toast.success('Profile updated securely!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Could not upload avatar. Have you created the avatars bucket?');
        console.error(uploadError);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      toast.error('Error uploading avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-[#121212]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-montserrat text-[#2E4F2F] dark:text-white">Complete Your Profile</h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400 font-opensans">Tell us a bit more about you</p>
        </div>

        <Card variant="white" className="p-8 shadow-xl border-stone-100 dark:border-stone-800 dark:bg-[#1C1C1E]">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden group">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              ) : null}
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={uploadAvatar} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()} 
                className="absolute bottom-0 right-0 bg-[#FF4500] p-2 rounded-full text-white shadow-sm hover:bg-[#E03E00] hover:scale-110 transition-transform"
              >
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
                <label className="block text-sm font-semibold text-[#2E4F2F] dark:text-stone-300 font-montserrat mb-2">
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
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 peer-checked:border-[#2E4F2F] peer-checked:dark:border-[#FF4500] peer-checked:bg-[#2E4F2F]/10 peer-checked:dark:bg-[#FF4500]/10 transition-all text-sm capitalize font-medium text-stone-600 dark:text-stone-400 peer-checked:text-[#2E4F2F] peer-checked:dark:text-[#FF4500]">
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