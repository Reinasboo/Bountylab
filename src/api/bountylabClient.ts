import Bountylab from '@bountylab/bountylab'
import { Developer, Repository, SearchFilters } from '../types/developer'

const API_KEY = import.meta.env.VITE_BOUNTYLAB_API_KEY

if (!API_KEY) {
  console.warn(
    'VITE_BOUNTYLAB_API_KEY environment variable is not set. API calls will fail.'
  )
}

// Intercept fetch to log all API requests
const originalFetch = globalThis.fetch
globalThis.fetch = function(...args: any[]) {
  const [resource, config] = args
  console.log('🔗 API Request:', {
    url: resource,
    method: config?.method || 'GET',
    headerAuth: config?.headers?.Authorization ? 'Bearer ' + config.headers.Authorization.substring(7, 17) + '...' : 'none',
  })
  
  return originalFetch.apply(globalThis, args).then((response: Response) => {
    console.log('📡 API Response:', {
      url: resource,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    })
    return response
  }).catch((error: Error) => {
    console.error('❌ API Request Failed:', {
      url: resource,
      error: error.message,
    })
    throw error
  })
} as any

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
    console.log('Initializing BountyLab client with:', {
      hasApiKey: !!API_KEY,
      apiKeyLength: API_KEY?.length,
      apiKeyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : 'none',
    })

    this.client = new Bountylab({
      apiKey: API_KEY || '',
    })

    console.log('BountyLab client initialized:', {
      clientType: typeof this.client,
      hasSearchUsers: !!this.client?.searchUsers,
      hasSearchRepos: !!this.client?.searchRepos,
      hasRaw: !!this.client?.raw,
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
        throw new Error('VITE_BOUNTYLAB_API_KEY environment variable is not set. Configure it in Vercel dashboard under Settings → Environment Variables.')
      }

      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      // API returns up to maxResults, not paginated with offset/limit
      // For now, request sufficient results for the requested page
      const maxResults = Math.min(page * per_page, 1000) // API max is 1000

      // Build filters if provided
      const apiFilters = this.buildUserFilters(filters)

      console.log('Searching developers:', {
        query: query.trim(),
        filters: apiFilters,
        maxResults,
        page,
        per_page,
      })

      const response = await this.client.searchUsers.search({
        query: query.trim(),
        maxResults,
        ...(apiFilters && { filters: apiFilters }),
      })

      console.log('Developer search response:', {
        query: query.trim(),
        foundCount: response.users?.length || 0,
        totalAvailable: response.count || response.users?.length || 0,
        hasError: !response.users,
      })

      // Handle response structure - users array is returned directly
      const allUsers = response.users || []
      
      if (!Array.isArray(allUsers)) {
        console.warn('Unexpected response structure:', { allUsers, response })
        throw new Error(`Invalid response format from API: expected users array`)
      }

      if (allUsers.length === 0) {
        console.log('Developer search returned no results for query:', query.trim())
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
      const errorDetails = {
        query: query?.trim(),
        error: errorMessage,
        hasApiKey: !!API_KEY,
        errorType: error?.constructor?.name,
        errorStack: error instanceof Error ? error.stack : undefined,
        errorCause: (error as any)?.cause,
        fullError: error,
      }
      console.error('❌ Developer search failed:', errorDetails)
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('failed') || errorMessage.includes('fetch')) {
        console.error('🔍 Network/fetch error - possible causes:', {
          '1. API key invalid': 'Check if VITE_BOUNTYLAB_API_KEY is correct in Vercel dashboard',
          '2. API endpoint unreachable': 'Verify BountyLab API service is running',
          '3. CORS issue': 'Check browser Network tab for CORS errors',
          '4. SDK base URL wrong': 'Verify SDK is configured with correct base domain',
        })
      } else if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('404')) {
        console.error('🔍 404 error - possible causes:', {
          '1. Wrong API endpoint': 'SDK may be using incorrect base URL',
          '2. API key rejected': 'Check if API key is valid for this API',
          '3. Service endpoint changed': 'Verify BountyLab API hasn\'t changed domains',
        })
      }
      
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
   * Get a single developer by login using raw endpoint (direct lookup)
   * More reliable than search for exact username lookups
   */
  async getDeveloper(login: string): Promise<Developer> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Use raw endpoint for direct lookup - more reliable than search
      const response = await this.client.raw.getByLogin([login])

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
        hasApiKey: !!API_KEY,
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
      const maxResults = Math.min(page * per_page, 1000)
      const response = await this.client.searchRepos.search({
        query: `owner:${login}`,
        maxResults,
      })

      console.log('Developer repositories response:', {
        login,
        foundCount: response.repositories?.length || 0,
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
        hasApiKey: !!API_KEY,
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
        throw new Error('VITE_BOUNTYLAB_API_KEY environment variable is not set. Configure it in Vercel dashboard under Settings → Environment Variables.')
      }

      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      // API returns up to maxResults, not paginated with offset/limit
      const maxResults = Math.min(page * per_page, 1000) // API max is 1000

      // Build filters per API documentation
      const apiFilters = this.buildRepositoryFilters(filters)

      console.log('Searching repositories:', {
        query: query.trim(),
        filters: apiFilters,
        maxResults,
        page,
        per_page,
      })

      const response = await this.client.searchRepos.search({
        query: query.trim(),
        maxResults,
        ...(apiFilters && { filters: apiFilters }),
      })

      console.log('Repository search response:', {
        query: query.trim(),
        foundCount: response.repositories?.length || 0,
        totalAvailable: response.count || response.repositories?.length || 0,
        hasError: !response.repositories,
      })

      // Handle response structure - repositories array is returned directly
      const allRepos = response.repositories || []
      
      if (!Array.isArray(allRepos)) {
        console.warn('Unexpected repository response structure:', { allRepos, response })
        throw new Error(`Invalid response format from API: expected repositories array`)
      }

      if (allRepos.length === 0) {
        console.log('Repository search returned no results for query:', query.trim())
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
      const errorDetails = {
        query: query?.trim(),
        error: errorMessage,
        hasApiKey: !!API_KEY,
        errorType: error?.constructor?.name,
        errorStack: error instanceof Error ? error.stack : undefined,
      }
      console.error('❌ Repository search failed:', errorDetails)
      
      if (errorMessage.includes('failed') || errorMessage.includes('fetch')) {
        console.error('🔍 Network/fetch error - check API key and network in browser DevTools')
      } else if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('404')) {
        console.error('🔍 404 error - SDK endpoint may be incorrect. Check BountyLab API configuration.')
      }
      
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
   * Get a single repository using raw endpoint (direct lookup by fullname)
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      // Use raw endpoint for direct lookup - more reliable than search
      const fullname = `${owner}/${repo}`
      const response = await this.client.raw.getReposByFullname([fullname])

      const foundRepo = response.repositories?.[0]
      if (!foundRepo) {
        throw new Error(`Repository "${fullname}" not found`)
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
        hasApiKey: !!API_KEY,
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
      const maxResults = Math.min(page * per_page, 1000)
      const response = await this.client.searchUsers.search({
        query: repo, // Search within repo context
        maxResults,
      })

      console.log('Repository contributors response:', {
        owner,
        repo,
        foundCount: response.users?.length || 0,
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
        hasApiKey: !!API_KEY,
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
      
      // Build filter for high follower count
      const filter = {
        field: 'followers',
        op: 'Gte',
        value: 100, // Trending = high follower count
      }

      console.log('Fetching trending developers:', {
        query,
        language,
        timeframe,
      })

      const response = await this.client.searchUsers.search({
        query,
        maxResults: 50,
        filters: filter,
      })

      console.log('Trending developers response:', {
        foundCount: response.users?.length || 0,
        language,
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
        hasApiKey: !!API_KEY,
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
        hasApiKey: !!API_KEY,
      })
      throw new Error(`Get developer by email failed: ${errorMessage}`)
    }
  }

  /**
   * Get best email address for a developer by login
   * Uses the dedicated email endpoint for more accurate results
   */
  async getBestEmailByLogin(login: string): Promise<string | null> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      const response = await this.client.users.bestEmailByLogin([login])
      
      const emailData = response.emails?.[0]
      console.log('Best email response:', {
        login,
        emailData,
      })

      return emailData?.email || null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get best email failed:', {
        login,
        error: errorMessage,
        hasApiKey: !!API_KEY,
      })
      // Return null instead of throwing - email lookup is optional
      return null
    }
  }

  /**
   * Get best email addresses for multiple developers
   */
  async getBestEmailsByLogins(logins: string[]): Promise<Map<string, string | null>> {
    try {
      if (!API_KEY) {
        throw new Error('API key not configured.')
      }

      const response = await this.client.users.bestEmail(logins)
      
      const emailMap = new Map<string, string | null>()
      
      response.emails?.forEach((emailData: any) => {
        const login = emailData.login || emailData.username
        emailMap.set(login, emailData.email || null)
      })

      return emailMap
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Get best emails failed:', {
        loginsCount: logins.length,
        error: errorMessage,
        hasApiKey: !!API_KEY,
      })
      // Return empty map instead of throwing - email lookup is optional
      return new Map()
    }
  }
}

export const bountylabClient = new BountyLabClient()
