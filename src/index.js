// @flow
import * as Types from './types'

export default (Apicase: Types.Apicase): void => {

  const createContainer: Types.createContainerType = ({ name, children = [], ...service}) => {
    let root = Apicase.of(service)
    children.forEach((s: Types.config) => {
      root = Object.assign({}, root, createContainer(s))
    })
    return { [name]: root }
  }
  const containersReducer: Types.reduceContainersType = (accum, service) =>
    Object.assign(accum, service)

  const createContainerFromAny: Types.createContainerFromAnyType = config =>
    !Array.isArray(config)
      ? createContainer(config)
      : config
        .map(s => createContainer(s))
        .reduce(containersReducer)

  Apicase.container = createContainerFromAny

}
