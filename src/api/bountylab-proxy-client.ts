/**
 * BountyLab API Proxy Client
 * 
 * This client calls our Vercel backend functions which proxy requests
 * to the BountyLab API. This bypasses CORS issues since the requests
 * come from server-to-server rather than browser-to-API.
 */

export interface SearchUsersResponse {
  users: Array<{
    id: string
    login: string
    displayName: string
    bio?: string
    company?: string
    location?: string
    followers?: number
    publicRepoContributions?: number
    devRank?: number
    topLanguages?: string[]
    githubId?: string
  }>
  count: number
}

export interface SearchReposResponse {
  repositories: Array<{
    id: string
    name: string
    description?: string
    owner?: { login: string }
    ownerLogin?: string
    stargazerCount?: number
    forkCount?: number
    primaryLanguage?: { name: string }
    language?: string
    url?: string
    updatedAt?: string
    githubId?: string
  }>
  count: number
}

export interface RawUsersResponse {
  users: Array<any>
  count: number
}

export interface RawReposResponse {
  repositories: Array<any>
  count: number
}

class BountyLabProxyClient {
  private baseUrl: string

  constructor() {
    // In development, use local proxy server on port 3001
    // Support localhost, 127.0.0.1, and any local hostname
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.endsWith('.local') ||
                      window.location.port === '5173' // Vite dev server
      
      if (isLocal) {
        this.baseUrl = 'http://localhost:3001'
        console.log('[PROXY CLIENT] Using local proxy server')
      } else {
        this.baseUrl = ''
        console.log('[PROXY CLIENT] Using relative /api paths (Vercel Functions)')
      }
    } else {
      this.baseUrl = ''
    }
  }

  async searchUsers(query: string, maxResults: number = 20, filters?: any): Promise<SearchUsersResponse> {
      try {
        console.log('[PROXY CLIENT] searchUsers: Sending request', { url: `${this.baseUrl}/api/search-users`, query, maxResults, filters })
        const response = await fetch(`${this.baseUrl}/api/search-users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, maxResults, filters })
        })
        console.log('[PROXY CLIENT] searchUsers: Response status', response.status, response.statusText)
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }))
          console.error('[PROXY CLIENT] searchUsers: Error response', error)
          throw new Error(error.error || `Search failed with status ${response.status}`)
        }
        const data = await response.json()
        console.log('[PROXY CLIENT] searchUsers: Response data', data)
        return data
      } catch (err) {
        console.error('[PROXY CLIENT] searchUsers: Network or fetch error', err)
        throw err
      }
  }

  async searchRepos(query: string, maxResults: number = 20, filters?: any): Promise<SearchReposResponse> {
      try {
        console.log('[PROXY CLIENT] searchRepos: Sending request', { url: `${this.baseUrl}/api/search-repos`, query, maxResults, filters })
        const response = await fetch(`${this.baseUrl}/api/search-repos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, maxResults, filters })
        })
        console.log('[PROXY CLIENT] searchRepos: Response status', response.status, response.statusText)
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }))
          console.error('[PROXY CLIENT] searchRepos: Error response', error)
          throw new Error(error.error || `Search failed with status ${response.status}`)
        }
        const data = await response.json()
        console.log('[PROXY CLIENT] searchRepos: Response data', data)
        return data
      } catch (err) {
        console.error('[PROXY CLIENT] searchRepos: Network or fetch error', err)
        throw err
      }
  }

  async getRawUsersByLogin(logins: string[]): Promise<RawUsersResponse> {
    const response = await fetch(`${this.baseUrl}/api/raw-users-by-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logins })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Get users failed with status ${response.status}`)
    }

    return response.json()
  }

  async getRawReposByFullname(fullNames: string[]): Promise<RawReposResponse> {
    const response = await fetch(`${this.baseUrl}/api/raw-repos-by-fullname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullNames })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Get repos failed with status ${response.status}`)
    }

    return response.json()
  }
}

export const bountyLabProxyClient = new BountyLabProxyClient()
