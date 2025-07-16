"use client";

import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/lib/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Check profile completion when user signs in
      if (session?.user) {
        checkProfileAndRedirect(session.user.id);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkProfileAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const checkProfileAndRedirect = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", userId)
        .single();

      if (profile?.profile_completed) {
        router.push("/");
      } else {
        router.push("/profile-setup");
      }
    } catch (error) {
      // Profile doesn't exist, redirect to setup
      router.push("/profile-setup");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/profile-setup`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(
            "An account with this email already exists. Try signing in instead."
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(
          "Account created successfully! Check your email for verification."
        );
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Signed in successfully!");
        // Navigation will be handled by the auth state change listener
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, show loading
  if (user) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#FFFC00]" />
          <p className="text-white/80 text-sm">redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FFFC00] rounded-full blur-3xl opacity-5"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#FFFC00] rounded-full blur-3xl opacity-3"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-[#FFFC00] shadow-lg">
              <MessageCircle className="w-6 h-6 text-[#020202]" />
            </div>
            <Sparkles className="w-4 h-4 text-[#FFFC00] ml-2 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Quick<span className="text-[#FFFC00]">Chat</span>
          </h1>
          <p className="text-white/70 text-sm">
            slide into anonymous convos ✨
          </p>
        </div>

        {/* Compact Auth Card */}
        <Card className="bg-white/5 backdrop-blur-sm border border-[#FFFC00]/20 rounded-2xl">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-white text-lg font-semibold text-center">
              let's get you in
            </CardTitle>
            <CardDescription className="text-white/60 text-sm text-center">
              join the vibe or create your space
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-xl p-1 mb-4">
                <TabsTrigger
                  value="signin"
                  className="text-white text-sm font-medium rounded-lg data-[state=active]:bg-[#FFFC00] data-[state=active]:text-[#020202] transition-all duration-200"
                >
                  sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-white text-sm font-medium rounded-lg data-[state=active]:bg-[#FFFC00] data-[state=active]:text-[#020202] transition-all duration-200"
                >
                  sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signin-email"
                      className="text-white text-xs font-medium uppercase tracking-wide"
                    >
                      email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[#020202]/80 border-[#FFFC00]/30 text-white placeholder:text-white/50 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signin-password"
                      className="text-white text-xs font-medium uppercase tracking-wide"
                    >
                      password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-[#020202]/80 border-[#FFFC00]/30 text-white placeholder:text-white/50 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-[#020202] font-semibold py-2 h-10 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        getting you in...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        let's go! 🚀
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-white text-xs font-medium uppercase tracking-wide"
                    >
                      email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[#020202]/80 border-[#FFFC00]/30 text-white placeholder:text-white/50 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-white text-xs font-medium uppercase tracking-wide"
                    >
                      password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="make it strong (6+ chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-[#020202]/80 border-[#FFFC00]/30 text-white placeholder:text-white/50 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-white text-xs font-medium uppercase tracking-wide"
                    >
                      confirm password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="type it again"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-[#020202]/80 border-[#FFFC00]/30 text-white placeholder:text-white/50 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/50 rounded-lg h-9 text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-[#020202] font-semibold py-2 h-10 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        creating your vibe...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        join the crew! 🔥
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white/50 text-xs">
            by signing up, you're agreeing to keep it cool ✌️
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
