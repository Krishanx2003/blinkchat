"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User as UserIcon, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-white/80">View and edit your information</p>
        </div>
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Profile Information</CardTitle>
            <CardDescription className="text-white/70">
              {editMode ? "Edit your info and save changes" : "Your current profile details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username *</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
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
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
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
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
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
                      name="country"
                      type="text"
                      value={form.country}
                      onChange={handleChange}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:ring-white/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving} className="w-full flex items-center justify-center">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Name</Label>
                    <div className="text-white/90 font-medium mt-1">{profile?.name || "-"}</div>
                  </div>
                  <div>
                    <Label className="text-white">Username</Label>
                    <div className="text-white/90 font-medium mt-1">{profile?.username || "-"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Gender</Label>
                    <div className="text-white/90 font-medium mt-1">{profile?.gender || "-"}</div>
                  </div>
                  <div>
                    <Label className="text-white">Age</Label>
                    <div className="text-white/90 font-medium mt-1">{profile?.age ?? "-"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Country</Label>
                    <div className="text-white/90 font-medium mt-1">{profile?.country || "-"}</div>
                  </div>
                  <div>
                    <Label className="text-white">City</Label>
                    <div className="text-white/90 font-medium mt-1">{profile?.city || "-"}</div>
                  </div>
                </div>
                <Button onClick={handleEdit} className="w-full mt-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
