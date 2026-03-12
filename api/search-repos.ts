import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { query, maxResults, filters } = request.body

  if (!query) {
    return response.status(400).json({ error: 'Query parameter is required' })
  }

  const apiKey = process.env.VITE_BOUNTYLAB_API_KEY
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' })
  }

  try {
    const apiResponse = await fetch('https://api.bountylab.io/search/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        maxResults: maxResults || 20,
        ...(filters && { filters })
      })
    })

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      return response.status(apiResponse.status).json({
        error: `BountyLab API error: ${apiResponse.statusText}`,
        details: errorData
      })
    }

    const data = await apiResponse.json()
    return response.status(200).json(data)

  } catch (error) {
    console.error('Search repos proxy error:', error)
    return response.status(500).json({
      error: 'Failed to fetch from BountyLab API',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
