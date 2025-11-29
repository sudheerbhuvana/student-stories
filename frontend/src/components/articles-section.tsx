import { Calendar, ArrowRight, TrendingUp, Users, Heart } from "lucide-react"

export function ArticlesSection() {
  const recentStories = [
    {
      title: "5 Tips for Managing Exam Stress",
      excerpt: "Practical strategies that actually work, from students who've been there...",
      author: "Sarah Kim",
      date: "2 days ago",
      category: "Wellness",
      reactions: 156,
      color: "bg-[#6366F1]"
    },
    {
      title: "My Journey as an International Student",
      excerpt: "Navigating a new country, culture, and education system - here's what I learned...",
      author: "Ahmed Hassan",
      date: "5 days ago",
      category: "Experience",
      reactions: 203,
      color: "bg-[#FF6B7A]"
    },
    {
      title: "Finding Your Major: It's Okay to Change",
      excerpt: "I switched majors twice and it was the best decision. Here's my story...",
      author: "Jessica Lee",
      date: "1 week ago",
      category: "Academics",
      reactions: 178,
      color: "bg-[#FFC224]"
    },
  ]

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Recent{" "}
                <span className="bg-[#2F81F7] text-white px-3 py-1 inline-block">
                  stories
                </span>
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Fresh perspectives and experiences shared by our community
              </p>
            </div>
            <a
              href="#"
              className="hidden md:flex items-center gap-2 font-bold text-[#0B0B0B] hover:gap-3 transition-all"
            >
              View all stories
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentStories.map((story, index) => (
              <div
                key={index}
                className="bg-white border-[3px] border-black rounded-[24px] overflow-hidden hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group cursor-pointer"
              >
                <div className={`${story.color} h-48 flex items-center justify-center`}>
                  {index === 0 && <TrendingUp className="w-20 h-20 text-white" strokeWidth={1.5} />}
                  {index === 1 && <Users className="w-20 h-20 text-white" strokeWidth={1.5} />}
                  {index === 2 && <Heart className="w-20 h-20 text-white" strokeWidth={1.5} />}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                      {story.category}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Heart className="w-4 h-4" />
                      <span>{story.reactions}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-[#0B0B0B] group-hover:text-[#6366F1] transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {story.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div>
                      <p className="text-sm font-bold">{story.author}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{story.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#6366F1] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 md:hidden">
            <a
              href="#"
              className="flex items-center gap-2 font-bold text-[#0B0B0B] hover:gap-3 transition-all"
            >
              View all stories
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
