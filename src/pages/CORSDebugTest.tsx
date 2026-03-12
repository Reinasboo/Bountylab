import React, { useEffect, useState } from 'react'

interface CORSTest {
  step: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

export function CORSDebugTest() {
  const [tests, setTests] = useState<CORSTest[]>([])

  useEffect(() => {
    const runTests = async () => {
      const testResults: CORSTest[] = []

      // Test 1: Check API key
      const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY
      testResults.push({
        step: '1. Environment Check',
        status: apiKey ? 'success' : 'error',
        message: apiKey ? '✅ API key found' : '❌ API key missing',
        details: { apiKey: apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT FOUND' }
      })
      setTests([...testResults])

      if (!apiKey) return

      // Test 2: Check API endpoint with HEAD request
      testResults.push({
        step: '2. API Endpoint Reachability',
        status: 'pending',
        message: 'Testing if api.bountylab.io is reachable...'
      })
      setTests([...testResults])

      try {
        const headResponse = await fetch('https://api.bountylab.io/', {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        })
        testResults[1] = {
          step: '2. API Endpoint Reachability',
          status: 'success',
          message: `✅ API is reachable (${headResponse.status})`,
          details: { status: headResponse.status }
        }
      } catch (error) {
        testResults[1] = {
          step: '2. API Endpoint Reachability',
          status: 'error',
          message: `❌ Cannot reach API`,
          details: {
            error: error instanceof Error ? error.message : String(error),
            errorType: error?.constructor?.name
          }
        }
      }
      setTests([...testResults])

      // Test 3: Check CORS with OPTIONS request
      testResults.push({
        step: '3. CORS Preflight (OPTIONS)',
        status: 'pending',
        message: 'Checking CORS headers with OPTIONS request...'
      })
      setTests([...testResults])

      try {
        const optionsResponse = await fetch('https://api.bountylab.io/search/users', {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        })
        
        const corsHeaders = {
          'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers'),
        }

        testResults[2] = {
          step: '3. CORS Preflight (OPTIONS)',
          status: corsHeaders['Access-Control-Allow-Origin'] ? 'success' : 'error',
          message: corsHeaders['Access-Control-Allow-Origin'] ? '✅ CORS headers present' : '❌ No CORS headers',
          details: corsHeaders
        }
      } catch (error) {
        testResults[2] = {
          step: '3. CORS Preflight (OPTIONS)',
          status: 'error',
          message: `❌ OPTIONS request failed`,
          details: {
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
      setTests([...testResults])

      // Test 4: Try actual search with detailed error
      testResults.push({
        step: '4. Search Request with Details',
        status: 'pending',
        message: 'Attempting POST to /search/users...'
      })
      setTests([...testResults])

      try {
        const searchResponse = await fetch('https://api.bountylab.io/search/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: 'javascript', maxResults: 1 })
        })

        const searchData = await searchResponse.json().catch(() => ({}))

        testResults[3] = {
          step: '4. Search Request with Details',
          status: searchResponse.ok ? 'success' : 'error',
          message: searchResponse.ok ? `✅ Search successful (${searchResponse.status})` : `❌ Search failed (${searchResponse.status})`,
          details: {
            status: searchResponse.status,
            statusText: searchResponse.statusText,
            response: searchData,
            headers: {
              'content-type': searchResponse.headers.get('Content-Type'),
              'access-control-allow-origin': searchResponse.headers.get('Access-Control-Allow-Origin')
            }
          }
        }
      } catch (error) {
        testResults[3] = {
          step: '4. Search Request with Details',
          status: 'error',
          message: `❌ Search request threw error`,
          details: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          }
        }
      }
      setTests([...testResults])
    }

    runTests()
  }, [])

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
      <h1>🔍 CORS & API Connectivity Debug</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This test helps diagnose why the browser cannot reach the BountyLab API
      </p>

      {tests.map((test, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: test.status === 'error' ? '#ffcccc' : test.status === 'success' ? '#ccffcc' : '#ccccff',
            border: `2px solid ${test.status === 'error' ? '#ff0000' : test.status === 'success' ? '#00aa00' : '#0000ff'}`,
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '16px' }}>
            {test.status === 'error' ? '❌' : test.status === 'success' ? '✅' : '⏳'} {test.step}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>{test.message}</div>
          {test.details && (
            <details style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
              <summary>Show Details</summary>
              <pre style={{
                background: '#f0f0f0',
                padding: '1rem',
                marginTop: '0.5rem',
                overflow: 'auto',
                borderRadius: '4px',
                maxHeight: '300px'
              }}>
                {JSON.stringify(test.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#fffacc',
        border: '2px solid #ffaa00',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <strong>💡 Common Solutions:</strong>
        <ul style={{ marginTop: '1rem', marginBottom: 0 }}>
          <li>If CORS headers are missing: The API needs to enable CORS for browser requests</li>
          <li>If "Failed to fetch": Check if browser Network tab shows blocked CORS request</li>
          <li>If endpoint unreachable: API may only be accessible from backend/server</li>
          <li>Check if there's a different endpoint for browser clients (with CORS enabled)</li>
          <li>Consider using a backend proxy to forward API requests</li>
        </ul>
      </div>
    </div>
  )
}
