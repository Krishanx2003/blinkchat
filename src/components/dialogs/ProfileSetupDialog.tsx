// components/dialogs/ProfileSetupDialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, User as UserIcon, X } from 'lucide-react';
import { supabase } from '@/lib/client';

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onProfileComplete: () => void;
}

export const ProfileSetupDialog: React.FC<ProfileSetupDialogProps> = ({ 
  open, 
  onOpenChange, 
  user,
  onProfileComplete 
}) => {
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (user && open) {
      checkExistingProfile(user.id);
    }
  }, [user, open]);

  const checkExistingProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed, name, username, gender, age, country, city')
        .eq('user_id', userId)
        .single();

      if (profile?.profile_completed) {
        // Profile already completed, close dialog and proceed
        onProfileComplete();
        return;
      }

      // Pre-fill form if profile exists but not completed
      if (profile) {
        setExistingProfile(profile);
        setName(profile.name || '');
        setUsername(profile.username || '');
        setGender(profile.gender || '');
        setAge(profile.age?.toString() || '');
        setCountry(profile.country || '');
        setCity(profile.city || '');
      }
    } catch (error) {
      console.log('Profile not found or error:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setGender('');
    setAge('');
    setCountry('');
    setCity('');
    setLoading(false);
    setExistingProfile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!name.trim() || !username.trim()) {
      toast.error('Name and username are required');
      return;
    }

    if (age && (parseInt(age) < 13 || parseInt(age) > 120)) {
      toast.error('Please enter a valid age between 13 and 120');
      return;
    }

    setLoading(true);

    try {
      // Check if username is taken by another user (only if username is different from existing)
      if (!existingProfile || username !== existingProfile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', username.trim())
          .neq('user_id', user.id)
          .maybeSingle();

        if (existingUser) {
          toast.error('This username is already taken. Please choose another one.');
          setLoading(false);
          return;
        }
      }

      // Always use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: name.trim(),
          username: username.trim(),
          gender: gender || null,
          age: age ? parseInt(age) : null,
          country: country || null,
          city: city || null,
          profile_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Profile update error:', error);
        if (error.code === '23505') {
          toast.error('This username is already taken. Please choose another one.');
        } else {
          toast.error('Error updating profile: ' + error.message);
        }
      } else {
        toast.success('Profile completed successfully!');
        resetForm();
        onProfileComplete();
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800 border-none text-white max-h-[90vh] overflow-y-auto">
        {/* Custom close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Tell us a bit about yourself to get started
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-white/30 bg-white/20 px-3 py-2 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 focus:outline-none"
                >
                  <option value="" className="text-gray-900">Select gender</option>
                  <option value="male" className="text-gray-900">Male</option>
                  <option value="female" className="text-gray-900">Female</option>
                  <option value="other" className="text-gray-900">Other</option>
                  <option value="prefer-not-to-say" className="text-gray-900">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="13"
                  max="120"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Your country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 rounded-lg transition-all duration-300 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-4 text-white/60">
          <p className="text-sm">
            * Required fields
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};