import Bountylab from '@bountylab/bountylab'
import fs from 'fs'

const apiKey = 'gMolfPrnxsbeTBJQGfydcAilRkNYHwyHxBalifYjITEaUJieRABauFICmIAYGtbj'

console.log('\n🔎 INSPECTING SDK v0.40.0 STRUCTURE\n')

const client = new Bountylab({ apiKey })

console.log('1️⃣  CLIENT ROOT PROPERTIES:')
console.log(Object.getOwnPropertyNames(client).sort())

console.log('\n2️⃣  CLIENT METHODS (prototype):')
const proto = Object.getPrototypeOf(client)
console.log(Object.getOwnPropertyNames(proto).filter(p => p !== 'constructor').sort())

console.log('\n3️⃣  CHECKING SEARCH METHODS:')
console.log('  - client.searchUsers:', typeof client.searchUsers)
if (client.searchUsers) {
  console.log('    - searchUsers methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.searchUsers)).filter(p => p !== 'constructor').sort())
}

console.log('\n4️⃣  CHECKING RAW METHODS:')
console.log('  - client.rawUsers:', typeof client.rawUsers)
if (client.rawUsers) {
  console.log('    - rawUsers methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.rawUsers)).filter(p => p !== 'constructor').sort())
}

console.log('\n5️⃣  ALL AVAILABLE METHODS:')
for (const key in client) {
  if (typeof client[key] === 'object') {
    console.log(`  ${key}:`, Object.keys(client[key]).slice(0, 5).join(', '))
  }
}

console.log('\n6️⃣  TESTING searchUsers.search:')
try {
  const result = await client.searchUsers.search({
    query: 'javascript',
    maxResults: 1,
  })
  console.log('✅ SUCCESS:', {
    count: result.count,
    users: result.users?.length,
    keys: Object.keys(result),
  })
} catch (e) {
  console.error('❌ ERROR:', e.message)
}

console.log('\n7️⃣  TESTING rawUsers.byLogin:')
try {
  const result = await client.rawUsers.byLogin({
    logins: ['torvalds'],
  })
  console.log('✅ SUCCESS:', {
    count: result.count,
    users: result.users?.length,
    keys: Object.keys(result),
  })
} catch (e) {
  console.error('❌ ERROR:', e.message)
}
