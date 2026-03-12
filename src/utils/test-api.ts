/**
 * Utility to test API connectivity directly
 */

export async function testAPIConnectivity() {
  const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY

  console.log('🧪 Testing API connectivity...')
  console.log({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
  })

  if (!apiKey) {
    console.error('❌ API Key is missing! Check Vercel environment variables.')
    return { success: false, error: 'Missing API key' }
  }

  try {
    // Test with a simple raw fetch to the BountyLab API
    const response = await fetch('https://api.bountylab.io/api/search/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'javascript',
        maxResults: 1,
      }),
    })

    console.log('🔍 Raw API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        contentType: response.headers.get('content-type'),
        server: response.headers.get('server'),
      },
    })

    const data = await response.json()
    console.log('📦 Response JSON:', data)

    if (response.ok) {
      console.log('✅ API is reachable and responding!')
      return { success: true, data }
    } else {
      console.error('❌ API returned error status:', response.status)
      console.error('Error response:', data)
      return { success: false, error: `HTTP ${response.status}`, data }
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
