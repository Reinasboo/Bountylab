/**
 * Direct API test from Node.js environment
 * Tests SDK functionality with actual API calls
 */

import fs from 'fs'
import path from 'path'

// Read .env file manually
const envPath = path.join(process.cwd(), '.env')
let apiKey = ''

try {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/VITE_BOUNTYLAB_API_KEY=(.+)/)
  if (match) {
    apiKey = match[1].trim()
  }
} catch (error) {
  console.error('Failed to read .env:', error.message)
}

// Import SDK
import Bountylab from '@bountylab/bountylab'

console.log('\n🧪 BountyLab SDK Test')
console.log('=====================================')
console.log('API Key:', {
  present: !!apiKey,
  length: apiKey?.length,
  prefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
})

if (!apiKey) {
  console.error('\n❌ Error: API key not found')
  process.exit(1)
}

// Initialize SDK
console.log('\n📦 Initializing Bountylab SDK...')
const client = new Bountylab({ apiKey })

console.log('Client initialized:', {
  type: typeof client,
  hasSearchUsers: !!client.searchUsers,
  hasRawUsers: !!client.rawUsers,
})

// Test 1: Raw endpoint
console.log('\n\n📍 Test 1: Raw Endpoint (byLogin)')
console.log('-------------------------------------')
try {
  const response = await client.rawUsers.byLogin({ logins: ['torvalds'] })
  console.log('✅ SUCCESS - Response:', {
    found: response.count,
    users: response.users?.length,
    firstUser: response.users?.[0] ? {
      id: response.users[0].id,
      login: response.users[0].login,
      displayName: response.users[0].displayName,
      company: response.users[0].company,
      location: response.users[0].location,
    } : null,
  })
} catch (error) {
  console.error('❌ FAILED:', {
    message: error.message,
    status: error.status,
    code: error.code,
  })
}

// Test 2: Search endpoint
console.log('\n\n🔍 Test 2: Search Endpoint')
console.log('-------------------------------------')
try {
  const response = await client.searchUsers.search({
    query: 'javascript',
    maxResults: 3,
  })
  console.log('✅ SUCCESS - Response:', {
    found: response.count,
    users: response.users?.length,
    firstUser: response.users?.[0] ? {
      id: response.users[0].id,
      login: response.users[0].login,
      displayName: response.users[0].displayName,
      score: response.users[0].score,
    } : null,
  })
} catch (error) {
  console.error('❌ FAILED:', {
    message: error.message,
    status: error.status,
    code: error.code,
  })
}