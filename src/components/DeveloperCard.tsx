import { Developer } from '@/types/developer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Heart, Github, MapPin, Building2 } from 'lucide-react'
import { useCandidateStore } from '@/store/useCandidateStore'
import { useNavigate } from 'react-router-dom'

interface DeveloperCardProps {
  developer: Developer
  onAddCandidate?: (developer: Developer) => void
}

export function DeveloperCard({ developer, onAddCandidate }: DeveloperCardProps) {
  const navigate = useNavigate()
  const { isCandidateSaved, addCandidate } = useCandidateStore()
  const isStarred = isCandidateSaved(developer.id)

  const handleSave = () => {
    addCandidate(developer)
    onAddCandidate?.(developer)
  }

  const handleViewProfile = () => {
    navigate(`/developer/${developer.login}`)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 cursor-pointer group">
      <CardHeader className="pb-3 bg-gradient-to-br from-background to-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
              <AvatarImage src={developer.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {developer.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                {developer.name || developer.login}
              </h3>
              <p className="text-sm text-muted-foreground truncate">@{developer.login}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={`transition-all ${
              isStarred
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <Heart className={isStarred ? 'fill-current' : ''} size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {developer.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{developer.bio}</p>
        )}

        <div className="space-y-2">
          {developer.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="text-primary/60" />
              <span>{developer.location}</span>
            </div>
          )}
          {developer.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 size={16} className="text-primary/60" />
              <span className="truncate">{developer.company}</span>
            </div>
          )}
        </div>

        {developer.top_languages && developer.top_languages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skills</p>
            <div className="flex gap-2 flex-wrap">
              {developer.top_languages.slice(0, 4).map(lang => (
                <Badge key={lang} variant="default" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Followers</p>
            <p className="font-bold text-sm text-foreground">{developer.followers.toLocaleString()}</p>
          </div>
          <div className="text-center border-l border-r border-border/50">
            <p className="text-xs text-muted-foreground font-medium">Stars</p>
            <p className="font-bold text-sm text-foreground">{(developer.total_stars || 0).toLocaleString()}</p>
          </div>
          {developer.devrank_score && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium">DevRank</p>
              <p className="font-bold text-sm text-primary">{developer.devrank_score}</p>
            </div>
          )}
        </div>

        <Button 
          onClick={handleViewProfile} 
          className="w-full gap-2 font-semibold"
          variant="default"
        >
          <Github size={18} />
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}
