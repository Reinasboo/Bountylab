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
  async searchDevelopers(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Developer>> {
    console.log('[SEARCH] Starting developer search:', { query, page, per_page })

    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      const maxResults = Math.min(page * per_page, 1000)
      console.log('[SEARCH] Calling proxy API with maxResults:', maxResults)

      const response = await bountyLabProxyClient.searchUsers(query.trim(), maxResults, filters)
      
      console.log('[SEARCH] Proxy API returned:', { 
        totalUsers: response.count, 
        usersInResponse: response.users?.length || 0 
      })

      const allUsers = response.users || []
      
      if (!Array.isArray(allUsers)) {
        throw new Error('Invalid response format: expected users array')
      }

      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      
      const items = allUsers.slice(startIdx, endIdx).map((user: any) => ({
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

      const result: PaginatedResponse<Developer> = {
        items,
        total: allUsers.length,
        page,
        per_page,
        total_pages: Math.ceil(allUsers.length / per_page),
      }

      console.log('[SEARCH] Search complete:', {
        itemsReturned: items.length,
        totalPages: result.total_pages
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[SEARCH] Search failed:', errorMessage)
      throw new Error(`Developer search failed: ${errorMessage}`)
    }
  }

  async searchRepositories(
    query: string,
    filters?: any,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Repository>> {
    console.log('[SEARCH_REPOS] Starting repository search:', { query, page, per_page })

    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      const maxResults = Math.min(page * per_page, 1000)
      const response = await bountyLabProxyClient.searchRepos(query.trim(), maxResults, filters)

      const allRepos = response.repositories || []
      
      if (!Array.isArray(allRepos)) {
        throw new Error('Invalid response format: expected repositories array')
      }

      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      
      const items  = allRepos.slice(startIdx, endIdx).map((repo: any) => {
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
          size: 0,
        }
        return item as Repository
      })

      const result: PaginatedResponse<Repository> = {
        items,
        total: allRepos.length,
        page,
        per_page,
        total_pages: Math.ceil(allRepos.length / per_page),
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[SEARCH_REPOS] Search failed:', errorMessage)
      throw new Error(`Repository search failed: ${errorMessage}`)
    }
  }
}

// Export singleton instance
export const bountylabClient = new BountyLabProxyBridge()
