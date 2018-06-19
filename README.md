## Apicase services

Powerful API layer based on `@apicase/core`

## Full documentation

[**Quick start with Apicase**](https://kelin2025.gitbooks.io/apicase/content/getting-started/basic-ideas.html)  
[**Apicase services**](https://kelin2025.gitbooks.io/apicase/content/anatomy/services.html)

## Installation

```
yarn add @apicase/services
npm install @apicase/services
```

## Create service

```javascript
import fetch from '@apicase/adapter-fetch'
import { ApiService } from '@apicase/services'

const SomeService = new ApiService({
  adapter: fetch,
  url: '/api/posts'
  method: 'GET'
})

// { "url": "/api/posts", "method": "GET", "query": { "userId": 1 } }
SomeService.doRequest({
  query: { userId: 1 }
})
```

## ApiTree

To reduce boilerplate code, you can declare your services as JSON object

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

## Shorter requests

```javascript
api("someService", payload) === api("someService").doRequest(payload)
```

## ApiObjectTree helper

Alternative way to avoid _string_ api (but there are no `children` option):

```js
import { ApiObjectTree } from '@apicase/services'

const api = new ApiTree(BaseService, {
  getAllPosts: { url: '' },
  createPost:  { url: '',    method: 'POST' },
  getOnePost:  { url: ':id', method: 'POST' },
  updOnePost:  { url: ':id', method: 'PUT' },
  rmvOnePost:  { url: ':id', method: 'DELETE' }
})

api.getAllPosts.doRequest()
api.createPost.doRequest({ body })
```

## `rest` and `wrappedRest` helpers

Helper to work with REST APIs just automatically generates urls, methods and names

```javascript
import { ApiTree, rest } from "@apicase/services"

/*
  If you are lucky - default structure doesn't need to write URL's
  postsGetAll: GET    /
  postsGetOne: GET    /:id
  postsCreate: POST   /
  postsUpdOne: PUT    /:id
  postsRmvOne: DELETE /:id
*/
const posts = rest("posts", ["getAll", "getOne", "create", "updOne", "rmvOne"])

/* Skip 2nd argument to get just all routes */
const posts = rest("posts")

/* Otherwise, still OK */
const profile = rest("profile", {
  getAll: { url: "we/have" },
  create: { url: "custom/routes" },
  getOne: { url: "no_refactoring/:id" },
  updOne: { url: "since_2008/:id" },
  rmvOne: { url: "legacy_shit" }
})

new ApiTree(Root, [
  { url: "posts", children: posts },
  { url: "profile", children: profile }
])
```

`wrappedRest` helper is similar to `rest` but also wraps it into url with name:

```javascript
import { ApiTree, wrappedRest } from "@apicase/services"

new ApiTree(Root, [wrappedRest("posts"), wrappedRest("profile")])
```

## License

MIT © [**Anton Kosykh**](https://github.com/kelin2025)
