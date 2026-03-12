import { useEffect } from 'react'

export function SDKDebugPanel() {
  useEffect(() => {
    // Immediately log the environment
    console.log('='.repeat(70))
    console.log('🧪 SDK DEBUG PANEL MOUNTED')
    console.log('='.repeat(70))
    
    // Check environment variables
    const apiKey = import.meta.env.VITE_BOUNTYLAB_API_KEY
    console.log('1. VITE_BOUNTYLAB_API_KEY available?', apiKey ? 'YES ✅' : 'NO ❌')
    if (apiKey) {
      console.log('   - Length:', apiKey.length)
      console.log('   - Prefix:', apiKey.substring(0, 20) + '...')
    }
    
    // Try to import and instantiate SDK
    console.log('2. Attempting to import @bountylab/bountylab SDK...')
    import('@bountylab/bountylab').then((module) => {
      console.log('   - Import successful ✅')
      
      const Bountylab = module.default
      console.log('3. Creating Bountylab instance...')
      
      try {
        if (!apiKey) {
          throw new Error('API_KEY is not available')
        }
        
        const client = new Bountylab({ apiKey })
        console.log('   - Instance created ✅')
        console.log('4. Checking methods:')
        console.log('   - client.searchUsers exists?', !!client.searchUsers ? 'YES ✅' : 'NO ❌')
        console.log('   - client.searchUsers.search exists?', !!client.searchUsers?.search ? 'YES ✅' : 'NO ❌')
        
        if (client.searchUsers?.search) {
          console.log('5. Attempting test search with "javascript"...')
          client.searchUsers.search({
            query: 'javascript',
            maxResults: 1,
          }).then((result) => {
            console.log('   - TEST SEARCH SUCCESSFUL ✅')
            console.log('   - Found', result.count, 'total users')
            console.log('   - Returned', result.users?.length || 0, 'users in this request')
            console.log('   - First user:', result.users?.[0])
          }).catch((error) => {
            console.error('   - TEST SEARCH FAILED ❌')
            console.error('   - Error:', error.message)
            console.error('   - Full error:', error)
          })
        } else {
          console.error('   - searchUsers.search not available, cannot test')
        }
      } catch (error) {
        console.error('   - Error creating instance ❌')
        console.error('   - Error:', error instanceof Error ? error.message : String(error))
      }
    }).catch((error) => {
      console.error('   - Import failed ❌')
      console.error('   - Error:', error)
    })
    
    console.log('='.repeat(70))
  }, [])

  return null
}
