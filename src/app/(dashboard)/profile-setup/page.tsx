"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  User as UserIcon,
  Sparkles,
  Heart,
  Zap,
  MapPin,
  Calendar,
} from "lucide-react";

const ProfileSetupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !username.trim()) {
      toast.error("Name and username are required bestie! 💀");
      return;
    }

    if (age && (parseInt(age) < 13 || parseInt(age) > 120)) {
      toast.error("Bruh, enter a valid age between 13 and 120 📱");
      return;
    }

    setLoading(true);

    // Simulate profile creation
    setTimeout(() => {
      toast.success("Profile setup complete! You're ready to vibe! ✨");
      setLoading(false);
      // In a real app, you'd navigate to the main page here
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] to-[#1a1a1a] flex items-center justify-center p-4">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FFFC00] rounded-full blur-3xl opacity-5"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#FFFC00] rounded-full blur-3xl opacity-3"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-[#FFFC00] shadow-lg">
              <UserIcon className="w-6 h-6 text-black" />
            </div>
            <Sparkles className="w-4 h-4 text-[#FFFC00] ml-2 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Setup Your Profile
          </h1>
          <p className="text-gray-400 text-sm">Let's get you started! 🚀</p>
        </div>

        {/* Compact Form Card */}
        <Card className="bg-white/5 backdrop-blur-sm border border-[#FFFC00]/20 rounded-2xl">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FFFC00]" />
              Your Info
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Fill in your details below
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Essential Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-[#FFFC00]" />
                    Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-black/50 border-[#FFFC00]/30 text-white placeholder:text-gray-500 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#FFFC00]" />
                    Username *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-black/50 border-[#FFFC00]/30 text-white placeholder:text-gray-500 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 text-[#FFFC00]" />
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-[#FFFC00]/30 bg-black/50 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 focus:outline-none"
                  >
                    <option value="" className="text-gray-900 bg-white">
                      Select
                    </option>
                    <option value="male" className="text-gray-900 bg-white">
                      Male
                    </option>
                    <option value="female" className="text-gray-900 bg-white">
                      Female
                    </option>
                    <option value="other" className="text-gray-900 bg-white">
                      Other
                    </option>
                    <option
                      value="prefer-not-to-say"
                      className="text-gray-900 bg-white"
                    >
                      Prefer not to say
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="age"
                    className="text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3 text-[#FFFC00]" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="13"
                    max="120"
                    className="bg-black/50 border-[#FFFC00]/30 text-white placeholder:text-gray-500 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-white text-xs font-medium flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-[#FFFC00]" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-black/50 border-[#FFFC00]/30 text-white placeholder:text-gray-500 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-white text-xs font-medium flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-[#FFFC00]" />
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-black/50 border-[#FFFC00]/30 text-white placeholder:text-gray-500 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-black font-semibold py-2 h-10 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Let's Go! 🚀
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-[#FFFC00]" />* Required fields
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
