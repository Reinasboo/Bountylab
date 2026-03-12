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
   * Search developers by various criteria
   */
  async searchDevelopers(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    per_page: number = 20
  ): Promise<PaginatedResponse<Developer>> {
    try {
      const response = await this.client.searchUsers.search({
        query,
        limit: per_page,
        offset: (page - 1) * per_page,
      })

      // Transform response to match our interface
      const items = response.users?.map((user: any) => ({
        id: user.id,
        login: user.login,
        name: user.name,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        company: user.company,
        location: user.location,
        followers: user.followers || 0,
        total_stars: user.publicRepoContributions || 0,
        devrank_score: user.devRank || 0,
        top_languages: user.topLanguages || [],
        github_url: `https://github.com/${user.login}`,
      })) || []

      return {
        items,
        total: response.totalCount || 0,
        page,
        per_page,
        total_pages: Math.ceil((response.totalCount || 0) / per_page),
      }
    } catch (error) {
      console.error('Developer search failed:', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!API_KEY,
      })
      throw error
    }
  }

  /**
   * Get a single developer by login
   */
  async getDeveloper(login: string): Promise<Developer> {
    try {
      const response = await this.client.raw.getUser({
        login,
      })

      return {
        id: response.id,
        login: response.login,
        name: response.name,
        avatar_url: response.avatarUrl,
        bio: response.bio,
        company: response.company,
        location: response.location,
        followers: response.followers || 0,
        total_stars: response.publicRepoContributions || 0,
        devrank_score: response.devRank || 0,
        top_languages: response.topLanguages || [],
        github_url: `https://github.com/${login}`,
      }
    } catch (error) {
      console.error('Get developer failed:', {
        login,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get developer's repositories
   */
  async getDeveloperRepositories(
    login: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<PaginatedResponse<Repository>> {
    try {
      const response = await this.client.raw.getUserRepos({
        login,
        first: per_page,
        after: ((page - 1) * per_page).toString(),
      })

      const items = response.repositories?.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner?.login || login,
        description: repo.description,
        url: repo.url,
        stars: repo.stargazerCount || 0,
        forks: repo.forkCount || 0,
        language: repo.primaryLanguage?.name,
        updated_at: repo.updatedAt,
      })) || []

      return {
        items,
        total: response.totalCount || 0,
        page,
        per_page,
        total_pages: Math.ceil((response.totalCount || 0) / per_page),
      }
    } catch (error) {
      console.error('Get user repositories failed:', {
        login,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
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
    try {
      // Build filter array
      const filterArray = []
      
      if (filters?.language) {
        filterArray.push({
          field: 'language',
          op: 'Eq',
          value: filters.language,
        })
      }
      
      if (filters?.min_stars) {
        filterArray.push({
          field: 'stargazerCount',
          op: 'Gte',
          value: filters.min_stars,
        })
      }
      
      if (filters?.max_stars) {
        filterArray.push({
          field: 'stargazerCount',
          op: 'Lte',
          value: filters.max_stars,
        })
      }

      const response = await this.client.searchRepos.search({
        query,
        limit: per_page,
        offset: (page - 1) * per_page,
        filters: filterArray.length > 0 ? {
          op: 'And',
          filters: filterArray,
        } : undefined,
      })

      const items = response.repositories?.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner?.login,
        description: repo.description,
        url: repo.url,
        stars: repo.stargazerCount || 0,
        forks: repo.forkCount || 0,
        language: repo.primaryLanguage?.name,
        updated_at: repo.updatedAt,
      })) || []

      return {
        items,
        total: response.totalCount || 0,
        page,
        per_page,
        total_pages: Math.ceil((response.totalCount || 0) / per_page),
      }
    } catch (error) {
      console.error('Repository search failed:', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!API_KEY,
      })
      throw error
    }
  }

  /**
   * Get a single repository
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    try {
      const response = await this.client.raw.getRepository({
        owner,
        name: repo,
      })

      return {
        id: response.id,
        name: response.name,
        owner,
        description: response.description,
        url: response.url,
        stars: response.stargazerCount || 0,
        forks: response.forkCount || 0,
        language: response.primaryLanguage?.name,
        updated_at: response.updatedAt,
      }
    } catch (error) {
      console.error('Get repository failed:', {
        owner,
        repo,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
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
    try {
      const response = await this.client.raw.getRepositoryContributors({
        owner,
        name: repo,
        first: per_page,
        after: ((page - 1) * per_page).toString(),
      })

      const items = response.contributors?.map((contributor: any) => ({
        id: contributor.id,
        login: contributor.login,
        name: contributor.name,
        avatar_url: contributor.avatarUrl,
        bio: contributor.bio,
        company: contributor.company,
        location: contributor.location,
        followers: contributor.followers || 0,
        total_stars: 0,
        devrank_score: 0,
        top_languages: [],
        github_url: `https://github.com/${contributor.login}`,
      })) || []

      return {
        items,
        total: response.totalCount || 0,
        page,
        per_page,
        total_pages: Math.ceil((response.totalCount || 0) / per_page),
      }
    } catch (error) {
      console.error('Get repository contributors failed:', {
        owner,
        repo,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
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
      // Use search with high follower preference
      const response = await this.client.searchUsers.search({
        query: language ? `language:${language}` : '*',
        limit: 50,
      })

      return response.users?.map((user: any) => ({
        id: user.id,
        login: user.login,
        name: user.name,
        avatar_url: user.avatarUrl,
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
      console.error('Get trending developers failed:', {
        language,
        timeframe,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get developer by email
   */
  async getDeveloperByEmail(email: string): Promise<Developer> {
    try {
      const response = await this.client.raw.getUserByEmail({
        email,
      })

      return {
        id: response.id,
        login: response.login,
        name: response.name,
        avatar_url: response.avatarUrl,
        bio: response.bio,
        company: response.company,
        location: response.location,
        followers: response.followers || 0,
        total_stars: response.publicRepoContributions || 0,
        devrank_score: response.devRank || 0,
        top_languages: response.topLanguages || [],
        github_url: `https://github.com/${response.login}`,
      }
    } catch (error) {
      console.error('Get developer by email failed:', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
}

export const bountylabClient = new BountyLabClient()
