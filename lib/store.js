import clone from './utils/clone'

function assertAdapter (adapter) {
  if (!adapter || typeof adapter.fetch !== 'function') {
    return Promise.reject(ReferenceError('store missing adapter with a `fetch` method returning a Promise'))
  }
}

export default class Store {
  constructor (opts = {}) {
    this.primaryKey = opts.primaryKey || 'id'
    this.adapter = opts.adapter
    this._registry = {}
    this._data = {}
    this._transforms = [[], []]
  }

  register (type, opts = {}) {
    const data = this._data
    this._registry[type] = opts
    data[type] = data[type] || {}
    return this
  }

  lookup (type) {
    return this._registry[type]
  }

  clear () {
    const data = this._data
    for (let type in data) {
      if (data.hasOwnProperty(type)) {
        data[type] = {}
      }
    }
  }

  get (type, params) {
    const fnc = this._isManyRequest(type, params) ? '_getMany' : '_getByKey'
    return this[fnc](type, params)
  }

  push (type, records) {
    const fnc = Array.isArray(records) ? '_pushMany' : '_pushOne'
    return this[fnc](type, records)
  }

  find (type, params) {
    const fnc = this._isManyRequest(type, params) ? '_findMany' : '_findByKey'
    return this[fnc](type, params)
  }

  fetch (type, params) {
    const fnc = this._isManyRequest(type, params) ? '_fetchMany' : '_fetchByKey'
    return this[fnc](type, params)
  }

  onTransformOne (fnc) {
    this._transforms[0].push(fnc)
  }

  onTransformMany (fnc) {
    this._transforms[1].push(fnc)
  }

  transform (type, data, isMany) {
    const transforms = this._transforms[~~isMany]
    transforms.forEach(fnc => { data = fnc(type, data) })
    return data
  }

  /**
   * Private
   */

  _isManyRequest (type, params) {
    const typeofParams = typeof params
    return typeofParams === 'undefined' ||
          (typeofParams === 'object' && !params[this._primaryKeyForType(type)])
  }

  _primaryKeyForType (type) {
    const typeOpts = this.lookup(type)
    return typeOpts && typeOpts.primaryKey || this.primaryKey
  }

  _getByKey (type, key) {
    const data = this._data[type]
    const record = data && data[key]
    if (record) {
      return clone(record)
    }
  }

  _getMany (type, params) {
    const data = this._data[type]
    if (data) {
      const keys = Object.keys(data)
      return keys.length && keys.map(key => this._getByKey(type, key)) || []
    }
  }

  _pushOne (type, record) {
    record = this.transform(type, record)
    if (record) {
      let key = record[this._primaryKeyForType(type)]
      if (typeof key !== 'undefined') {
        key = key.toString()
        this._data[type][key] = record
        return this._getByKey(type, key)
      }
    }
  }

  _pushMany (type, records) {
    records = this.transform(type, records, true)
    if (records) {
      return records.length && records.map(record => this._pushOne(type, record)) || []
    }
  }

  _findByKey (type, key) {
    const cached = this._getByKey(type, key)
    return cached && Promise.resolve(cached) || this._fetchByKey(type, key)
  }

  _findMany (type, params) {
    const cached = this._getMany(type, params)
    if (cached && cached.length) {
      return Promise.resolve(cached)
    }
    return this._fetchMany(type, params)
  }

  _fetchByKey (type, key) {
    return assertAdapter(this.adapter) || this.adapter.fetch(type, key).then(data => this._pushOne(type, data))
  }

  _fetchMany (type, params) {
    return assertAdapter(this.adapter) || this.adapter.fetch(type, params).then(data => this._pushMany(type, data))
  }
}
