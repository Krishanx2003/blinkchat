import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatBubble } from "@/components/ui/chat-bubble";

export const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Sign Up Anonymously",
      description: "Create your account with minimal information. We only ask for what's necessary to keep you safe.",
      icon: "fas fa-user-plus",
      color: "bg-blue-500"
    },
    {
      step: "2", 
      title: "Get Matched Instantly",
      description: "Our smart matching system connects you with someone new in seconds. No complex algorithms, just pure serendipity.",
      icon: "fas fa-users",
      color: "bg-purple-500"
    },
    {
      step: "3",
      title: "Start Chatting",
      description: "Begin your conversation in a secure, disposable room. Share what you want, when you want.",
      icon: "fas fa-comments",
      color: "bg-green-500"
    },
    {
      step: "4",
      title: "Leave Safely",
      description: "When you're done, simply leave. The room disappears and your conversation stays private forever.",
      icon: "fas fa-door-open", 
      color: "bg-orange-500"
    }
  ];


    return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How 
            <span className="gradient-text"> It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Getting started with TingleTalk is simple and quick. Here's how you can begin connecting 
            with people from around the world in just a few steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 shadow-md h-full">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <ChatBubble className="w-16 h-16 flex items-center justify-center relative">
                      <i className={`${step.icon} text-2xl text-white`}></i>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </ChatBubble>
                  </div>
                  <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-chat-secondary opacity-30 z-10"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
              Pro Tip
            </h3>
            <p className="text-lg text-muted-foreground">
              The best conversations happen when you're authentic and respectful. 
              Remember, there's a real person on the other side of the screen who wants to connect just like you do.
            </p>
          </div>
        </div>
      </div>
    </section>
    )
}