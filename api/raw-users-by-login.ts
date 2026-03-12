import type { VercelRequest, VercelResponse } from '@vercel/node'
import Bountylab from '@bountylab/bountylab'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { logins } = request.body

  if (!logins || !Array.isArray(logins) || logins.length === 0) {
    return response.status(400).json({ error: 'logins array is required' })
  }

  const apiKey = process.env.VITE_BOUNTYLAB_API_KEY
  const apiBaseUrl = process.env.VITE_BOUNTYLAB_API_BASE_URL || 'https://api.bountylab.io'
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' })
  }

  try {
    // Use BountyLab SDK directly
    const client = new Bountylab({ apiKey, baseUrl: apiBaseUrl })
    const data = await client.rawUsers.byLogin({ logins })

    return response.status(200).json(data)

  } catch (error) {
    console.error('Raw users error:', error)
    return response.status(500).json({
      error: 'Failed to get users',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
