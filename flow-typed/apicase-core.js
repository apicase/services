declare module 'apicase-core' {

  // Hooks
  declare type Hook = (ctx: Object, next: Function) => void

  declare type HooksObject = {
    [hookType: string]: Hook[]
  }

  declare type UnnormalizedHooksObject = {
    [hookType: string]: Hook | Hook[]
  }

  // Events
  declare type EventName = 'before' | 'start' | 'success' | 'error' | 'finish' | 'preinstall' | 'postinstall'

  // Options
  declare type AllOptions = {
    adapter?: string,
    hooks?: UnnormalizedHooksObject,
    [string]: any
  }

  // Adapters
  declare type Adapter<Options> = (query: {
    options: Options,
    done: (data: mixed) => void,
    fail: (reason: mixed) => void,
    another: (hookType: string, data: mixed, reject?: boolean) => void
  }) => void

  // Plugins
  declare type Plugin = (instance: Apicase) => void

  // Instance
  declare type Apicase = {
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
    install: (installer: (instance: Apicase) => void) => void,
    extend: (installer: (instance: Apicase) => void) => Apicase,
    on: (event: EventName, callback: (...args: any[]) => void) => void,
    // For plugins
    [string]: any
  }

  declare module.exports: Apicase;
}
