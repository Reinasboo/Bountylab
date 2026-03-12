import React, { useEffect, useState } from 'react'

interface TestResult {
  step: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: Record<string, any>
}

export function DirectAPITest() {
  const [results, setResults] = useState<TestResult[]>([])

  useEffect(() => {
    const runTests = async () => {
      const testResults: TestResult[] = []

      // Test 1: Check environment variable
      testResults.push({
        step: 'Environment Variable',
        status: 'pending',
        message: 'Checking VITE_BOUNTYLAB_API_KEY...'
      })
      setResults([...testResults])

      const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY
      if (!apiKey) {
        testResults[0] = {
          step: 'Environment Variable',
          status: 'error',
          message: 'API key not found in import.meta.env.VITE_BOUNTYLAB_API_KEY'
        }
        setResults([...testResults])
        return
      }

      testResults[0] = {
        step: 'Environment Variable',
        status: 'success',
        message: `API key found: ${apiKey.substring(0, 15)}...`,
        details: { length: apiKey.length }
      }
      setResults([...testResults])

      // Test 2: Direct fetch to API
      testResults.push({
        step: 'Direct API Call (fetch)',
        status: 'pending',
        message: 'Calling https://api.bountylab.io/search/users with Bearer token...'
      })
      setResults([...testResults])

      try {
        const response = await fetch('https://api.bountylab.io/search/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'javascript',
            maxResults: 1,
          })
        })

        const responseData = await response.json()
        
        if (response.ok) {
          testResults[1] = {
            step: 'Direct API Call (fetch)',
            status: 'success',
            message: `API responded with status ${response.status}`,
            details: {
              status: response.status,
              usersFound: responseData.users?.length || 0,
              totalCount: responseData.count || 0,
              responsKeys: Object.keys(responseData)
            }
          }
        } else {
          testResults[1] = {
            step: 'Direct API Call (fetch)',
            status: 'error',
            message: `API responded with status ${response.status}`,
            details: {
              status: response.status,
              response: responseData
            }
          }
        }
      } catch (error) {
        testResults[1] = {
          step: 'Direct API Call (fetch)',
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
          details: { error }
        }
      }
      setResults([...testResults])

      // Test 3: Try SDK
      testResults.push({
        step: 'SDK Import & Test',
        status: 'pending',
        message: 'Importing and testing Bountylab SDK...'
      })
      setResults([...testResults])

      try {
        const module = await import('@bountylab/bountylab')
        const Bountylab = module.default
        const client = new Bountylab({ apiKey })
        
        const sdkResponse = await client.searchUsers.search({
          query: 'javascript',
          maxResults: 1
        })

        testResults[2] = {
          step: 'SDK Import & Test',
          status: 'success',
          message: 'SDK search successful',
          details: {
            usersFound: sdkResponse.users?.length || 0,
            totalCount: sdkResponse.count || 0
          }
        }
      } catch (error) {
        testResults[2] = {
          step: 'SDK Import & Test',
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
          details: { error }
        }
      }
      setResults([...testResults])
    }

    runTests()
  }, [])

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', fontFamily: 'monospace' }}>
      <h1>BountyLab API Direct Test</h1>
      <p style={{ color: '#666' }}>Testing API connectivity without going through the Proxy</p>
      
      <div style={{ marginTop: '2rem' }}>
        {results.map((result, idx) => (
          <div 
            key={idx}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: result.status === 'error' ? '#ffe0e0' : result.status === 'success' ? '#e0ffe0' : '#e0e0ff',
              border: `2px solid ${result.status === 'error' ? '#ff0000' : result.status === 'success' ? '#00aa00' : '#0000ff'}`,
              borderRadius: '4px'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '0.5rem' }}>
              {result.status === 'error' ? '❌' : result.status === 'success' ? '✅' : '⏳'} {result.step}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>{result.message}</div>
            {result.details && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontStyle: 'italic' }}>Details</summary>
                <pre style={{ background: '#f0f0f0', padding: '0.5rem', marginTop: '0.5rem', overflow: 'auto' }}>
                  {JSON.stringify(result.details, (key, value) => {
                    if (value instanceof Error) return value.message
                    return value
                  }, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
