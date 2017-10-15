// @flow
export type safeAssign = (to: Object, from: Object) => Object

export type Hook = (ctx: Object, next: Function) => void

export type HooksObject = {
  [hookType: string]: Hook[]
}

export type UnnormalizedHooksObject = {
  [hookType: string]: Hook | Hook[]
}

export type EventName = 'before' | 'start' | 'success' | 'error' | 'finish' | 'preinstall' | 'postinstall'

export type AllOptions = {
  adapter?: string,
  hooks?: UnnormalizedHooksObject,
  [string]: any
}

export type Config = {
  name: string,
  children?: Config[]
} & AllOptions

// TODO: Fix issue with container type
// It should be a returned value of Apicase + nested Apicase's in
export type config = { name: string, children?: config[], [option: string]: any }

export type container = { [name: string]: Apicase }

export type createContainerType = (config: config, parent: config | void) => container

export type reduceContainersType = (accum: container, service: container) => container

export type createContainerFromAnyType = (config: config | config[]) => container

export type prepareCallback = (child: config, parent: config | void) => config

export type needStack = (child: config, parent: config | void) => boolean

export type Adapter<Options> = (query: {
  options: Options,
  done: (data: mixed) => void,
  fail: (reason: mixed) => void,
  another: (hookType: string, data: mixed, reject?: boolean) => void
}) => void

export type PluginOptions = {
  prepare?: (child: Config, parent: Config) => Config
}

export type Plugin<T> = (Apicase: Apicase, options: T) => void

export type Apicase = {
  base: {
    query: Object,
    hooks: HooksObject
  },
  options: {
    defaultAdapter: string
  },
  adapters: {
    [adapterName: string]: Adapter<Object>
  },
  use: (adapterName: string, adapter: Adapter<Object>) => void,
  call: (options: AllOptions) => Promise<mixed>,
  all: (options: AllOptions[]) => Promise<mixed>,
  of: (options: AllOptions) => Apicase,
  install: (installer: Plugin<any>) => void,
  extend: (installer: Plugin<any>) => Apicase,
  on: (event: EventName, callback: (...args: any[]) => void) => void,
  container: (config: config | config[]) => container,
  // For plugins
  [string]: any
}
