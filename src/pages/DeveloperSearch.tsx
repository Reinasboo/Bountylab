import { useState, useEffect } from 'react'
import { bountylabClient } from '@/api/bountylabClient'
import { Developer, SearchFilters } from '@/types/developer'
import { DeveloperCard } from '@/components/DeveloperCard'
import { DeveloperTable } from '@/components/DeveloperTable'
import { DeveloperFilters } from '@/components/DeveloperFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader, Grid, Table as TableIcon, Search, AlertCircle } from 'lucide-react'

export default function DeveloperSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')



  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await bountylabClient.searchDevelopers(
        searchQuery,
        filters,
        currentPage,
        20
      )
      setDevelopers(response.items)
      setTotalPages(response.total_pages)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to search developers'
      setError(errorMsg)
      setDevelopers([])
    } finally {
      setIsLoading(false)
    }
  }



  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Section */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Search size={20} className="text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Developer Search</h1>
            </div>
            <p className="text-muted-foreground ml-13">
              Discover and analyze talented developers based on real GitHub activity
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <DeveloperFilters
                filters={filters}
                onFilterChange={setFilters}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="space-y-4 bg-card p-6 rounded-xl border border-border">
              <div className="flex gap-2 flex-col sm:flex-row">
                <Input
                  placeholder="Search by name, bio, skills, company, location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-base"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading} 
                  size="lg"
                  className="gap-2 px-6 font-semibold whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon size={16} />
                  Table View
                </Button>
              </div>
            </div>

            {/* Results Info */}
            {developers.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm font-medium text-foreground">
                  Found <span className="text-primary font-bold">{developers.length}</span> results
                  <span className="text-muted-foreground ml-2">
                    • Page {currentPage} of {totalPages}
                  </span>
                </p>
                <Zap size={18} className="text-accent" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/5 border-2 border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-destructive mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-destructive text-sm">Search Error</p>
                  <p className="text-destructive/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {developers.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {developers.map(dev => (
                      <DeveloperCard key={dev.id} developer={dev} />
                    ))}
                  </div>
                ) : (
                  <DeveloperTable developers={developers} />
                )}

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 p-4 bg-card rounded-lg border border-border">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="font-semibold"
                  >
                    ← Previous Page
                  </Button>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      Page <span className="text-primary">{currentPage}</span> of <span className="text-primary">{totalPages}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages || isLoading}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="font-semibold"
                  >
                    Next Page →
                  </Button>
                </div>
              </>
            ) : !isLoading && searchQuery ? (
              <div className="text-center py-20 space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-muted/50 rounded-full">
                  <Search className="text-muted-foreground" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No developers found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search query or filters to find more results
                  </p>
                </div>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-20 space-y-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 rounded-full">
                    <Search className="text-primary" size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Start Your Search</h3>
                    <p className="text-muted-foreground">
                      Enter a search query above to discover talented developers
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
