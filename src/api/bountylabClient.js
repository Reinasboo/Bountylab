const API_KEY = import.meta.env.VITE_BOUNTYLAB_API_KEY;
if (!API_KEY) {
    console.warn('VITE_BOUNTYLAB_API_KEY environment variable is not set. API calls may fail.');
}
class BountyLabClient {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = 'https://api.bountylab.dev/v1';
        this.apiKey = API_KEY || '';
    }
    async fetch(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers,
        };
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Search developers by various criteria
     */
    async searchDevelopers(query, filters, page = 1, per_page = 20) {
        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            per_page: per_page.toString(),
        });
        if (filters?.language)
            params.append('language', filters.language);
        if (filters?.location)
            params.append('location', filters.location);
        if (filters?.email_domain)
            params.append('email_domain', filters.email_domain);
        if (filters?.min_followers)
            params.append('min_followers', filters.min_followers.toString());
        if (filters?.max_followers)
            params.append('max_followers', filters.max_followers.toString());
        if (filters?.sort_by)
            params.append('sort_by', filters.sort_by);
        return this.fetch(`/developers/search?${params.toString()}`);
    }
    /**
     * Get a single developer by login
     */
    async getDeveloper(login) {
        return this.fetch(`/developers/${login}`);
    }
    /**
     * Get developer's repositories
     */
    async getDeveloperRepositories(login, page = 1, per_page = 30) {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString(),
        });
        return this.fetch(`/developers/${login}/repos?${params.toString()}`);
    }
    /**
     * Search repositories by semantic query
     */
    async searchRepositories(query, filters, page = 1, per_page = 20) {
        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            per_page: per_page.toString(),
        });
        if (filters?.language)
            params.append('language', filters.language);
        if (filters?.min_stars)
            params.append('min_stars', filters.min_stars.toString());
        if (filters?.max_stars)
            params.append('max_stars', filters.max_stars.toString());
        if (filters?.size)
            params.append('size', filters.size);
        if (filters?.sort_by)
            params.append('sort_by', filters.sort_by);
        return this.fetch(`/repositories/search?${params.toString()}`);
    }
    /**
     * Get a single repository
     */
    async getRepository(owner, repo) {
        return this.fetch(`/repositories/${owner}/${repo}`);
    }
    /**
     * Get repository contributors
     */
    async getRepositoryContributors(owner, repo, page = 1, per_page = 30) {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString(),
        });
        return this.fetch(`/repositories/${owner}/${repo}/contributors?${params.toString()}`);
    }
    /**
     * Get trending developers
     */
    async getTrendingDevelopers(language, timeframe = 'weekly') {
        const params = new URLSearchParams({
            timeframe,
        });
        if (language)
            params.append('language', language);
        return this.fetch(`/developers/trending?${params.toString()}`);
    }
    /**
     * Get developer by email
     */
    async getDeveloperByEmail(email) {
        return this.fetch(`/developers/email/${email}`);
    }
}
export const bountylabClient = new BountyLabClient();
