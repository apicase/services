import { omit, clone, equals } from 'nanoutils'
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
  this._listeners = {}
  this.queue = []

  const addCall = payload => {
    const call = apicase(payload.adapter)(payload).on('finish', () => {
      this.queue.splice(this.queue.indexOf(call), 1)
    })
    Object.keys(this._listeners).forEach(evt => {
      this._listeners[evt].forEach(cb => {
        call.on(evt, cb)
      })
    })
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
   * Create global listeners
   * @param {String} evt Event name
   * @param {Function} callback Callback
   */
  this.on = function(evt, callback) {
    this._listeners[evt] = (this._listeners[evt] || []).concat(callback)
    return this
  }

  /**
   * Remove global listeners
   * @param {String} evt Event name
   * @param {Function} callback Callback
   */
  this.off = function(evt, callback) {
    if (!this._listeners[evt]) return this
    const idx = this._listeners[evt].indexOf(callback)
    if (idx > -1) this._listeners[evt].splice(idx, 1)
    return this
  }

  /**
   * Create a new extended service
   * @param {Object} newOptions Options object to merge with service options
   */
  this.extend = function(newOptions) {
    const service = new ApiService(this._opts.concat(newOptions))
    service._listeners = clone(this._listeners)
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

export const ApiTree = function(base, items) {
  const services = createTree(base, items)
  return getFrom(services)
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
