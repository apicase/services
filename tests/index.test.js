const { ApiTree } = require('../index.cjs.js')
const fetch = require('@apicase/adapter-fetch')

console.log(
  new ApiTree(fetch, [
    { name: 'hello', url: 'test' },
    { name: 'helloAgain', url: 'kek' }
  ])
)
