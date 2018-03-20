import { omit } from 'nanoutils'
import { ApiService } from '@apicase/core'

const getOpts = omit(['name', 'on', 'children'])

export const ApiTree = function(base, items) {
  this.items = items.reduce((res, item) => {
    const next = base instanceof ApiService ? base.extend(getOpts(item)) : new ApiService(base, getOpts(item))

    if (item.on) {
      Object.entries(item.on).forEach(evt => next.on(evt[0], evt[1]))
    }
    Object.assign(res, { [item.name]: next })
    if (item.children) {
      Object.assign(res, ApiTree(next, item.children))
    }
    return res
  }, {})

  return name => this.items[name]
}

const generateRestItem = {
  getAll: name => ({ name: `${name}GetAll`, url: '', method: 'GET' }),
  create: name => ({ name: `${name}Create`, url: '', method: 'POST' }),
  getOne: name => ({ name: `${name}GetOne`, url: ':id', method: 'GET' }),
  updOne: name => ({ name: `${name}UpdOne`, url: ':id', method: 'UPDATE' }),
  rmvOne: name => ({ name: `${name}RmvOne`, url: ':id', method: 'DELETE' })
}

const defaultRest = Object.keys(generateRestItem)

export const rest = (name, payload = defaultRest) =>
  Array.isArray(payload) ? payload.map(key => generateRestItem[key](name)) : Object.entries(payload).map(item => Object.assign(generateRestItem[item[0]](name), item[1]))

export const wrappedRest = (name, payload = defaultRest) => ({
  url: name,
  children: rest(name, payload)
})
