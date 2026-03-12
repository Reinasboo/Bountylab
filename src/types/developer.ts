export interface Developer {
  id: string
  login: string
  name: string
  bio?: string
  company?: string
  location?: string
  email?: string
  avatar_url: string
  github_url: string
  public_repos: number
  followers: number
  following: number
  public_gists: number
  created_at: string
  updated_at: string
  devrank_score?: number
  top_languages?: string[]
  recent_activity?: number
  total_stars?: number
  hiring?: boolean
}

export interface Repository {
  id: string
  name: string
  full_name: string
  owner: Developer
  description?: string
  url: string
  homepage?: string
  stargazers_count: number
  watchers_count: number
  language?: string
  forks_count: number
  open_issues_count: number
  pushed_at: string
  created_at: string
  topics: string[]
  size: number
  contributors?: Developer[]
}

export interface SavedCandidate {
  id: string
  developer: Developer
  tags: string[]
  notes: string
  status: 'interested' | 'contacted' | 'rejected' | 'hired'
  recruiter_score: number
  saved_at: string
  updated_at: string
}

export interface SearchFilters {
  language?: string
  location?: string
  email_domain?: string
  min_followers?: number
  max_followers?: number
  activity_level?: 'active' | 'moderate' | 'low'
  sort_by?: 'devrank' | 'followers' | 'stars' | 'recent'
}

export interface RankingWeights {
  devrank: number
  stars: number
  activity: number
  followers: number
}
