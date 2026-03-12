import Bountylab from '@bountylab/bountylab'
import { Developer, Repository, SearchFilters } from '../types/developer'

const API_KEY = import.meta.env.VITE_BOUNTYLAB_API_KEY

if (!API_KEY) {
  console.warn(
    'VITE_BOUNTYLAB_API_KEY environment variable is not set. API calls will fail.'
  )
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

class BountyLabClient {
  private client: Bountylab

  constructor() {
    this.client = new Bountylab({
      apiKey: API_KEY || '',
    })
  }

  /**
   * Search developers by various criteria using BM25 full-text search
   * Search across: emails (3x weight), login (2x weight), displayName, bio, company, location
   */
  async searchDevelopers(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Developer>> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured. Please set VITE_BOUNTYLAB_API_KEY environment variable.')
      }

      // API returns up to maxResults, not paginated with offset/limit
      // For now, request sufficient results for the requested page
      const maxResults = page * per_page

      // Build filters if provided
      const apiFilters = this.buildUserFilters(filters)

      const response = await this.client.searchUsers.search({
        query,
        maxResults: Math.min(maxResults, 1000), // API max is 1000
        ...(apiFilters && { filters: apiFilters }),
      })

      console.log('SDK Response for searchUsers:', {
        query,
        responseKeys: Object.keys(response),
        usersCount: response.users?.length,
        response,
      })

      // Handle response structure - users array is returned directly
      const allUsers = response.users || []
      
      if (!Array.isArray(allUsers)) {
        console.warn('Unexpected response structure:', { allUsers, response })
        throw new Error(`Invalid response structure from API: expected users array, got ${typeof allUsers}`)
      }

      // Paginate in memory for now (until API supports offset)
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      const items = allUsers.slice(startIdx, endIdx).map((user: any) => ({
        id: user.githubId || user.id,
        login: user.login,
        name: user.displayName,
        avatar_url: user.avatar_url || user.avatarUrl,
        bio: user.bio,
        company: user.company,
        location: user.location,
        followers: user.followers || 0,
        total_stars: user.publicRepoContributions || 0,
        devrank_score: user.devRank || 0,
        top_languages: user.topLanguages || [],
        github_url: `https://github.com/${user.login}`,
      }))

      return {
        items,
        total: allUsers.length,
        page,
        per_page,
        total_pages: Math.ceil(allUsers.length / per_page),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Developer search failed:', {
        query,
        error: errorMessage,
        hasApiKey: !!API_KEY,
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error(`Search failed: ${errorMessage}`)
    }
  }

  /**
   * Build filter object for user search
   */
  private buildUserFilters(filters?: SearchFilters): any {
    if (!filters) return undefined

    const filterArray = []

    if (filters.location) {
      // Use ContainsAllTokens for location fields (handles variations)
      filterArray.push({
        field: 'resolvedCity',
        op: 'ContainsAllTokens',
        value: filters.location,
      })
    }

    if (filters.language) {
      // Language filter for user profiles
      filterArray.push({
        field: 'bio',
        op: 'ContainsAllTokens',
        value: filters.language,
      })
    }

    if (filters.email_domain) {
      // Filter by email domain
      filterArray.push({
        field: 'emails',
        op: 'ContainsAllTokens',
        value: filters.email_domain,
      })
    }

    if (filters.min_followers) {
      filterArray.push({
        field: 'followers',
        op: 'Gte',
        value: filters.min_followers,
      })
    }

    if (filters.max_followers) {
      filterArray.push({
        field: 'followers',
        op: 'Lte',
        value: filters.max_followers,
      })
    }

    if (filterArray.length === 0) return undefined
    if (filterArray.length === 1) return filterArray[0]

    return {
      op: 'And',
      filters: filterArray,
    }
  }

  /**
   * Get a single developer by login
   */
  async getDeveloper(login: string): Promise<Developer> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Use searchUsers to find exact user
      const response = await this.client.searchUsers.search({
        query: `login:${login}`, // Search for exact login
        maxResults: 1,
      })

      const user = response.users?.[0]
      if (!user) {
        throw new Error(`Developer "${login}" not found`)
      }

      return {
        id: user.githubId || user.id,
        login: user.login,
        name: user.displayName,
        avatar_url: user.avatar_url || user.avatarUrl,
        bio: user.bio,
        company: user.company,
        location: user.location,
        followers: user.followers || 0,
        total_stars: user.publicRepoContributions || 0,
        devrank_score: user.devRank || 0,
        top_languages: user.topLanguages || [],
        github_url: `https://github.com/${login}`,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get developer failed:', {
        login,
        error: errorMessage,
      })
      throw new Error(`Get developer failed: ${errorMessage}`)
    }
  }

  /**
   * Get developer's repositories (using search)
   */
  async getDeveloperRepositories(
    login: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<PaginatedResponse<Repository>> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Search for repos by owner
      const maxResults = page * per_page
      const response = await this.client.searchRepos.search({
        query: `owner:${login}`,
        maxResults: Math.min(maxResults, 1000),
      })

      const allRepos = response.repositories || []
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      
      const items = allRepos.slice(startIdx, endIdx).map((repo: any) => ({
        id: repo.githubId || repo.id,
        name: repo.name,
        owner: repo.owner?.login || login,
        description: repo.description,
        url: repo.url,
        stars: repo.stargazerCount || 0,
        forks: repo.forkCount || 0,
        language: repo.primaryLanguage?.name,
        updated_at: repo.updatedAt,
      }))

      return {
        items,
        total: allRepos.length,
        page,
        per_page,
        total_pages: Math.ceil(allRepos.length / per_page),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get user repositories failed:', {
        login,
        error: errorMessage,
      })
      throw new Error(`Get user repositories failed: ${errorMessage}`)
    }
  }

  /**
   * Search repositories using semantic search
   * Semantic search understands meaning and context
   */
  async searchRepositories(
    query: string,
    filters?: {
      language?: string
      min_stars?: number
      max_stars?: number
      size?: 'small' | 'medium' | 'large'
      sort_by?: 'stars' | 'updated' | 'forks'
    },
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Repository>> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // API returns up to maxResults, not paginated with offset/limit
      const maxResults = page * per_page

      // Build filters per API documentation
      const apiFilters = this.buildRepositoryFilters(filters)

      const response = await this.client.searchRepos.search({
        query,
        maxResults: Math.min(maxResults, 1000), // API max is 1000
        ...(apiFilters && { filters: apiFilters }),
      })

      console.log('SDK Response for searchRepos:', {
        query,
        responseKeys: Object.keys(response),
        repositoriesCount: response.repositories?.length,
        response,
      })

      // Handle response structure - repositories array is returned directly
      const allRepos = response.repositories || []
      
      if (!Array.isArray(allRepos)) {
        console.warn('Unexpected repository response structure:', { allRepos, response })
        throw new Error(`Invalid response structure from API: expected repositories array, got ${typeof allRepos}`)
      }

      // Paginate in memory for now (until API supports offset)
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page
      const items = allRepos.slice(startIdx, endIdx).map((repo: any) => ({
        id: repo.githubId || repo.id,
        name: repo.name,
        owner: repo.owner?.login || repo.ownerLogin,
        description: repo.description,
        url: repo.url,
        stars: repo.stargazerCount || 0,
        forks: repo.forkCount || 0,
        language: repo.primaryLanguage?.name || repo.language,
        updated_at: repo.updatedAt,
      }))

      return {
        items,
        total: allRepos.length,
        page,
        per_page,
        total_pages: Math.ceil(allRepos.length / per_page),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Repository search failed:', {
        query,
        error: errorMessage,
        hasApiKey: !!API_KEY,
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error(`Search failed: ${errorMessage}`)
    }
  }

  /**
   * Build filter object for repository search
   * Per API docs: use structured filters, not query strings
   */
  private buildRepositoryFilters(filters?: {
    language?: string
    min_stars?: number
    max_stars?: number
    size?: 'small' | 'medium' | 'large'
    sort_by?: 'stars' | 'updated' | 'forks'
  }): any {
    if (!filters) return undefined

    const filterArray = []

    if (filters.language) {
      // Exact match for primary language
      filterArray.push({
        field: 'language',
        op: 'Eq',
        value: filters.language,
      })
    }

    if (filters.min_stars) {
      filterArray.push({
        field: 'stargazerCount',
        op: 'Gte',
        value: filters.min_stars,
      })
    }

    if (filters.max_stars) {
      filterArray.push({
        field: 'stargazerCount',
        op: 'Lte',
        value: filters.max_stars,
      })
    }

    if (filterArray.length === 0) return undefined
    if (filterArray.length === 1) return filterArray[0]

    return {
      op: 'And',
      filters: filterArray,
    }
  }

  /**
   * Get a single repository
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Search for the specific repo
      const response = await this.client.searchRepos.search({
        query: `${repo} owner:${owner}`,
        maxResults: 10,
      })

      const foundRepo = response.repositories?.find(
        (r: any) => r.name === repo && (r.owner?.login === owner || r.ownerLogin === owner)
      )

      if (!foundRepo) {
        throw new Error(`Repository "${owner}/${repo}" not found`)
      }

      return {
        id: foundRepo.githubId || foundRepo.id,
        name: foundRepo.name,
        owner,
        description: foundRepo.description,
        url: foundRepo.url,
        stars: foundRepo.stargazerCount || 0,
        forks: foundRepo.forkCount || 0,
        language: foundRepo.primaryLanguage?.name,
        updated_at: foundRepo.updatedAt,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get repository failed:', {
        owner,
        repo,
        error: errorMessage,
      })
      throw new Error(`Get repository failed: ${errorMessage}`)
    }
  }

  /**
   * Get repository contributors (using search)
   */
  async getRepositoryContributors(
    owner: string,
    repo: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<PaginatedResponse<Developer>> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Search for contributors by repository context
      const maxResults = page * per_page
      const response = await this.client.searchUsers.search({
        query: repo, // Search within repo context
        maxResults: Math.min(maxResults, 1000),
        filters: {
          field: 'contributions',
          op: 'Gte',
          value: 1,
        },
      })

      const allUsers = response.users || []
      const startIdx = (page - 1) * per_page
      const endIdx = startIdx + per_page

      const items = allUsers.slice(startIdx, endIdx).map((user: any) => ({
        id: user.githubId || user.id,
        login: user.login,
        name: user.displayName,
        avatar_url: user.avatar_url || user.avatarUrl,
        bio: user.bio,
        company: user.company,
        location: user.location,
        followers: user.followers || 0,
        total_stars: 0,
        devrank_score: 0,
        top_languages: [],
        github_url: `https://github.com/${user.login}`,
      }))

      return {
        items,
        total: allUsers.length,
        page,
        per_page,
        total_pages: Math.ceil(allUsers.length / per_page),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get repository contributors failed:', {
        owner,
        repo,
        error: errorMessage,
      })
      throw new Error(`Get repository contributors failed: ${errorMessage}`)
    }
  }

  /**
   * Get trending developers
   */
  async getTrendingDevelopers(
    language?: string,
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<Developer[]> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Search for trending developers using keyword search
      const query = language ? `${language} developer` : 'developer'
      const response = await this.client.searchUsers.search({
        query,
        maxResults: 50,
        filters: {
          field: 'followers',
          op: 'Gte',
          value: 100, // Trending = high follower count
        },
      })

      return response.users?.map((user: any) => ({
        id: user.githubId || user.id,
        login: user.login,
        name: user.displayName,
        avatar_url: user.avatar_url || user.avatarUrl,
        bio: user.bio,
        company: user.company,
        location: user.location,
        followers: user.followers || 0,
        total_stars: user.publicRepoContributions || 0,
        devrank_score: user.devRank || 0,
        top_languages: user.topLanguages || [],
        github_url: `https://github.com/${user.login}`,
      })) || []
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get trending developers failed:', {
        language,
        timeframe,
        error: errorMessage,
      })
      throw new Error(`Get trending developers failed: ${errorMessage}`)
    }
  }

  /**
   * Get developer by email
   */
  async getDeveloperByEmail(email: string): Promise<Developer> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Search by email (emails are weighted 3x in search)
      const response = await this.client.searchUsers.search({
        query: email,
        maxResults: 1,
      })

      const user = response.users?.[0]
      if (!user) {
        throw new Error(`Developer with email "${email}" not found`)
      }

      return {
        id: user.githubId || user.id,
        login: user.login,
        name: user.displayName,
        avatar_url: user.avatar_url || user.avatarUrl,
        bio: user.bio,
        company: user.company,
        location: user.location,
        followers: user.followers || 0,
        total_stars: user.publicRepoContributions || 0,
        devrank_score: user.devRank || 0,
        top_languages: user.topLanguages || [],
        github_url: `https://github.com/${user.login}`,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get developer by email failed:', {
        email,
        error: errorMessage,
      })
      throw new Error(`Get developer by email failed: ${errorMessage}`)
    }
  }
}

export const bountylabClient = new BountyLabClient()
