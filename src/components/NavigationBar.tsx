import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCandidateStore } from '@/store/useCandidateStore'
import { Users, BookOpen, Heart, Github, Sparkles } from 'lucide-react'

export default function NavigationBar() {
  const location = useLocation()
  const { candidates } = useCandidateStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/developers" className="flex items-center gap-3 mr-12 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Sparkles className="text-primary-foreground" size={22} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-base leading-tight">BountyLab</span>
              <span className="text-xs text-muted-foreground font-medium">Recruiter</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link to="/developers">
              <Button
                variant={isActive('/developers') ? 'default' : 'ghost'}
                className={`gap-2 px-4 py-2 font-medium transition-all ${
                  isActive('/developers')
                    ? 'shadow-md'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Users size={18} />
                <span className="hidden sm:inline">Developers</span>
              </Button>
            </Link>

            <Link to="/repos">
              <Button
                variant={isActive('/repos') ? 'default' : 'ghost'}
                className={`gap-2 px-4 py-2 font-medium transition-all ${
                  isActive('/repos')
                    ? 'shadow-md'
                    : 'hover:bg-muted/50'
                }`}
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">Repositories</span>
              </Button>
            </Link>

            <Link to="/candidates">
              <Button
                variant={isActive('/candidates') ? 'default' : 'ghost'}
                className={`gap-2 px-4 py-2 font-medium transition-all relative ${
                  isActive('/candidates')
                    ? 'shadow-md'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Heart size={18} />
                <span className="hidden sm:inline">Saved</span>
                {candidates.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 text-xs font-bold flex items-center justify-center">
                    {candidates.length > 99 ? '99+' : candidates.length}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* GitHub Link */}
          <div className="ml-6">
            <Button 
              asChild 
              variant="ghost" 
              size="icon"
              className="hover:bg-muted/50"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <Github size={22} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
