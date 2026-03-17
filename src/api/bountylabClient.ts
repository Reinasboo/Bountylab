/**
 * BountyLab Client with Proxy Support
 * 
 * Uses backend Vercel functions to proxy API calls,
 * bypassing browser CORS restrictions.
 */
import { Developer, Repository, SearchFilters } from '../types/developer'
import { bountyLabProxyClient } from './bountylab-proxy-client'

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

class BountyLabProxyBridge {
  /**
   * Apply client-side filtering to developers
   */
  private applyDeveloperFilters(developers: Developer[], filters?: SearchFilters): Developer[] {
    if (!filters) return developers

    let filtered = developers

    // Filter by language
    if (filters.language) {
      const lang = filters.language.toLowerCase()
      filtered = filtered.filter(dev => 
        dev.top_languages?.some(l => l.toLowerCase().includes(lang))
      )
    }

    // Filter by location
    if (filters.location) {
      const loc = filters.location.toLowerCase()
      filtered = filtered.filter(dev =>
        dev.location?.toLowerCase().includes(loc)
      )
    }

    // Filter by email domain
    if (filters.email_domain) {
      const domain = filters.email_domain.toLowerCase()
      // Note: email is not available in the API response, so this will have limited effect
      filtered = filtered.filter(dev =>
        dev.company?.toLowerCase().includes(domain) ||
        dev.bio?.toLowerCase().includes(domain)
      )
    }

    // Filter by min followers
    if (filters.min_followers !== undefined && filters.min_followers > 0) {
      filtered = filtered.filter(dev => (dev.followers || 0) >= filters.min_followers!)
    }

    // Filter by max followers
    if (filters.max_followers !== undefined && filters.max_followers > 0) {
      filtered = filtered.filter(dev => (dev.followers || 0) <= filters.max_followers!)
    }

    // Filter by activity level (based on recent activity or devrank)
    if (filters.activity_level) {
      filtered = filtered.filter(dev => {
        const score = dev.devrank_score || 0
        if (filters.activity_level === 'active') return score >= 7
        if (filters.activity_level === 'moderate') return score >= 4 && score < 7
        if (filters.activity_level === 'low') return score < 4
        return true
      })
    }

    return filtered
  }

  /**
   * Sort developers based on sort_by preference
   */
  private sortDevelopers(developers: Developer[], sortBy?: string): Developer[] {
    if (!sortBy) return developers

    const sorted = [...developers]
    
    switch (sortBy) {
      case 'devrank':
        return sorted.sort((a, b) => (b.devrank_score || 0) - (a.devrank_score || 0))
      case 'followers':
        return sorted.sort((a, b) => (b.followers || 0) - (a.followers || 0))
      case 'stars':
        return sorted.sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0))
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      default:
        return sorted
    }
  }

  async searchDevelopers(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Developer>> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      const maxResults = Math.min(page * per_page * 5, 1000) // Fetch more to account for filtering
      
      const response = await bountyLabProxyClient.searchUsers(query.trim(), maxResults)
      
      const allUsers = response.users || []
      
      if (!Array.isArray(allUsers)) {
        throw new Error('Invalid response format: expected users array')
      }

      // Convert to Developer format
      let developers = allUsers.map((user: any) => ({
        id: user.githubId || user.id,
        login: user.login,
        name: user.displayName || '',
        avatar_url: `https://avatars.githubusercontent.com/${user.login}`,
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        followers: user.followers || 0,
        total_stars: user.publicRepoContributions || 0,
        devrank_score: user.devRank || 0,
        top_languages: user.topLanguages || [],
        github_url: `https://github.com/${user.login}`,
        public_repos: 0,
        following: 0,
        public_gists: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }) as Developer)

      // Apply client-side filters
      developers = this.applyDeveloperFilters(developers, filters)

      // Apply sorting
      developers = this.sortDevelopers(developers, filters?.sort_by)

      // Paginate
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      const items = developers.slice(startIdx, endIdx)

      const result: PaginatedResponse<Developer> = {
        items,
        total: developers.length,
        page,
        per_page,
        total_pages: Math.ceil(developers.length / per_page),
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Developer search failed: ${errorMessage}`)
    }
  }

  async searchRepositories(
    query: string,
    filters?: any,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Repository>> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      const maxResults = Math.min(page * per_page * 5, 1000) // Fetch more to account for filtering
      const response = await bountyLabProxyClient.searchRepos(query.trim(), maxResults)

      let allRepos = response.repositories || []
      
      if (!Array.isArray(allRepos)) {
        throw new Error('Invalid response format: expected repositories array')
      }

      // Convert to Repository format
      let repos = allRepos.map((repo: any) => {
        const item: any = {
          id: repo.githubId || repo.id,
          name: repo.name,
          owner: repo.owner?.login || repo.ownerLogin || '',
          description: repo.description || '',
          url: repo.url || `https://github.com/${repo.owner?.login || ''}/${repo.name}`,
          stars: repo.stargazerCount || 0,
          forks: repo.forkCount || 0,
          language: repo.primaryLanguage?.name || repo.language || '',
          updated_at: repo.updatedAt || new Date().toISOString(),
          full_name: `${repo.owner?.login || ''}/${repo.name}`,
          stargazers_count: repo.stargazerCount || 0,
          watchers_count: repo.stargazerCount || 0,
          forks_count: repo.forkCount || 0,
          open_issues_count: 0,
          default_branch: 'main',
          network_count: 0,
          pushed_at: repo.updatedAt || new Date().toISOString(),
          created_at: new Date().toISOString(),
          topics: [],
          size: repo.size || 0,
        }
        return item as Repository
      })

      // Apply client-side filters
      if (filters) {
        // Filter by language
        if (filters.language) {
          const lang = filters.language.toLowerCase()
          repos = repos.filter(repo =>
            repo.language?.toLowerCase().includes(lang)
          )
        }

        // Filter by min_stars
        if (filters.min_stars) {
          const minStars = parseInt(filters.min_stars)
          repos = repos.filter(repo => (repo.stargazers_count || 0) >= minStars)
        }

        // Filter by max_stars
        if (filters.max_stars) {
          const maxStars = parseInt(filters.max_stars)
          repos = repos.filter(repo => (repo.stargazers_count || 0) <= maxStars)
        }

        // Filter by size
        if (filters.size) {
          repos = repos.filter(repo => {
            const size = repo.size || 0
            if (filters.size === 'small') return size < 1000
            if (filters.size === 'medium') return size >= 1000 && size < 50000
            if (filters.size === 'large') return size >= 50000
            return true
          })
        }

        // Sort by preference
        if (filters.sort_by) {
          repos = [...repos].sort((a, b) => {
            switch (filters.sort_by) {
              case 'stars':
                return (b.stargazers_count || 0) - (a.stargazers_count || 0)
              case 'forks':
                return (b.forks_count || 0) - (a.forks_count || 0)
              case 'updated':
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              default:
                return 0
            }
          })
        }
      }

      // Paginate
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      const items = repos.slice(startIdx, endIdx)

      const result: PaginatedResponse<Repository> = {
        items,
        total: repos.length,
        page,
        per_page,
        total_pages: Math.ceil(repos.length / per_page),
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Repository search failed: ${errorMessage}`)
    }
  }
}

// Export singleton instance
export const bountylabClient = new BountyLabProxyBridge()
