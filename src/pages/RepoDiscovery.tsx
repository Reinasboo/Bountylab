import { useState } from 'react'
import { bountylabClient } from '@/api/bountylabClient'
import { Repository } from '@/types/developer'
import { RepoCard } from '@/components/RepoCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader, Search } from 'lucide-react'

export default function RepoDiscovery() {
  const [searchQuery, setSearchQuery] = useState('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState({
    language: '',
    min_stars: '',
    max_stars: '',
    size: '' as 'small' | 'medium' | 'large' | '',
    sort_by: 'stars' as 'stars' | 'updated' | 'forks',
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }
    setIsLoading(true)
    setError(null)
    setCurrentPage(1)
    try {
      console.log('[REPO SEARCH] Calling bountylabClient.searchRepositories...', { searchQuery, filters })
      const response = await bountylabClient.searchRepositories(
        searchQuery,
        {
          language: filters.language || undefined,
          min_stars: filters.min_stars ? parseInt(filters.min_stars) : undefined,
          max_stars: filters.max_stars ? parseInt(filters.max_stars) : undefined,
          size: filters.size || undefined,
          sort_by: filters.sort_by,
        },
        1,
        20
      )
      console.log('[REPO SEARCH] Search succeeded:', { itemsFound: response.items.length, totalPages: response.total_pages, firstItem: response.items[0] })
      setRepos(response.items)
      setTotalPages(response.total_pages)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to search repositories'
      console.error('[REPO SEARCH] Search error caught:', errorMsg, err)
      if (err instanceof Error && err.stack) {
        console.error('[REPO SEARCH] Error stack:', err.stack)
      }
      setError(errorMsg)
      setRepos([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Repository Discovery</h1>
          <p className="text-muted-foreground">
            Search for repositories using natural language queries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    placeholder="e.g. Python, Go"
                    value={filters.language}
                    onChange={e => setFilters({ ...filters, language: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="min_stars">Min Stars</Label>
                  <Input
                    id="min_stars"
                    type="number"
                    placeholder="0"
                    value={filters.min_stars}
                    onChange={e => setFilters({ ...filters, min_stars: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="max_stars">Max Stars</Label>
                  <Input
                    id="max_stars"
                    type="number"
                    placeholder="100000"
                    value={filters.max_stars}
                    onChange={e => setFilters({ ...filters, max_stars: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="size">Repository Size</Label>
                  <select
                    id="size"
                    value={filters.size}
                    onChange={e =>
                      setFilters({
                        ...filters,
                        size: e.target.value as 'small' | 'medium' | 'large' | '',
                      })
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Any Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sort_by">Sort By</Label>
                  <select
                    id="sort_by"
                    value={filters.sort_by}
                    onChange={e =>
                      setFilters({
                        ...filters,
                        sort_by: e.target.value as 'stars' | 'updated' | 'forks',
                      })
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="stars">Stars</option>
                    <option value="updated">Recently Updated</option>
                    <option value="forks">Forks</option>
                  </select>
                </div>

                <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                  <Search className="mr-2" size={16} />
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                placeholder='e.g. "payment processing microservice in Go", "React authentication library"'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                className="text-base"
              />
              <Button onClick={handleSearch} disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader className="mr-2 animate-spin" size={18} />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {/* Results Info */}
            {repos.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Found {repos.length} repositories on page {currentPage} of{' '}
                {totalPages}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Results Display */}
            {repos.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {repos.map(repo => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages || isLoading}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : !isLoading && searchQuery ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No repositories found. Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Try searching for: "payment processing", "authentication",
                    "microservice"
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
