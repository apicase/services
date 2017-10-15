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

It also stacks url from parent services (even if child doesn't start with a `/`)

### Example
```javascript
const api = Apicase.container({
  name: 'posts',
  url: '/api/posts',
  children: [
    { name: 'getPosts', url: '',            method: 'GET' },
    { name: 'getById',  url: ':id',         method: 'GET' },
    { name: 'comment',  url: ':id/comment', method: 'POST' },
    { name: 'create',   url: '',            method: 'POST' },
    { name: 'root',     url: '/root',       method: 'GET' }
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
    root: Apicase.of({ url: '/root', method: 'GET' })
  }
}
```

### If root is array
You can also pass an array of services.  
It will call `Apicase.container` for each of them and merge them into one.
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
You can also use `Apicase.container` after `Apicase.of`.  
All mixins will be passed to all services

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

## Additional features

### Options preparation `(v0.2+)`
You can prepare your options object before `Apicase.of` call.  
For this you can pass `prepare` option with array of callbacks.  
`prepare` is a queue of functions that accepts options object and returns a new one.  
Here is example of adding strict `/` to the end of url:
```javascript
import Apicase from 'apicase-core'
import ApicaseServices from 'apicase-services'

const services = {
  name: 'root'
  url: '/api',
  children: [
    { name: 'test', url: 'test' },
    { name: 'foobar', url: 'foo/bar' }
  ]
}

const addSlash = child =>
  child.children.length || child.url.endsWith('/')
    ? child
    : { ...child, url: child.url + '/' }

const options = {
  prepare: [addSlash]
}

Apicase.install(ApicaseServices, options)

Apicase.container(services)
/*
  It'll create container with services
  { url: '/api/' }
  { url: '/api/test/' }
  { url: '/api/foo/bar/' }
*/
```
Callbacks also have second argument with `parent` params.  
Since v0.2 path stacking works through this feature and it'll be called before all prepare callbacks.  
Here is path stacking function
```javascript
const needStack = (child, parent) =>
  typeof parent === 'object' &&
  typeof child.url === 'string' &&
  typeof parent.url === 'string' &&
  !child.url.startsWith('/')

const stackUrl = (child, parent) => {
  const url =
    needStack(child, parent)
      ? `${parent.url}/${child.url}`
      : child.url
  return { ...child, url }
}
```

## License
MIT © [Anton Kosykh](https://github.com/kelin2025)
