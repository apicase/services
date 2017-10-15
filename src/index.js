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
  const createContainer: Types.createContainerType = ({ name, children = [], ...service }, parent = undefined) => {
    const config = [stackUrl, ...prepare].reduce((c, callback) => callback(c, parent), { name, children, ...service })
    let root = Apicase.of(config)
    children.forEach((s: Types.config) => {
      root = safeAssign(root, createContainer(s, config))
    })
    return { [name]: root }
  }

  // Like createContainer, but also accepts array of services
  const createContainerFromAny: Types.createContainerFromAnyType = config =>
    !Array.isArray(config)
      ? createContainer(config)
      : config
        .map(s => createContainer(s))
        .reduce(containersReducer)

  console.log(createContainerFromAny({
    name: 'root',
    url: 'test',
    children: [
      { name: 'hello', url: 'hello' }
    ]
  }))

  Apicase.container = createContainerFromAny

}

export default ApicaseServices
