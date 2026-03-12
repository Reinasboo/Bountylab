/**
 * Local development server for testing API proxies
 * This uses the BountyLab SDK directly to handle API calls
 */

import express from 'express'
import cors from 'cors'
import Bountylab from '@bountylab/bountylab'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const API_KEY = process.env.VITE_BOUNTYLAB_API_KEY || 'gMolfPrnxsbeTBJQGfydcAilRkNYHwyHxBalifYjITEaUJieRABauFICmIAYGtbj'

// Initialize SDK once
const client = new Bountylab({ apiKey: API_KEY })

// Search users proxy
app.post('/api/search-users', async (req, res) => {
  try {
    const { query, maxResults, filters } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    console.log('[PROXY] Processing search request:', { query, maxResults })

    const response = await client.searchUsers.search({
      query,
      maxResults: maxResults || 20,
      ...(filters && { filters })
    })

    console.log('[PROXY] SDK returned:', { count: response.count, usersCount: response.users?.length })
    return res.status(200).json(response)

  } catch (error) {
    console.error('[PROXY] Error:', error.message)
    return res.status(500).json({
      error: 'Search failed',
      details: error.message
    })
  }
})

// Search repos proxy
app.post('/api/search-repos', async (req, res) => {
  try {
    const { query, maxResults, filters } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    const response = await client.searchRepos.search({
      query,
      maxResults: maxResults || 20,
      ...(filters && { filters })
    })

    return res.status(200).json(response)

  } catch (error) {
    console.error('[PROXY] Error:', error.message)
    return res.status(500).json({
      error: 'Search failed',
      details: error.message
    })
  }
})

// Raw users by login proxy
app.post('/api/raw-users-by-login', async (req, res) => {
  try {
    const { logins } = req.body

    if (!logins || !Array.isArray(logins) || logins.length === 0) {
      return res.status(400).json({ error: 'logins array is required' })
    }

    const response = await client.rawUsers.byLogin({ logins })
    return res.status(200).json(response)

  } catch (error) {
    console.error('[PROXY] Error:', error.message)
    return res.status(500).json({
      error: 'Get users failed',
      details: error.message
    })
  }
})

// Raw repos by fullname proxy
app.post('/api/raw-repos-by-fullname', async (req, res) => {
  try {
    const { fullNames } = req.body

    if (!fullNames || !Array.isArray(fullNames) || fullNames.length === 0) {
      return res.status(400).json({ error: 'fullNames array is required' })
    }

    const response = await client.rawRepos.byFullname({ fullNames })
    return res.status(200).json(response)

  } catch (error) {
    console.error('[PROXY] Error:', error.message)
    return res.status(500).json({
      error: 'Get repos failed',
      details: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`API Proxy server running on http://localhost:${PORT}`)
  console.log('Using BountyLab SDK directly (no direct HTTP calls)')
  console.log('Endpoints:')
  console.log('  POST /api/search-users')
  console.log('  POST /api/search-repos')
  console.log('  POST /api/raw-users-by-login')
  console.log('  POST /api/raw-repos-by-fullname')
})
