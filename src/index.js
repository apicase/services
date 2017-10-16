// @flow
import * as Types from './types'

// Check if
const needStack: Types.needStack = (child, parent) =>
  typeof parent === 'object' &&
  typeof child.url === 'string' &&
  typeof parent.url === 'string' &&
  !child.url.startsWith('/')

// Stack url from with parent services
const stackUrl: Types.prepareCallback = (child, parent) => {
  const url =
    typeof parent === 'object' && needStack(child, parent)
      ? `${parent.url}/${child.url}`
      : child.url
  return { ...child, url }
}

// Deny using service names that can cause unexpected behaviour
const safeAssign: Types.safeAssign = (to, from) => {
  const res = Object.assign({}, to)
  for (const key in from) {
    if (key in res) {
      console.warn(`[APICASE] Warning: key "${key}" already exists in service. Avoid using reserved or parent options keys as service name.`)
    } else {
      res[key] = from[key]
    }
  }
  return res
}

const ApicaseServices: Types.Plugin<Types.PluginOptions> = (Apicase, { prepare = [] } = {}) => {

  // Reducer that will merge two containers in one
  const containersReducer: Types.reduceContainersType = (accum, service) =>
    safeAssign(accum, service)

  // Create container from object
  const createContainer: Types.createContainerType = function (current, parent = undefined) {
    const config = [stackUrl, ...prepare].reduce((c, callback) => callback(c, parent), current)
    const { name, children = [], ...service } = config
    let root = this.of(service)
    children.forEach((s: Types.config) => {
      root = safeAssign(root, createContainer(s, config))
    })
    return { [name]: root }
  }

  // // Like createContainer, but also accepts array of services
  // const createContainerFromAny: Types.createContainerFromAnyType = function (config) {
  //   return !Array.isArray(config)
  //     ? createContainer.bind(this)(config)
  //     : config
  //       .map(s => createContainer.bind(this)(s))
  //       .reduce(containersReducer)
  // }

  Apicase.container = function (config) {
    return !Array.isArray(config)
      ? createContainer.bind(this)(config)
      : config
        .map(s => createContainer.bind(this)(s))
        .reduce(containersReducer)
  }

}

export default ApicaseServices
