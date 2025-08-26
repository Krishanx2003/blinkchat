"use client";

import Image from "next/image";

interface FeatureSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  reverse?: boolean;
  background?: string;
}

const featureData = [
  {
    title: "Connect Anonymously with Anyone, Anywhere",
    description:
      "TingleTalk lets you create instant, private chats with people worldwide. No names, no profiles—just real conversations in a safe, anonymous space.",
    imageUrl:
      "/assets_task_01k36gfg5tftjb6hb4gkdkcgzh_1755786637_img_0.webp",
    reverse: false,
    background: "bg-white",
  },
  {
    title: "Effortless Chats, Anytime You’re Ready",
    description:
      "Jump into a chat room whenever you’re free. TingleTalk’s seamless interface connects you with new friends instantly—no sign-up required.",
    imageUrl:
      "/assets_task_01k3j0ty18ekarqbfrjk339efp_1756172875_img_1.webp",
    reverse: true,
    background: "bg-gray-50",
  },
  {
    title: "Build Your Global Friend Network",
    description:
      "From casual chats to deep connections, TingleTalk’s community tools let you meet like-minded people or spark new friendships across borders.",
    imageUrl:
      "/assets_task_01jzy59njff9p97x951gsg3kka_1752285197_img_0.webp",
    reverse: false,
    background: "bg-white",
  },
  {
    title: "Secure, Low-Latency Chatting",
    description:
      "Enjoy smooth, private conversations with TingleTalk’s reliable tech. Voice, text, or video—connect as if you’re in the same room, with full anonymity.",
    imageUrl:
      "/assets_task_01k31s3kgtewjrk47rhgwchzhr_1755627926_img_1.webp",
    reverse: true,
    background: "bg-gray-50",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-16">
      {featureData.map((feature, index) => (
        <div
          key={index}
          className={`py-12 px-4 sm:px-6 lg:px-8 ${feature.background} transition-all duration-300`}
        >
          <div
            className={`max-w-7xl mx-auto flex flex-col ${
              feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
            } items-center gap-12`}
          >
            {/* Image Wrapper with 16:9 ratio */}
            <div className="lg:w-1/2 w-full">
              <div className="aspect-video relative rounded-xl shadow-lg overflow-hidden">
                <Image
                  src={feature.imageUrl}
                  alt={feature.title}
                  fill
                  className="object-cover transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Text Section */}
            <div className="lg:w-1/2 w-full space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {feature.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
