"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import WhyBlinkChat from "@/components/home/WhyBlinkChat";
import Testimonials from "@/components/home/Testimonials";
import Download from "@/components/home/Download";
import Footer from "@/components/home/Footer";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      // Check profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", user.id)
        .single();
      if (!profile || !profile.profile_completed) {
        router.replace("/profile-setup");
        return;
      }
      setLoading(false);
    };
    checkAuthAndProfile();
    // Optionally, listen for auth changes and re-check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndProfile();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
        <div className="text-white text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-white">
  <Header />
  <Hero />
  <Features />
  <WhyBlinkChat />
  <Testimonials />
  <Download />
  <Footer />
</div>
};

export default Page;