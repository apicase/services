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

Apicase.install(ApicaseServices)
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
    { name: 'getPosts', url: '',            method: 'GET' },
    { name: 'getById',  url: ':id',         method: 'GET' },
    { name: 'comment',  url: ':id/comment', method: 'POST' },
    { name: 'create',   url: '',            method: 'POST' }
  ]
})

// Equal with
const api = {
  posts: {
    ...Apicase.of({ url: '/api/posts', method: 'GET' }),
    getPosts: Apicase.of({ url: '/api/posts', method: 'GET' }),
    getById: Apicase.of({ url: '/api/posts/:id', method: 'GET' }),
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

### Inheritance
You can also use `Apicase.container` after `Apicase.of`. All mixins will be passed to all services

```javascript
const uploader = Apicase.of({ adapter: 'xhr', method: 'POST' })

const uploaders = uploader.container([
  { name: 'avatar',      url: '/my/avatar' },
  { name: 'postPicture', url: '/post/:id/picture' }
])

// Equal with
const uploaders = {
  avatar: Apicase.of({ adapter: 'xhr', url: '/my/avatar', method: 'POST' }),
  postPicture: Apicase.of({ adapter: 'xhr', url: '/post/:id/picture', method: 'POST' })
}
```

## License
MIT © [Anton Kosykh](https://github.com/kelin2025)
