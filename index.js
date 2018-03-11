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
