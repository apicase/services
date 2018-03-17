import { omit } from 'nanoutils'
import { ApiService } from '@apicase/core'

const getOpts = omit(['name', 'on', 'children'])

const createTree = (adapter, items, parent) => {
  return items.reduce((res, item) => {
    const next = parent
      ? parent.extend(getOpts(item))
      : new ApiService(adapter, getOpts(item))
    if (item.on) {
      Object.entries(item.on).forEach(evt => next.on(evt[0], evt[1]))
    }
    Object.assign(res, { [item.name]: next })
    if (item.children) {
      Object.assign(res, createTree(adapter, item.children, next))
    }
    return res
  }, {})
}

export const ApiTree = (adapter, items) => {
  return createTree(adapter, items)
}

const generateRestItem = {
  getAll: name => ({ name, url: '', method: 'GET' }),
  create: name => ({ name, url: '', method: 'POST' }),
  getOne: name => ({ name, url: ':id', method: 'GET' }),
  updOne: name => ({ name, url: ':id', method: 'UPDATE' }),
  rmvOne: name => ({ name, url: ':id', method: 'DELETE' })
}

export const rest = (name, payload) =>
  Array.isArray(payload)
    ? payload.map(key => generateRestItem[key](name))
    : Object.entries(payload).map(item =>
      Object.assign(generateRestItem[item[0]](name), item[1])
    )
