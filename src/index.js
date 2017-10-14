// @flow
import * as Types from './types'

export default (Apicase: Types.Apicase): void => {

  // It doesn't let you use service names
  // that can cause unexpected behaviour
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

  // Reducer that will merge two containers in one
  const containersReducer: Types.reduceContainersType = (accum, service) =>
    safeAssign(accum, service)

  // Create container from object
  const createContainer: Types.createContainerType = ({ name, children = [], ...service}) => {
    let root = Apicase.of(service)
    children.forEach((s: Types.config) => {
      const obj = { ...s }
      if (
        typeof obj.url === 'string' &&
        !obj.url.startsWith('/') &&
        typeof service.url === 'string'
      ) {
        obj.url = `${service.url}/${obj.url}`
      }
      root = safeAssign(root, createContainer(obj))
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

  Apicase.container = createContainerFromAny

}
