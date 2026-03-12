import type { VercelRequest, VercelResponse } from '@vercel/node'
import Bountylab from '@bountylab/bountylab'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { query, maxResults, filters } = request.body

  // Validate input
  if (!query) {
    return response.status(400).json({ error: 'Query parameter is required' })
  }

  const apiKey = process.env.VITE_BOUNTYLAB_API_KEY
  const apiBaseUrl = process.env.VITE_BOUNTYLAB_API_BASE_URL || 'https://api.bountylab.io'
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' })
  }

  try {
    // Use BountyLab SDK directly
    const client = new Bountylab({ apiKey, baseUrl: apiBaseUrl })
    const data = await client.searchUsers.search({
      query,
      maxResults: maxResults || 20,
      ...(filters && { filters })
    })

    return response.status(200).json(data)

  } catch (error) {
    console.error('Search proxy error:', error)
    return response.status(500).json({
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
