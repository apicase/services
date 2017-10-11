// @flow
import * as Types from './types'
import { merge, assocPath } from 'ramda'

export default (Apicase: Object): void => {

  const createService: Types.createService = ({ name, children = [], ...service }, path = []) => merge(
    assocPath([...path, name], Apicase.of(service), {}),
    ...children.map(s => createService(s, [...path, name]))
  )

  const container: Types.apicaseContainer = config =>
    Array.isArray(config)
      ? merge(...config.map(s => createService(s)))
      : createService(config)

  Apicase.container = container

}
