import { SearchFilters } from '@/types/developer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface DeveloperFiltersProps {
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
  onSearch: () => void
  isLoading?: boolean
}

export function DeveloperFilters({
  filters,
  onFilterChange,
  onSearch,
  isLoading,
}: DeveloperFiltersProps) {
  const handleInputChange = (key: keyof SearchFilters, value: string | number) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Search Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="language">Programming Language</Label>
          <Input
            id="language"
            placeholder="e.g. Python, JavaScript, Go"
            value={filters.language || ''}
            onChange={e => handleInputChange('language', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. San Francisco, Remote"
            value={filters.location || ''}
            onChange={e => handleInputChange('location', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email_domain">Email Domain</Label>
          <Input
            id="email_domain"
            placeholder="e.g. gmail.com, company.com"
            value={filters.email_domain || ''}
            onChange={e => handleInputChange('email_domain', e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="min_followers">Min Followers</Label>
            <Input
              id="min_followers"
              type="number"
              min="0"
              placeholder="0"
              value={filters.min_followers || ''}
              onChange={e =>
                handleInputChange('min_followers', parseInt(e.target.value) || 0)
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="max_followers">Max Followers</Label>
            <Input
              id="max_followers"
              type="number"
              min="0"
              placeholder="10000"
              value={filters.max_followers || ''}
              onChange={e =>
                handleInputChange('max_followers', parseInt(e.target.value) || undefined)
              }
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sort_by">Sort By</Label>
          <select
            id="sort_by"
            value={filters.sort_by || 'devrank'}
            onChange={e =>
              handleInputChange('sort_by', e.target.value as any)
            }
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="devrank">DevRank Score</option>
            <option value="followers">Followers</option>
            <option value="stars">Stars</option>
            <option value="recent">Recently Active</option>
          </select>
        </div>

        <Button onClick={onSearch} className="w-full" disabled={isLoading}>
          <Search className="mr-2" size={16} />
          {isLoading ? 'Searching...' : 'Search Developers'}
        </Button>
      </CardContent>
    </Card>
  )
}
