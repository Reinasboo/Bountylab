import { Repository } from '@/types/developer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, GitFork, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface RepoCardProps {
  repo: Repository
}

export function RepoCard({ repo }: RepoCardProps) {
  const navigate = useNavigate()

  const handleContributorClick = (login: string) => {
    navigate(`/developer/${login}`)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{repo.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{repo.full_name}</p>
          </div>
          {repo.language && <Badge variant="outline">{repo.language}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {repo.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
        )}

        <div className="flex gap-4 text-sm border-t pt-3">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-500" />
            <span className="font-semibold">{repo.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork size={16} className="text-muted-foreground" />
            <span className="font-semibold">{repo.forks_count.toLocaleString()}</span>
          </div>
        </div>

        {repo.contributors && repo.contributors.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground">Top Contributors</p>
            <div className="flex gap-1 flex-wrap">
              {repo.contributors.slice(0, 5).map(contributor => (
                <Button
                  key={contributor.id}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleContributorClick(contributor.login)}
                >
                  <Avatar className="h-6 w-6 mr-1">
                    <AvatarImage src={contributor.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {contributor.login.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{contributor.login}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button asChild variant="outline" className="w-full">
          <a href={repo.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} className="mr-2" />
            Open on GitHub
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
