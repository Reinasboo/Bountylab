import { Developer, Repository, SearchFilters } from '../types/developer'

const API_KEY = import.meta.env.VITE_BOUNTYLAB_API_KEY

if (!API_KEY) {
  console.warn(
    'VITE_BOUNTYLAB_API_KEY environment variable is not set. API calls may fail.'
  )
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

class BountyLabClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = 'https://api.bountylab.dev/v1'
    this.apiKey = API_KEY || ''
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = 
          errorData?.error || 
          errorData?.message || 
          `API Error: ${response.status} ${response.statusText}`
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          error: errorMessage,
          hasApiKey: !!this.apiKey,
        })
        
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error('API Request Failed:', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!this.apiKey,
      })
      throw error
    }
  }

  /**
   * Search developers by various criteria
   */
  async searchDevelopers(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Developer>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: per_page.toString(),
    })

    if (filters?.language) params.append('language', filters.language)
    if (filters?.location) params.append('location', filters.location)
    if (filters?.email_domain)
      params.append('email_domain', filters.email_domain)
    if (filters?.min_followers)
      params.append('min_followers', filters.min_followers.toString())
    if (filters?.max_followers)
      params.append('max_followers', filters.max_followers.toString())
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)

    return this.fetch<PaginatedResponse<Developer>>(
      `/developers/search?${params.toString()}`
    )
  }

  /**
   * Get a single developer by login
   */
  async getDeveloper(login: string): Promise<Developer> {
    return this.fetch<Developer>(`/developers/${login}`)
  }

  /**
   * Get developer's repositories
   */
  async getDeveloperRepositories(
    login: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<PaginatedResponse<Repository>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    })
    return this.fetch<PaginatedResponse<Repository>>(
      `/developers/${login}/repos?${params.toString()}`
    )
  }

  /**
   * Search repositories by semantic query
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
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: per_page.toString(),
    })

    if (filters?.language) params.append('language', filters.language)
    if (filters?.min_stars)
      params.append('min_stars', filters.min_stars.toString())
    if (filters?.max_stars)
      params.append('max_stars', filters.max_stars.toString())
    if (filters?.size) params.append('size', filters.size)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)

    return this.fetch<PaginatedResponse<Repository>>(
      `/repositories/search?${params.toString()}`
    )
  }

  /**
   * Get a single repository
   */
  async getRepository(
    owner: string,
    repo: string
  ): Promise<Repository> {
    return this.fetch<Repository>(
      `/repositories/${owner}/${repo}`
    )
  }

  /**
   * Get repository contributors
   */
  async getRepositoryContributors(
    owner: string,
    repo: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<PaginatedResponse<Developer>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    })
    return this.fetch<PaginatedResponse<Developer>>(
      `/repositories/${owner}/${repo}/contributors?${params.toString()}`
    )
  }

  /**
   * Get trending developers
   */
  async getTrendingDevelopers(
    language?: string,
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<Developer[]> {
    const params = new URLSearchParams({
      timeframe,
    })
    if (language) params.append('language', language)

    return this.fetch<Developer[]>(
      `/developers/trending?${params.toString()}`
    )
  }

  /**
   * Get developer by email
   */
  async getDeveloperByEmail(email: string): Promise<Developer> {
    return this.fetch<Developer>(`/developers/email/${email}`)
  }
}

export const bountylabClient = new BountyLabClient()
