import { Users, Heart, MessageCircle, TrendingUp } from "lucide-react"

export function ExperienceSection() {
  const stats = [
    {
      number: "10,000+",
      label: "Active Students",
      icon: Users,
      color: "bg-[#6366F1]"
    },
    {
      number: "5,000+",
      label: "Stories Shared",
      icon: Heart,
      color: "bg-[#FF6B7A]"
    },
    {
      number: "50,000+",
      label: "Connections Made",
      icon: MessageCircle,
      color: "bg-[#FFC224]"
    },
    {
      number: "200+",
      label: "Colleges Represented",
      icon: TrendingUp,
      color: "bg-[#2F81F7]"
    },
  ]

  return (
    <section className="bg-gradient-to-br from-[#6366F1] to-[#2F81F7] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              A growing community of{" "}
              <span className="bg-white text-[#6366F1] px-3 py-1 inline-block">
                real students
              </span>
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
              Join thousands of students who are sharing, connecting, and supporting each other every day.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white border-[3px] border-black rounded-[24px] p-6 md:p-8 text-center hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className={`${stat.color} w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[#0B0B0B] mb-2">
                    {stat.number}
                  </p>
                  <p className="text-sm md:text-base text-gray-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-12 md:mt-16 bg-white border-[3px] border-black rounded-[32px] p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Your story matters. Your voice counts.
            </h3>
            <p className="text-gray-600 text-base md:text-lg mb-6 max-w-2xl mx-auto">
              Whether you're celebrating a win, navigating a challenge, or just want to share your experience —
              this is your space to be heard and connect with others who get it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-[#6366F1] text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-black">
                #StudentLife
              </span>
              <span className="bg-[#FF6B7A] text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-black">
                #RealTalk
              </span>
              <span className="bg-[#FFC224] text-black px-4 py-2 rounded-full text-sm font-bold border-2 border-black">
                #Community
              </span>
              <span className="bg-[#2F81F7] text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-black">
                #Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
