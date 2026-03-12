import React, { useEffect } from 'react'

export function QuickTest() {
  useEffect(() => {
    // Just log everything to the console for the user to see
    console.log('\n' + '='.repeat(70))
    console.log('🧪 QUICK TEST STARTED')
    console.log('='.repeat(70))
    
    // Step 1: Check env
    const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY
    console.log('✓ Step 1: Check environment')
    console.log('  API_KEY found?', !!apiKey)
    console.log('  API_KEY prefix:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT FOUND')
    
    // Step 2: Try to use bountylabClient
    console.log('✓ Step 2: Import and use bountylabClient')
    import('@/api/bountylabClient').then(module => {
      console.log('  Module imported successfully')
      const { bountylabClient } = module
      console.log('  bountylabClient type:', typeof bountylabClient)
      
      // Step 3: Try the search
      console.log('✓ Step 3: Attempt search')
      bountylabClient.searchDevelopers('javascript', undefined, 1, 1).then((result) => {
        console.log('  ✅ SEARCH SUCCESSFUL!')
        console.log('  Result:', { itemCount: result.items.length, total: result.total, pages: result.total_pages })
      }).catch((error) => {
        console.error('  ❌ SEARCH FAILED!')
        console.error('  Error:', error instanceof Error ? error.message : String(error))
      })
    }).catch((error) => {
      console.error('  ❌ Import failed!')
      console.error('  Error:', error.message)
    })
    
    console.log('='.repeat(70) + '\n')
  }, [])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Quick Test</h1>
      <p>Check the browser console (F12) for detailed test output</p>
      <p style={{ marginTop: '2rem', color: '#666', fontSize: '14px' }}>
        This page demonstrates if the SDK can be imported and used correctly.
      </p>
    </div>
  )
}
