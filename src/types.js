// @flow

export type Hook = (ctx: Object, next: Function) => void

export type HooksObject = {
  [hookType: string]: Hook[]
}

export type Config = {
  name: string,
  children?: Config[],
  hooks?: HooksObject
}

export type Container = { }

export type createService = (config: Config, path?: string[]) => Container

export type apicaseContainer = (config: Config | Config[]) => Container
