import { Mail, BookOpen, Users, Heart, TrendingUp, MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function ServicesSection() {
  const features = [
    {
      title: "Share Your Journey",
      description: "Write about your experiences, challenges, and wins. Your story can inspire and help fellow students.",
      image: "/images/web-design.svg",
      icon: BookOpen,
      color: "bg-[#6366F1]"
    },
    {
      title: "Connect with Peers",
      description: "Find students with similar experiences, interests, or challenges. Build meaningful connections.",
      image: "/images/ui-ux-design.svg",
      icon: Users,
      color: "bg-[#2F81F7]"
    },
    {
      title: "Discover Stories",
      description: "Explore real experiences from students across different colleges, majors, and backgrounds.",
      image: "/images/product-design.svg",
      icon: Heart,
      color: "bg-[#FF6B7A]"
    },
    {
      title: "Get Support",
      description: "Connect with others who understand what you're going through. You're not alone in this journey.",
      image: "/images/user-research.svg",
      icon: MessageCircle,
      color: "bg-[#FFC224]"
    },
    {
      title: "Grow Together",
      description: "Learn from peer experiences, share advice, and celebrate wins together as a community.",
      image: "/images/motion-graphics.svg",
      icon: TrendingUp,
      color: "bg-[#FF6B6B]"
    },
  ]

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-[52px] md:leading-[60px] font-bold mb-4">
              Everything you need to <span className="bg-[#FF4A60] text-white px-3 py-1 inline-block">connect & share</span>
            </h2>
            <p className="text-[#393939] text-base md:text-lg font-medium leading-relaxed md:leading-[30px] max-w-2xl mx-auto">
              A safe, supportive space designed for college students to share authentic experiences and build genuine connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white border-[3px] border-black rounded-[32px] overflow-hidden hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 min-h-[400px] flex flex-col group"
                >
                  <div className={`${feature.color} p-8 -mx-[3px] -mt-[3px] rounded-t-[29px] flex items-center justify-center min-h-[200px]`}>
                    <Icon className="w-24 h-24 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="px-8 pb-8 pt-6 flex-1 flex flex-col">
                    <h3 className="text-[28px] leading-[40px] font-bold mb-3 text-[#0B0B0B]">{feature.title}</h3>
                    <p className="text-[18px] leading-[30px] font-medium text-[#393939]">{feature.description}</p>
                  </div>
                </div>
              )
            })}

            <div className="bg-[#FFC224] border-[3px] border-black rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center text-center hover:translate-y-[-4px] transition-transform min-h-[400px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-8">
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
                  <Mail className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-[28px] leading-[40px] font-bold mb-4 text-[#0B0B0B]">Ready to join?</h3>
              <p className="text-[18px] leading-[30px] font-medium text-[#393939] mb-8">
                Start sharing your story and connecting with fellow students today!
              </p>
              <Button className="bg-black text-white hover:bg-black/90 rounded-[16px] px-12 py-6 font-medium text-[18px] w-full max-w-[340px] h-[64px]">
                <BookOpen className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
