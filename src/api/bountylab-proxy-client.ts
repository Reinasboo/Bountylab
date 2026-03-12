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
  private baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'

  async searchUsers(query: string, maxResults: number = 20, filters?: any): Promise<SearchUsersResponse> {
    const response = await fetch(`${this.baseUrl}/api/search-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults, filters })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Search failed with status ${response.status}`)
    }

    return response.json()
  }

  async searchRepos(query: string, maxResults: number = 20, filters?: any): Promise<SearchReposResponse> {
    const response = await fetch(`${this.baseUrl}/api/search-repos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults, filters })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Search failed with status ${response.status}`)
    }

    return response.json()
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
