import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bountylabClient } from '@/api/bountylabClient'
import { Developer, Repository } from '@/types/developer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useCandidateStore } from '@/store/useCandidateStore'
import {
  MapPin,
  Building2,
  Github,
  Users,
  Star,
  Loader,
  Heart,
  ChevronLeft,
} from 'lucide-react'

export default function DeveloperProfile() {
  const { login } = useParams<{ login: string }>()
  const navigate = useNavigate()
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isCandidateSaved, addCandidate, removeCandidate } = useCandidateStore()

  const isStarred = developer ? isCandidateSaved(developer.id) : false

  useEffect(() => {
    const loadDeveloper = async () => {
      if (!login) return

      setIsLoading(true)
      setError(null)

      try {
        const devData = await bountylabClient.getDeveloper(login)
        setDeveloper(devData)

        const reposData = await bountylabClient.getDeveloperRepositories(
          login,
          1,
          10
        )
        setRepos(reposData.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load developer')
      } finally {
        setIsLoading(false)
      }
    }

    loadDeveloper()
  }, [login])

  const handleSave = () => {
    if (!developer) return
    if (isStarred) {
      removeCandidate(developer.id)
    } else {
      addCandidate(developer)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading developer profile...</p>
        </div>
      </div>
    )
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/developers')}
            className="mb-4"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back
          </Button>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
            <p className="text-destructive">
              {error || 'Developer not found'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/developers')}
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Search
        </Button>

        {/* Developer Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={developer.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {developer.login.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {developer.name || developer.login}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  @{developer.login}
                </p>

                {developer.bio && (
                  <p className="text-base mb-4">{developer.bio}</p>
                )}

                <div className="space-y-2 mb-4">
                  {developer.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-muted-foreground" />
                      <span>{developer.location}</span>
                    </div>
                  )}
                  {developer.company && (
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-muted-foreground" />
                      <span>{developer.company}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  <Button asChild variant="outline">
                    <a
                      href={developer.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={18} className="mr-2" />
                      GitHub Profile
                    </a>
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant={isStarred ? 'default' : 'outline'}
                  >
                    <Heart
                      className={isStarred ? 'fill-current mr-2' : 'mr-2'}
                      size={18}
                    />
                    {isStarred ? 'Saved' : 'Save Candidate'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted p-4 rounded-lg mt-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  FOLLOWERS
                </p>
                <p className="text-2xl font-bold">
                  {developer.followers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  FOLLOWING
                </p>
                <p className="text-2xl font-bold">
                  {developer.following.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  PUBLIC REPOS
                </p>
                <p className="text-2xl font-bold">
                  {developer.public_repos.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  TOTAL STARS
                </p>
                <p className="text-2xl font-bold">
                  {(developer.total_stars || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {developer.devrank_score && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  DEVRANK SCORE
                </p>
                <p className="text-3xl font-bold text-primary">
                  {developer.devrank_score}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages */}
        {developer.top_languages && developer.top_languages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {developer.top_languages.map(lang => (
                  <Badge key={lang} variant="secondary" className="text-sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Repositories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repos.map(repo => (
                <div
                  key={repo.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start p-0 h-auto hover:bg-transparent"
                  >
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="text-left w-full">
                        <h4 className="font-semibold">{repo.name}</h4>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {repo.language && (
                            <span className="bg-muted px-2 py-1 rounded">
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star size={14} />
                            {repo.stargazers_count}
                          </span>
                        </div>
                      </div>
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
