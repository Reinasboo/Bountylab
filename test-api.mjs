// Quick test of BountyLab SDK
import Bountylab from '@bountylab/bountylab'

const apiKey = 'gMolfPrnxsbeTBJQGfydcAilRkNYHwyHxBalifYjITEaUJieRABauFICmIAYGtbj'

async function test() {
  try {
    console.log('Initializing Bountylab SDK...')
    const client = new Bountylab({ apiKey })
    
    console.log('\n1. Testing rawUsers.byLogin:')
    const userResult = await client.rawUsers.byLogin({
      logins: ['torvalds']
    })
    console.log('Response:', JSON.stringify(userResult, null, 2))
    
    console.log('\n2. Testing searchUsers.search:')
    const searchResult = await client.searchUsers.search({
      query: 'javascript',
      maxResults: 5
    })
    console.log('Response:', JSON.stringify(searchResult, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Full error:', error)
  }
}

test()
