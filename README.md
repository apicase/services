## Apicase-services
Simplify create Apicase services by JSON declaration

## What is apicase-services?
It's a small plugin for [apicase-core](https://github.com/apicase/apicase-core) that allows you to declare apicase services tree with one JSON.

## Installation

### 1. Install package from npm/yarn
```npm install apicase-services```

```yarn add apicase-services```

### 2. Install plugin
```javascript
import Apicase from 'apicase-core'
import ApicaseServices from 'apicase-services'

Apicase.use(ApicaseServices)
```

### 3. Be happy :)

## Usage
Apicase-services adds a new method `Apicase.container` that just invokes `Apicase.of` on each nested options object.

It also stacks url from parent services (even if it doesn't start with a `/`)

### Example
```javascript
const api = Apicase.container({
  name: 'posts',
  url: '/api/posts',
  children: [
    { name: 'getPosts', url: '' },
    { name: 'getById',  url: ':id' },
    { name: 'comment',  url: ':id/comment', method: 'POST' },
    { name: 'create',   url: '', method: 'POST' }
  ]
})

// Equal with
const api = {
  posts: {
    ...Apicase.of({ url: '/api/posts' }),
    getPosts: Apicase.of({ url: '/api/posts' }),
    getById: Apicase.of({ url: '/api/posts/:id' }),
    comment: Apicase.of({ url: '/api/posts/:id/comment', method: 'POST' })
    create: Apicase.of({ url: '/api/posts', method: 'POST' }),
  }
}
```

### If root is array
You can also pass an array of services. It will call `Apicase.container` for each of them and merge them into one.
```javascript
const api = Apicase.container([
  { name: 'foo', url: 'lol' },
  { name: 'bar', url: 'baz' }
])

// Equal with
const api = {
  foo: Apicase.of({ url: 'foo' }),
  bar: Apicase.of({ url: 'baz' })
}
```

## License
MIT © [Anton Kosykh](https://github.com/kelin2025)
