/**
 * Utility to test API connectivity via proxy
 */

export async function testAPIConnectivity() {
  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : ''

  console.log('🧪 Testing API connectivity...')

  try {
    // Test via the proxy instead of direct API call
    const response = await fetch(`${baseUrl}/api/search-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test',
        maxResults: 1,
      }),
    })

    console.log('🔍 Proxy API Response:', {
      status: response.status,
      statusText: response.statusText,
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
