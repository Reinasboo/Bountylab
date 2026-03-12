import { useEffect, useState } from 'react'

export function TestAPI() {
  const [result, setResult] = useState<{
    status: string
    message: string
    data?: Record<string, any>
  }>({
    status: 'loading',
    message: 'Initializing SDK...',
  })

  useEffect(() => {
    const test = async () => {
      try {
        // Check env
        const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY
        
        if (!apiKey) {
          setResult({
            status: 'error',
            message: 'API_KEY not found in import.meta.env',
          })
          return
        }

        setResult({ status: 'loading', message: `API Key found: ${apiKey.substring(0, 15)}...` })

        // Import SDK
        const module = await import('@bountylab/bountylab')
        const Bountylab = module.default
        
        const client = new Bountylab({ apiKey })
        
        setResult({ status: 'loading', message: 'SDK initialized, attempting search...' })

        // Try search
        const response = await client.searchUsers.search({
          query: 'javascript',
          maxResults: 1,
        })

        setResult({
          status: 'success',
          message: `Search successful! Found ${response.count} total users`,
          data: {
            totalCount: response.count,
            resultsReturned: response.users?.length || 0,
            firstUser: response.users?.[0]?.login,
          },
        })
      } catch (error) {
        setResult({
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
          data: { fullError: error },
        })
      }
    }

    test()
  }, [])

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'monospace', 
      maxWidth: '800px', 
      margin: '2rem auto',
      border: `3px solid ${result.status === 'error' ? '#ff0000' : result.status === 'success' ? '#00aa00' : '#0000ff'}`,
      borderRadius: '8px',
      background: '#f9f9f9'
    }}>
      <h1>SDK Test Result</h1>
      <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', border: '1px solid #ddd' }}>
        <div>Status: <strong style={{ color: result.status === 'error' ? 'red' : result.status === 'success' ? 'green' : 'blue' }}>
          {result.status.toUpperCase()}
        </strong></div>
        <div style={{ marginTop: '0.5rem' }}>Message: {result.message}</div>
        {result.data && (
          <pre style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
