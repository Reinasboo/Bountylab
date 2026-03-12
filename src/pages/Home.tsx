import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, Zap, Target, TrendingUp, Sparkles } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-semibold text-primary">Powered by Developer Intelligence</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Find Your Ideal
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Developers
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover top developers based on real GitHub activity. Search, analyze, and save candidates in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => navigate('/developers')}
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow px-8 py-6 text-base font-semibold"
              >
                <Users size={20} />
                Explore Developers
              </Button>
              <Button
                onClick={() => navigate('/repos')}
                variant="outline"
                size="lg"
                className="gap-2 px-8 py-6 text-base font-semibold border-2"
              >
                <BookOpen size={20} />
                Discover Repositories
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20">
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">150M+</div>
              <p className="text-sm md:text-base text-muted-foreground">Data Points</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">500K+</div>
              <p className="text-sm md:text-base text-muted-foreground">Developers</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">100%</div>
              <p className="text-sm md:text-base text-muted-foreground">Real Activity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-card/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need to find and engage with top developers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Search</h3>
              <p className="text-muted-foreground">
                Advanced filtering by skills, experience, and GitHub activity to find exactly who you need.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Real Insights</h3>
              <p className="text-muted-foreground">
                Access detailed GitHub analytics and contribution patterns to verify developer expertise.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Quick Export</h3>
              <p className="text-muted-foreground">
                Save candidates and export lists instantly. Organize and track your hiring pipeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">Ready to find top talent?</h2>
          <p className="text-lg text-muted-foreground">
            Start exploring our database of verified developers with real GitHub activity.
          </p>
          <Button
            onClick={() => navigate('/developers')}
            size="lg"
            className="gap-2 shadow-lg px-8 py-6 text-base font-semibold"
          >
            <Sparkles size={20} />
            Start Exploring
          </Button>
        </div>
      </section>
    </div>
  )
}
