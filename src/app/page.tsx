// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import Header from "@/components/home/Header";
import Download from "@/components/home/Download";
import Footer from "@/components/home/Footer";
import { HeroSection } from "@/components/home/Hero";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { FeaturesSection } from "@/components/home/Features";

// Flow configuration - change this to switch between dialog and route flows
const USE_DIALOG_FLOW = true; // Set to false to use route-based flow

const Page = () => {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track if user is authenticated and profile complete
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Only check auth status if using route-based flow
    if (!USE_DIALOG_FLOW) {
      const checkAuthAndProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAuthed(false);
          setAuthOpen(true);
          setLoading(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("profile_completed")
          .eq("user_id", user.id)
          .single();
        if (!profile || !profile.profile_completed) {
          setIsAuthed(false);
          setAuthOpen(true);
          setLoading(false);
          return;
        }
        setIsAuthed(true);
        setAuthOpen(false);
        setLoading(false);
      };
      
      checkAuthAndProfile();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        checkAuthAndProfile();
      });
      
      return () => subscription.unsubscribe();
    } else {
      // For dialog flow, no auth checking needed on page load
      setLoading(false);
    }
  }, []);

  // For route-based flow loading state
  if (!USE_DIALOG_FLOW && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Download />
        <Footer />
      </div>
    </>
  );
};

export default Page;