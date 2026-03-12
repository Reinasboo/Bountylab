import { useCandidateStore } from '@/store/useCandidateStore'
import { CandidateNotes } from '@/components/CandidateNotes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RankingSliders } from '@/components/RankingSliders'
import { exportCandidatesCSV, exportCandidatesJSON } from '@/utils/exportCSV'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Download, Trash2, Filter, Users, TrendingUp } from 'lucide-react'

export default function SavedCandidates() {
  const navigate = useNavigate()
  const { candidates, clearAllCandidates, getCandidatesByStatus, weights } =
    useCandidateStore()
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0])
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'interested' | 'contacted' | 'rejected' | 'hired'
  >('all')

  const filteredCandidates =
    statusFilter === 'all'
      ? candidates
      : getCandidatesByStatus(statusFilter)

  const sortedCandidates = [...filteredCandidates].sort(
    (a, b) => b.recruiter_score - a.recruiter_score
  )

  const stats = {
    total: candidates.length,
    interested: getCandidatesByStatus('interested').length,
    contacted: getCandidatesByStatus('contacted').length,
    rejected: getCandidatesByStatus('rejected').length,
    hired: getCandidatesByStatus('hired').length,
  }

  const handleExportCSV = () => {
    exportCandidatesCSV(sortedCandidates)
  }

  const handleExportJSON = () => {
    exportCandidatesJSON(sortedCandidates)
  }

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all saved candidates? This cannot be undone.'
      )
    ) {
      clearAllCandidates()
      setSelectedCandidate(null)
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Saved Candidates</h1>
            <p className="text-lg text-muted-foreground">
              Your developer recruitment pipeline
            </p>
          </div>

          <div className="max-w-md mx-auto py-20 space-y-6 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-primary/10 rounded-full">
              <Filter className="text-primary" size={40} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No saved candidates yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start searching for developers and save them to your shortlist
              </p>
            </div>
            <Button 
              onClick={() => navigate('/developers')}
              size="lg"
              className="gap-2 font-semibold"
            >
              <Users size={20} />
              Explore Developers
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Saved Candidates</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Track and manage your recruitment pipeline
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interested</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.interested}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contacted</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.contacted}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hired</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.hired}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 font-semibold">
            <Download size={18} />
            Export CSV
          </Button>
          <Button onClick={handleExportJSON} variant="outline" className="gap-2 font-semibold">
            <Download size={18} />
            Export JSON
          </Button>
          <Button
            onClick={handleClearAll}
            variant="destructive"
            className="ml-auto gap-2 font-semibold"
          >
            <Trash2 size={18} />
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(
                [
                  { value: 'all', label: 'All' },
                  { value: 'interested', label: 'Interested' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'hired', label: 'Hired' },
                ] as const
              ).map(({ value, label }) => (
                <Button
                  key={value}
                  variant={statusFilter === value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(value)}
                  className="whitespace-nowrap gap-1 font-medium"
                  size="sm"
                >
                  <Filter size={14} />
                  {label}
                </Button>
              ))}
            </div>

            {/* Candidates Table */}
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle>
                  {statusFilter === 'all'
                    ? 'All Candidates'
                    : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}}  Candidates`}
                  <span className="text-sm font-normal text-muted-foreground ml-2">({sortedCandidates.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {sortedCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 border-b border-border cursor-pointer transition-all hover:bg-muted/50 last:border-b-0 ${
                        selectedCandidate?.id === candidate.id
                          ? 'border-l-4 border-l-primary bg-primary/5'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                            <AvatarImage src={candidate.developer.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {candidate.developer.login.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate hover:text-primary transition-colors">
                              {candidate.developer.name ||
                                candidate.developer.login}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{candidate.developer.login}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-primary">
                            {candidate.recruiter_score}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 items-start">
                        {candidate.developer.location && (
                          <p className="text-xs text-muted-foreground flex-1">
                            📍 {candidate.developer.location}
                          </p>
                        )}
                        {candidate.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {candidate.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="default" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {candidate.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedCandidate && (
              <>
                {/* Selected Candidate Info */}
                <Card>
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg">Candidate Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="text-center space-y-3">
                      <Avatar className="h-24 w-24 mx-auto ring-2 ring-primary/20">
                        <AvatarImage src={selectedCandidate.developer.avatar_url} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                          {selectedCandidate.developer.login.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-bold">
                          {selectedCandidate.developer.name ||
                            selectedCandidate.developer.login}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{selectedCandidate.developer.login}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-muted-foreground">Followers</p>
                        <p className="font-bold text-primary">
                          {selectedCandidate.developer.followers.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-muted-foreground">Total Stars</p>
                        <p className="font-bold text-primary">
                          {(selectedCandidate.developer.total_stars || 0).toLocaleString()}
                        </p>
                      </div>
                      {selectedCandidate.developer.top_languages && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Skills
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {selectedCandidate.developer.top_languages
                              .slice(0, 4)
                              .map(lang => (
                                <Badge key={lang} variant="default" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full font-semibold"
                    >
                      <a
                        href={selectedCandidate.developer.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View GitHub Profile
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes */}
                <CandidateNotes candidate={selectedCandidate} />
              </>
            )}

            {/* Ranking Weights */}
            <RankingSliders />
          </div>
        </div>
      </div>
    </div>
  )
}
