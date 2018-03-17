## Apicase services

Create Apicase services tre with one JSON object

## Installation

```
yarn add @apicase/services
npm install @apicase/services
```

## Usage

```javascript
import { ApiTree } from '@apicase/services'

const api = new ApiTree([
  { url: '/api', children: [
    { url: 'posts', children: [
      { name: 'getAllPosts',   url: '',    method: 'GET'    },
      { name: 'createPost',    url: '',    method: 'POST'   },
      { name: 'getOnePost',    url: ':id', method: 'GET'    },
      { name: 'updateOnePost', url: ':id', method: 'PUT'    },
      { name: 'removeOnePost', url: ':id', method: 'REMOVE' }
    ] },
    { url: 'profile', children: [...] }
  ] }
])

api('getAllPosts').doRequest()
api('createPost').doRequest({ body })
```

## Parent service

You can also pass parent service instead of adapter. It may flatten structure

```javascript
const Root = new ApiService(fetch, { url: '/api' })

const api = new ApiTree(Root, [
  { url: 'posts', children: [
    { name: 'getAllPosts',   url: '',    method: 'GET'    },
    { name: 'createPost',    url: '',    method: 'POST'   },
    { name: 'getOnePost',    url: ':id', method: 'GET'    },
    { name: 'updateOnePost', url: ':id', method: 'PUT'    },
    { name: 'removeOnePost', url: ':id', method: 'REMOVE' }
  ] },
  { url: 'profile', children: [...] }
])
```

## `rest` and `wrappedRest` helpers

Helper to work with REST APIs just automatically generates urls, methods and names

```javascript
import { ApiTree, rest } from '@apicase/services'

/*
  If you are lucky - default structure doesn't need to write URL's
  postsGetAll: GET    /
  postsGetOne: GET    /:id
  postsCreate: POST   /
  postsUpdOne: PUT    /:id
  postsRmvOne: DELETE /:id
*/
const posts = rest('posts', ['getAll', 'getOne', 'create', 'updOne', 'rmvOne'])

/* Skip 2nd argument to get just all routes */
const posts = rest('posts')

/* Otherwise, still OK */
const profile = rest('profile', {
  getAll: { url: 'we/have' },
  create: { url: 'custom/routes' },
  getOne: { url: 'no_refactoring/:id' },
  updOne: { url: 'since_2008/:id' },
  rmvOne: { url: 'legacy_shit' }
})

new ApiTree(Root, [
  { url: 'posts', children: posts },
  { url: 'profile', children: profile }
])
```

`wrappedRest` helper is similar to `rest` but also wraps it into url with name:

```javascript
new ServicesTree(Root, [...rest('posts'), ...rest('profile')])
```

## License

MIT © [**Anton Kosykh**](https://github.com/kelin2025)
