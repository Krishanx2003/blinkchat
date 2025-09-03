"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User as UserIcon, Pencil, Save, X, ArrowLeft, MapPin, Calendar, Users, Mail, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";

interface Profile {
  name: string;
  username: string;
  gender: string | null;
  age: number | null;
  country: string | null;
  city: string | null;
}

interface FormState {
  name: string;
  username: string;
  gender: string;
  age: string;
  country: string;
  city: string;
}

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    username: "",
    gender: "",
    age: "",
    country: "",
    city: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setUser(user);
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("name, username, gender, age, country, city")
        .eq("user_id", user.id)
        .single();
      if (error || !profileData) {
        toast.error("Failed to load profile");
      } else {
        setProfile(profileData as Profile);
        setForm({
          name: profileData.name || "",
          username: profileData.username || "",
          gender: profileData.gender || "",
          age: profileData.age?.toString() || "",
          country: profileData.country || "",
          city: profileData.city || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      setForm({
        name: profile.name || "",
        username: profile.username || "",
        gender: profile.gender || "",
        age: profile.age?.toString() || "",
        country: profile.country || "",
        city: profile.city || "",
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!form.name.trim() || !form.username.trim()) {
      toast.error("Name and username are required");
      return;
    }
    if (form.age && (parseInt(form.age) < 13 || parseInt(form.age) > 120)) {
      toast.error("Please enter a valid age between 13 and 120");
      return;
    }
    setSaving(true);
    try {
      // Check if username is taken by another user
      if (form.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", form.username.trim())
          .neq("user_id", user.id)
          .maybeSingle();
        if (existingUser) {
          toast.error("This username is already taken. Please choose another one.");
          setSaving(false);
          return;
        }
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          name: form.name.trim(),
          username: form.username.trim(),
          gender: form.gender || null,
          age: form.age ? parseInt(form.age) : null,
          country: form.country || null,
          city: form.city || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error) {
        toast.error("Error updating profile: " + error.message);
      } else {
        setProfile({
          name: form.name.trim(),
          username: form.username.trim(),
          gender: form.gender || null,
          age: form.age ? parseInt(form.age) : null,
          country: form.country || null,
          city: form.city || null,
        });
        toast.success("Profile updated successfully!");
        setEditMode(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-teal-500 to-emerald-600',
      'from-purple-500 to-violet-600'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-400 dark:border-t-violet-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mb-6">
                    <div 
                      className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg bg-gradient-to-br ${getAvatarColor(profile?.name || 'User')}`}
                    >
                      {getInitials(profile?.name || 'U')}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {profile?.name || 'Your Name'}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        @{profile?.username || 'username'}
                      </p>
                    </div>
                    
                    {(profile?.country || profile?.city) && (
                      <div className="flex items-center justify-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {[profile?.city, profile?.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {profile?.age && (
                      <div className="flex items-center justify-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{profile.age} years old</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        {editMode ? "Update your profile details below" : "Your current profile information"}
                      </CardDescription>
                    </div>
                    {!editMode && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEdit}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </motion.button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <AnimatePresence mode="wait">
                    {editMode ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <form onSubmit={handleSave} className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                                Full Name *
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 rounded-xl"
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">
                                Username *
                              </Label>
                              <Input
                                id="username"
                                name="username"
                                type="text"
                                value={form.username}
                                onChange={handleChange}
                                required
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 rounded-xl"
                                placeholder="Choose a unique username"
                              />
                            </div>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300 font-medium">
                                Gender
                              </Label>
                              <div className="relative">
                                <select
                                  id="gender"
                                  name="gender"
                                  value={form.gender}
                                  onChange={handleChange}
                                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                                >
                                  <option value="">Select gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                  <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="age" className="text-slate-700 dark:text-slate-300 font-medium">
                                Age
                              </Label>
                              <Input
                                id="age"
                                name="age"
                                type="number"
                                value={form.age}
                                onChange={handleChange}
                                min="13"
                                max="120"
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 rounded-xl"
                                placeholder="Your age"
                              />
                            </div>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="country" className="text-slate-700 dark:text-slate-300 font-medium">
                                Country
                              </Label>
                              <Input
                                id="country"
                                name="country"
                                type="text"
                                value={form.country}
                                onChange={handleChange}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 rounded-xl"
                                placeholder="Your country"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city" className="text-slate-700 dark:text-slate-300 font-medium">
                                City
                              </Label>
                              <Input
                                id="city"
                                name="city"
                                type="text"
                                value={form.city}
                                onChange={handleChange}
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 rounded-xl"
                                placeholder="Your city"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1"
                            >
                              <Button 
                                type="submit" 
                                disabled={saving} 
                                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleCancel} 
                                disabled={saving}
                                className="px-6 py-3 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </motion.div>
                          </div>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium">Full Name</Label>
                            <div className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                              {profile?.name || "Not specified"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium">Username</Label>
                            <div className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                              @{profile?.username || "Not specified"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium">Gender</Label>
                            <div className="text-slate-900 dark:text-slate-100 font-medium text-lg capitalize">
                              {profile?.gender?.replace('-', ' ') || "Not specified"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium">Age</Label>
                            <div className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                              {profile?.age ? `${profile.age} years old` : "Not specified"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium">Country</Label>
                            <div className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                              {profile?.country || "Not specified"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium">City</Label>
                            <div className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                              {profile?.city || "Not specified"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              onClick={handleEdit} 
                              className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Profile
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;