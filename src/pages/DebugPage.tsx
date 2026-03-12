import React, { useEffect, useState } from 'react'

interface DebugInfo {
  apiKeyEnv: string
  apiKeyLength: number
  apiKeyPrefix: string
  sdkImported: boolean
  sdkInstantiated: boolean
  sdkMethods: string[]
  error: string | null
}

export function DebugPage() {
  const [debug, setDebug] = useState<DebugInfo>({
    apiKeyEnv: 'checking...',
    apiKeyLength: 0,
    apiKeyPrefix: '',
    sdkImported: false,
    sdkInstantiated: false,
    sdkMethods: [],
    error: null,
  })

  useEffect(() => {
    const runDebug = async () => {
      try {
        // 1. Check environment
        const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY
        
        // 2. Import SDK
        const module = await import('@bountylab/bountylab')
        const Bountylab = module.default
        
        // 3. Create instance
        const client = new Bountylab({ apiKey: apiKey || '' })
        
        // 4. Check methods
        const methods = []
        if (client.searchUsers?.search) methods.push('searchUsers.search')
        if (client.rawUsers?.byLogin) methods.push('rawUsers.byLogin')
        if (client.searchRepos?.search) methods.push('searchRepos.search')
        
        setDebug({
          apiKeyEnv: apiKey ? 'Set' : 'Not Set',
          apiKeyLength: apiKey?.length || 0,
          apiKeyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : '',
          sdkImported: true,
          sdkInstantiated: !!client,
          sdkMethods: methods,
          error: null,
        })
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        setDebug((prev) => ({
          ...prev,
          error: msg,
        }))
      }
    }
    
    runDebug()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#f5f5f5', minHeight: '100vh' } as React.CSSProperties}>
      <h1>SDK Debug Information</h1>
      
      <section style={{ marginTop: '2rem', padding: '1rem', background: '#fff', border: '1px solid #ccc' } as React.CSSProperties}>
        <h2>Environment</h2>
        <p>API Key Env: <strong>{debug.apiKeyEnv}</strong></p>
        <p>API Key Length: <strong>{debug.apiKeyLength}</strong></p>
        <p>API Key Prefix: <strong>{debug.apiKeyPrefix}</strong></p>
      </section>
      
      <section style={{ marginTop: '2rem', padding: '1rem', background: '#fff', border: '1px solid #ccc' } as React.CSSProperties}>
        <h2>SDK Status</h2>
        <p>SDK Imported: <strong style={{ color: debug.sdkImported ? 'green' : 'red' } as React.CSSProperties}>
          {debug.sdkImported ? 'Yes' : 'No'}
        </strong></p>
        <p>SDK Instantiated: <strong style={{ color: debug.sdkInstantiated ? 'green' : 'red' } as React.CSSProperties}>
          {debug.sdkInstantiated ? 'Yes' : 'No'}
        </strong></p>
        <p>Methods Available: <strong>{debug.sdkMethods.join(', ') || 'None'}</strong></p>
      </section>
      
      {debug.error && (
        <section style={{ marginTop: '2rem', padding: '1rem', background: '#ffe0e0', border: '2px solid #ff0000' } as React.CSSProperties}>
          <h2 style={{ color: '#ff0000' }}>Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' } as React.CSSProperties}>{debug.error}</pre>
        </section>
      )}
    </div>
  )
}
