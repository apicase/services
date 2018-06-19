import EventBus from 'delightful-bus'
import { omit, equals } from 'nanoutils'
import { apicase, mergeOptions, normalizeOptions } from '@apicase/core'

const getOpts = omit(['name', 'on', 'children'])

/**
 * Create a new service
 * @param {Array} options Array of options
 */
export function ApiService(options) {
  this._isApiService = true
  this._opts = (Array.isArray(options) ? options : [options]).map(opt =>
    normalizeOptions(opt)
  )
  this.queue = []

  const bus = new EventBus()

  bus.injectObserverTo(this)

  const addCall = payload => {
    const call = apicase(payload.adapter)(payload).once('finish', () => {
      this.queue.splice(this.queue.indexOf(call), 1)
    })
    bus.sendTo(call)
    this.queue.push(call)
    return call
  }

  const getOpts = opts => mergeOptions(this._opts.concat(opts))

  /**
   * Modifies service instance
   * @param {Function} callback Callback that accepts service and modifies it
   */
  this.use = function(callback) {
    return callback(this.extend())
  }

  /**
   * Create a new extended service
   * @param {Object} newOptions Options object to merge with service options
   */
  this.extend = function(newOptions) {
    const service = new ApiService(this._opts.concat(newOptions))
    bus.sendTo(service)
    return service
  }

  /**
   * Do service request
   * @param {Object} options Options object to merge with service options
   */
  this.doRequest = function(options) {
    return addCall(getOpts(options))
  }

  /**
   * Create service request that will be called after the last request is done
   * @param {Object} options Options object to merge with service options
   */
  this.pushRequest = function(options) {
    if (!this.queue.length) return addCall(options)
    const withHook = {
      hooks: {
        before: ({ payload, next }) => {
          this.queue[this.queue.length - 1]
            .on('finish', () => next(payload))
            .on('cancel', () => next(payload))
        }
      }
    }
    const mergedOpts = mergeOptions([withHook, options])
    return addCall(getOpts(mergedOpts))
  }

  /**
   * Creates a request unless queue is empty.
   * Otherwise, returns the first request of the queue
   * @param {Object} options Options object to merge with service options
   */
  this.doSingleRequest = function(options) {
    return this.queue[0] ? this.queue[0] : this.doRequest(options)
  }

  /**
   * Creates a request unless queue has the same request
   * Otherwise, returns this request
   * @param {Object} options Options object to merge with service options
   */
  this.doUniqueRequest = function(options) {
    const req = getOpts(options)
    const idx = this.queue.findIndex(i => equals(i.payload, req.payload))
    return idx > -1 ? this.queue[idx] : addCall(req)
  }
}

/**
 *
 * @param {ApiService|{}} base Base service
 * @param {Array} items Array of services
 */
const createTree = (base, items) =>
  items.reduce((res, item) => {
    const opts = getOpts(item)
    if (!(base instanceof ApiService)) {
      opts.adapter = base
    }
    const next =
      base instanceof ApiService ? base.extend(opts) : new ApiService(opts)

    if (item.on) {
      Object.keys(item.on).forEach(evt => next.on(evt, item.on[evt]))
    }
    Object.assign(res, { [item.name]: next })
    if (item.children) {
      Object.assign(res, createTree(next, item.children))
    }
    return res
  }, {})

const getFrom = services => {
  const get = (name, payload) =>
    payload !== undefined ? services[name].doRequest(payload) : services[name]

  get.extend = by => {
    return getFrom(services.map(service => service.extend(by)))
  }

  return get
}

/**
 * Accepts array of services and returns a function where 1st arg is a service name and 2nd one is payload
 */
export const ApiTree = function(base, items) {
  const services = createTree(base, items)
  return getFrom(services)
}

const createObjectTree = (base, items) =>
  Object.keys(items).reduce((res, key) => {
    res[key] =
      base instanceof ApiService
        ? base.extend(items[key])
        : new ApiService(items[key])
    return res
  }, {})

/**
 * Returns an object where key is a service name and values are services
 */
export const ApiObjectTree = function(base, items) {
  return createObjectTree(base, items)
}

const generateRestItem = {
  getAll: name => ({ name: `${name}GetAll`, url: '', method: 'GET' }),
  create: name => ({ name: `${name}Create`, url: '', method: 'POST' }),
  getOne: name => ({ name: `${name}GetOne`, url: ':id', method: 'GET' }),
  updOne: name => ({ name: `${name}UpdOne`, url: ':id', method: 'UPDATE' }),
  rmvOne: name => ({ name: `${name}RmvOne`, url: ':id', method: 'DELETE' })
}

const defaultRest = Object.keys(generateRestItem)

export const rest = (name, payload = defaultRest) =>
  Array.isArray(payload)
    ? payload.map(key => generateRestItem[key](name))
    : Object.keys(payload).map(key =>
      Object.assign(generateRestItem[key](name), payload[key])
    )

export const wrappedRest = (name, payload = defaultRest) => ({
  url: name,
  children: rest(name, payload)
})
