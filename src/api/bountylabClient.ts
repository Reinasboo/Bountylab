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

  /**
   * Enrich developers with detailed profile data from GitHub
   */
  private async enrichDevelopers(developers: Developer[]): Promise<Developer[]> {
    if (developers.length === 0) return []

    try {
      const logins = developers.map(d => d.login).filter(Boolean)
      if (logins.length === 0) return developers

      // Fetch raw detailed data
      const enrichedData = await bountyLabProxyClient.getRawUsersByLogin(logins)
      const userMap = new Map<string, any>()
      
      if (enrichedData.users && Array.isArray(enrichedData.users)) {
        enrichedData.users.forEach((user: any) => {
          userMap.set(user.login, user)
        })
      }

      // Merge enriched data with original developers
      return developers.map(dev => {
        const enriched = userMap.get(dev.login)
        if (!enriched) return dev

        return {
          ...dev,
          followers: enriched.followers ?? enriched.publicFollowers ?? dev.followers ?? 0,
          following: enriched.following ?? enriched.publicFollowing ?? dev.following ?? 0,
          public_repos: enriched.publicRepos ?? enriched.public_repos ?? dev.public_repos ?? 0,
          public_gists: enriched.publicGists ?? enriched.public_gists ?? dev.public_gists ?? 0,
          total_stars: enriched.publicRepoContributions ?? enriched.stargazerCount ?? dev.total_stars ?? 0,
          devrank_score: enriched.devRank ?? dev.devrank_score ?? 0,
          top_languages: enriched.topLanguages ?? dev.top_languages ?? [],
          bio: enriched.bio || dev.bio || '',
          company: enriched.company || dev.company || '',
          location: enriched.location || dev.location || '',
          email: enriched.email || dev.email,
          created_at: enriched.createdAt || dev.created_at,
          updated_at: enriched.updatedAt || dev.updated_at,
        }
      })
    } catch (error) {
      console.warn('Failed to enrich developers:', error)
      return developers // Return original data if enrichment fails
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
      let developers = allUsers.map((user: any) => {
        // Extract all available data from API response
        const dev: Developer = {
          id: user.githubId || user.id || '',
          login: user.login || '',
          name: user.displayName || user.name || '',
          bio: user.bio || '',
          company: user.company || '',
          location: user.location || '',
          followers: user.followers ?? 0,
          following: user.following ?? 0,
          public_repos: user.publicRepos ?? user.public_repos ?? 0,
          public_gists: user.publicGists ?? user.public_gists ?? 0,
          total_stars: user.publicRepoContributions ?? user.total_stars ?? 0,
          devrank_score: user.devRank ?? user.devrank_score ?? 0,
          top_languages: user.topLanguages ?? user.top_languages ?? [],
          avatar_url: `https://avatars.githubusercontent.com/${user.login || user.id}`,
          github_url: `https://github.com/${user.login || user.id}`,
          created_at: user.createdAt || user.created_at || new Date().toISOString(),
          updated_at: user.updatedAt || user.updated_at || new Date().toISOString(),
          email: user.email,
          hiring: user.hiring,
          recent_activity: user.recent_activity,
        }
        return dev
      })

      // Apply client-side filters
      developers = this.applyDeveloperFilters(developers, filters)

      // Apply sorting
      developers = this.sortDevelopers(developers, filters?.sort_by)

      // Paginate
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      const items = developers.slice(startIdx, endIdx)

      // Enrich only the results that will be displayed (more efficient)
      const enrichedItems = await this.enrichDevelopers(items)

      const result: PaginatedResponse<Developer> = {
        items: enrichedItems,
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

  /**
   * Enrich repositories with detailed data from GitHub
   */
  private async enrichRepositories(repos: Repository[]): Promise<Repository[]> {
    if (repos.length === 0) return []

    try {
      const fullNames = repos.map(r => r.full_name).filter(Boolean)
      if (fullNames.length === 0) return repos

      // Fetch raw detailed data
      const enrichedData = await bountyLabProxyClient.getRawReposByFullname(fullNames)
      const repoMap = new Map<string, any>()
      
      if (enrichedData.repositories && Array.isArray(enrichedData.repositories)) {
        enrichedData.repositories.forEach((repo: any) => {
          repoMap.set(repo.full_name || `${repo.owner?.login}/${repo.name}`, repo)
        })
      }

      // Merge enriched data with original repos
      return repos.map(repo => {
        const enriched = repoMap.get(repo.full_name)
        if (!enriched) return repo

        return {
          ...repo,
          stargazers_count: enriched.stargazerCount ?? enriched.stargazers_count ?? repo.stargazers_count ?? 0,
          forks_count: enriched.forkCount ?? enriched.forks_count ?? repo.forks_count ?? 0,
          watchers_count: enriched.watchers_count ?? enriched.stargazerCount ?? repo.watchers_count ?? 0,
          open_issues_count: enriched.openIssuesCount ?? enriched.open_issues_count ?? repo.open_issues_count ?? 0,
          size: enriched.size ?? repo.size ?? 0,
          language: enriched.primaryLanguage?.name || enriched.language || repo.language || '',
          topics: enriched.topics || enriched.topicNames || repo.topics || [],
          description: enriched.description || repo.description || '',
          homepage: enriched.homepage || repo.homepage,
          pushed_at: enriched.pushedAt || enriched.pushed_at || repo.pushed_at,
          created_at: enriched.createdAt || enriched.created_at || repo.created_at,
          updated_at: enriched.updatedAt || enriched.updated_at || repo.updated_at,
          stars: enriched.stargazerCount ?? enriched.stargazers_count ?? repo.stars ?? 0,
          forks: enriched.forkCount ?? enriched.forks_count ?? repo.forks ?? 0,
        }
      })
    } catch (error) {
      console.warn('Failed to enrich repositories:', error)
      return repos // Return original data if enrichment fails
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
        // Extract all available data from API response
        const ownerLogin = repo.owner?.login || repo.ownerLogin || 'unknown'
        const item: Repository = {
          id: repo.githubId || repo.id || '',
          name: repo.name || '',
          full_name: repo.full_name || `${ownerLogin}/${repo.name}`,
          owner: ownerLogin,
          description: repo.description || '',
          url: repo.url || repo.html_url || `https://github.com/${ownerLogin}/${repo.name}`,
          homepage: repo.homepage,
          stargazers_count: repo.stargazerCount ?? repo.stargazers_count ?? 0,
          watchers_count: repo.watchers_count ?? repo.stargazerCount ?? 0,
          language: repo.primaryLanguage?.name || repo.language || '',
          forks_count: repo.forkCount ?? repo.forks_count ?? 0,
          open_issues_count: repo.openIssuesCount ?? repo.open_issues_count ?? 0,
          pushed_at: repo.pushedAt || repo.pushed_at || repo.updatedAt || new Date().toISOString(),
          created_at: repo.createdAt || repo.created_at || new Date().toISOString(),
          updated_at: repo.updatedAt || repo.updated_at || new Date().toISOString(),
          topics: repo.topics || repo.topicNames || [],
          size: repo.size ?? 0,
          stars: repo.stargazerCount ?? repo.stargazers_count ?? 0,
          forks: repo.forkCount ?? repo.forks_count ?? 0,
        }
        return item
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

      // Enrich only the results that will be displayed (more efficient)
      const enrichedItems = await this.enrichRepositories(items)

      const result: PaginatedResponse<Repository> = {
        items: enrichedItems,
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
